import express from 'express'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { baseProjects } from '../src/data/projects.js'
import {
  cleanText,
  normalizeProject,
  normalizeProjectCollection,
  parseJsonList,
  sortProjects,
  stringifyJsonList,
} from '../src/lib/project-model.js'

const prisma = new PrismaClient()
const app = express()
const currentFilePath = fileURLToPath(import.meta.url)
const rootDirectory = path.resolve(path.dirname(currentFilePath), '..')
const distDirectory = path.join(rootDirectory, 'dist')
const indexFilePath = path.join(distDirectory, 'index.html')
const port = Number.parseInt(process.env.PORT || '3001', 10)
const reservedProjectIds = baseProjects.map((project) => project.id)
const developmentOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

app.use((request, response, next) => {
  const origin = request.headers.origin

  if (origin && developmentOrigins.has(origin)) {
    response.header('Access-Control-Allow-Origin', origin)
    response.header('Vary', 'Origin')
    response.header('Access-Control-Allow-Headers', 'Content-Type')
    response.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  }

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  next()
})

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

function toApiProject(record) {
  return normalizeProject(
    {
      id: record.id,
      title: record.title,
      description: record.description,
      statement: record.statement,
      year: record.year,
      role: record.role,
      accent: record.accent,
      link: record.link || '',
      images: parseJsonList(record.imagesJson),
      tech: parseJsonList(record.techJson),
      results: parseJsonList(record.resultsJson),
      createdAt: record.createdAt.toISOString(),
    },
    {
      createdAt: record.createdAt.toISOString(),
    },
  )
}

function toPrismaProjectData(project) {
  const createdAt = new Date(project.createdAt)

  return {
    id: project.id,
    title: project.title,
    description: project.description,
    statement: project.statement,
    year: project.year,
    role: project.role,
    accent: project.accent,
    link: cleanText(project.link) || null,
    imagesJson: stringifyJsonList(project.images),
    techJson: stringifyJsonList(project.tech),
    resultsJson: stringifyJsonList(project.results),
    createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
  }
}

async function listProjects() {
  const records = await prisma.project.findMany({
    orderBy: [
      { createdAt: 'desc' },
      { title: 'asc' },
    ],
  })

  return sortProjects(records.map(toApiProject))
}

app.get('/api/health', async (_request, response) => {
  const projectCount = await prisma.project.count()

  response.json({
    ok: true,
    storage: 'prisma',
    projectCount,
  })
})

app.get('/api/projects', async (_request, response) => {
  const projects = await listProjects()
  response.json({ projects })
})

app.get('/api/projects/:id', async (request, response) => {
  const record = await prisma.project.findUnique({
    where: { id: request.params.id },
  })

  if (!record) {
    response.status(404).json({ error: 'Projet introuvable.' })
    return
  }

  response.json({ project: toApiProject(record) })
})

app.post('/api/projects', async (request, response) => {
  const normalizedProject = normalizeProjectCollection([request.body], {
    reservedIds: reservedProjectIds,
  })[0]

  const existingProject = await prisma.project.findUnique({
    where: { id: normalizedProject.id },
  })

  if (existingProject) {
    response.status(409).json({ error: 'Un projet utilise deja cet identifiant.' })
    return
  }

  const createdRecord = await prisma.project.create({
    data: toPrismaProjectData(normalizedProject),
  })

  response.status(201).json({ project: toApiProject(createdRecord) })
})

app.put('/api/projects/:id', async (request, response) => {
  const originalId = request.params.id
  const existingProject = await prisma.project.findUnique({
    where: { id: originalId },
  })

  if (!existingProject) {
    response.status(404).json({ error: 'Impossible de retrouver ce projet personnalise.' })
    return
  }

  const normalizedProject = normalizeProjectCollection([
    {
      ...toApiProject(existingProject),
      ...request.body,
      createdAt: existingProject.createdAt.toISOString(),
    },
  ], {
    reservedIds: reservedProjectIds,
    allowReservedConflicts: true,
  })[0]

  const collidingProject = await prisma.project.findUnique({
    where: { id: normalizedProject.id },
  })

  if (collidingProject && collidingProject.id !== originalId) {
    response.status(409).json({ error: 'Cet identifiant est deja utilise par un autre projet.' })
    return
  }

  const prismaProjectData = toPrismaProjectData(normalizedProject)

  let savedRecord = null

  if (normalizedProject.id === originalId) {
    savedRecord = await prisma.project.update({
      where: { id: originalId },
      data: prismaProjectData,
    })
  }
  else {
    savedRecord = await prisma.$transaction(async (transaction) => {
      const createdRecord = await transaction.project.create({
        data: prismaProjectData,
      })

      await transaction.project.delete({
        where: { id: originalId },
      })

      return createdRecord
    })
  }

  response.json({ project: toApiProject(savedRecord) })
})

app.delete('/api/projects/:id', async (request, response) => {
  const existingProject = await prisma.project.findUnique({
    where: { id: request.params.id },
  })

  if (!existingProject) {
    response.status(404).json({ error: 'Projet introuvable.' })
    return
  }

  await prisma.project.delete({
    where: { id: request.params.id },
  })

  response.status(204).end()
})

app.post('/api/projects/import', async (request, response) => {
  const payload = Array.isArray(request.body)
    ? request.body
    : request.body?.projects

  if (!Array.isArray(payload)) {
    response.status(400).json({ error: 'Le fichier importe doit contenir un tableau de projets.' })
    return
  }

  const normalizedProjects = normalizeProjectCollection(payload, {
    reservedIds: reservedProjectIds,
  })

  await prisma.$transaction(async (transaction) => {
    await transaction.project.deleteMany()

    if (normalizedProjects.length) {
      await transaction.project.createMany({
        data: normalizedProjects.map((project) => toPrismaProjectData(project)),
      })
    }
  })

  response.json({ projects: normalizedProjects })
})

if (existsSync(indexFilePath)) {
  app.use(express.static(distDirectory))

  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(indexFilePath)
  })
}

app.use((error, _request, response, _next) => {
  const message = error instanceof Error ? error.message : 'Erreur serveur Prisma.'
  response.status(400).json({ error: message })
})

const server = app.listen(port, () => {
  console.log(`foOlio Prisma API listening on http://localhost:${port}`)
})

async function shutdown(signal) {
  console.log(`Stopping foOlio Prisma API on ${signal}...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})