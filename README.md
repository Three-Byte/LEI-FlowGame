# 3-Byte LEI Unit Flow

A PIN-gated "Coming Soon" landing page built with React, Vite, and TypeScript. Deployed to Azure Static Web Apps via GitHub Actions.

## Development

```bash
npm install
npm run dev
```

## Testing

```bash
npm test
```

## Build

```bash
npm run build
```

## Deployment

This project deploys automatically to Azure Static Web Apps on every push to `main`.

### Setup

1. **Create an Azure Static Web App** in the Azure Portal (or via Azure CLI)
2. Copy the **deployment token** from the Static Web App's settings
3. Add the token as a GitHub repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. Push to `main` — the GitHub Action will build, test, and deploy

### GitHub Secret Required

| Secret Name | Description |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token from Azure Static Web Apps |

## PIN Access

The site is gated behind a 4-digit PIN code (`5555`). This is a soft UX gate for pre-release access, not a security boundary.
