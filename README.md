# Claxalt

A modern web application built with [Next.js](https://nextjs.org), TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deployment

This project auto-deploys to **Vercel** on every push to `main` via GitHub Actions.

For pull requests, a preview deployment is created automatically.

### Required GitHub Secrets

To enable auto-deployment, add these secrets to your GitHub repository (`Settings > Secrets and variables > Actions`):

| Secret | How to get it |
|--------|---------------|
| `VERCEL_TOKEN` | [Vercel Dashboard](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Run `npx vercel link` locally → check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Run `npx vercel link` locally → check `.vercel/project.json` |

## Project Structure

```
claxalt/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── public/             # Static assets
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD pipeline
└── next.config.ts      # Next.js config
```
