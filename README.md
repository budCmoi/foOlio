# foOlio

Portfolio moderne Vue 3

Ce projet est un portfolio personnel développé avec Vue 3 et Vite, pensé pour présenter des projets de manière immersive et responsive.

## À propos

Je m’appelle Mohamed Ali, ingénieur frontend créatif basé à Paris (ou à distance). Je conçois des espaces numériques immersifs où le mouvement renforce le message, l’interaction devient tangible et le système visuel reste prêt pour la production.

- **Rôle** : Ingénieur frontend créatif
- **Disponibilité** : Sélection de missions au T3 2026
- **Approche** : Narration, architecture évolutive, sensation premium sous contraintes

## Fonctionnalités principales
- Interface responsive mobile-first
- Ajout de projets via une interface privée Prisma
- Génération de pages projet à partir d un brief court
- Amélioration de sections via GPT avec fallback local
- Animations GSAP et transitions fluides
- Navigation dynamique
- Stockage Prisma SQLite des projets personnalisés

## Structure
- Hero d’accueil avec message fort
- Section manifeste (approche)
- Grille de projets dynamiques
- Section contact

## Installation
```bash
npm install
npm run build
npm start
```

Pour le mode studio AI, copier .env.example vers .env puis définir au minimum :

```bash
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"
OPENAI_API_BASE="https://api.openai.com/v1"
```

Si OPENAI_API_KEY est absente, le studio privé garde un générateur local de secours.

## Déploiement
```bash
npm run build
```

### Render

Le projet est prêt pour un déploiement Render Node via le fichier render.yaml à la racine.

- Build command : npm ci --include=dev && npm run build
- Start command : npm run start
- Version Node : 22.22.0 sur Render, avec compatibilité déclarée dans package.json

Si le service Render existe déjà, il doit être resynchronisé avec le dépôt ou relancé depuis le dashboard Render pour prendre en compte cette configuration.

Pour recréer le static site après suppression, un script d'automatisation est aussi disponible dans scripts/create-render-site.mjs.

Exemple d'usage :

1. créer une clé API Render
2. définir RENDER_API_KEY dans l'environnement
3. lancer node scripts/create-render-site.mjs

Le script tente de retrouver le workspace, crée le static site GitHub sur la branche main, injecte NODE_VERSION et SKIP_INSTALL_DEPS, puis ajoute la réécriture SPA vers /index.html.

## Auteur
[budCmoi](https://github.com/budCmoi)

---
