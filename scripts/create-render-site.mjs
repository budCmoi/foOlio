const apiKey = process.env.RENDER_API_KEY
const explicitOwnerId = process.env.RENDER_OWNER_ID

const config = {
  serviceName: 'foolio',
  repo: 'https://github.com/budCmoi/foOlio.git',
  branch: 'main',
  buildCommand: 'npm ci --include=dev && npm run build',
  publishPath: 'dist',
  nodeVersion: '22.22.0',
}

if (!apiKey) {
  console.error('Missing RENDER_API_KEY. Create a Render API key and set it before running this script.')
  process.exit(1)
}

async function renderRequest(path, options = {}) {
  const response = await fetch(`https://api.render.com${path}`, {
    ...options,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const data = text ? safeJsonParse(text) : null

  if (!response.ok) {
    const detail = data ? JSON.stringify(data, null, 2) : text
    throw new Error(`${response.status} ${response.statusText}\n${detail}`)
  }

  return data
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value)
  }
  catch {
    return null
  }
}

async function resolveOwnerId() {
  if (explicitOwnerId) {
    return explicitOwnerId
  }

  const owners = await renderRequest('/v1/owners?limit=20')

  if (!Array.isArray(owners) || owners.length === 0) {
    throw new Error('No Render workspace available for the provided API key.')
  }

  if (owners.length > 1) {
    const names = owners.map((entry) => `${entry.owner.name} (${entry.owner.id})`).join(', ')
    throw new Error(`Multiple Render workspaces found. Set RENDER_OWNER_ID explicitly. Available: ${names}`)
  }

  return owners[0].owner.id
}

async function findExistingService(ownerId) {
  const params = new URLSearchParams({
    limit: '20',
    includePreviews: 'false',
    ownerId,
    name: config.serviceName,
  })

  const services = await renderRequest(`/v1/services?${params.toString()}`)

  return Array.isArray(services)
    ? services.find((entry) => entry.service?.name === config.serviceName)
    : null
}

async function createService(ownerId) {
  return renderRequest('/v1/services', {
    method: 'POST',
    body: JSON.stringify({
      type: 'static_site',
      name: config.serviceName,
      ownerId,
      repo: config.repo,
      branch: config.branch,
      autoDeploy: 'yes',
      buildCommand: config.buildCommand,
      publishPath: config.publishPath,
      pullRequestPreviewsEnabled: true,
      envVars: [
        {
          key: 'NODE_VERSION',
          value: config.nodeVersion,
        },
        {
          key: 'SKIP_INSTALL_DEPS',
          value: 'true',
        },
      ],
    }),
  })
}

async function addSpaRewrite(serviceId) {
  try {
    await renderRequest(`/v1/services/${serviceId}/routes`, {
      method: 'POST',
      body: JSON.stringify({
        type: 'rewrite',
        source: '/*',
        destination: '/index.html',
        priority: 0,
      }),
    })
  }
  catch (error) {
    console.warn('SPA rewrite could not be added automatically.')
    console.warn(String(error))
  }
}

async function main() {
  const ownerId = await resolveOwnerId()
  const existing = await findExistingService(ownerId)

  if (existing?.service) {
    console.log(`Render service already exists: ${existing.service.name}`)
    console.log(`Dashboard: ${existing.service.dashboardUrl}`)
    console.log(`URL: ${existing.service.url || 'not available yet'}`)
    return
  }

  const created = await createService(ownerId)
  const service = created?.service

  if (!service?.id) {
    throw new Error('Render did not return a service id after creation.')
  }

  await addSpaRewrite(service.id)

  console.log('Render service created successfully.')
  console.log(`Dashboard: ${service.dashboardUrl}`)
  console.log(`URL: ${service.url || 'not available yet'}`)
}

main().catch((error) => {
  console.error('Render site creation failed.')
  console.error(error)
  process.exit(1)
})