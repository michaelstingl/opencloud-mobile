# OpenCloud Mobile Documentation

This documentation website for the OpenCloud Mobile project is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

## Development

### Installation

```bash
npm install
```

### Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

The documentation is automatically deployed to GitHub Pages when changes are pushed to the main branch.

```bash
# Manual deployment if needed
npm run build
GIT_USER=<Your GitHub username> USE_SSH=true npm run deploy
```

## Documentation Structure

- `/docs` - Main documentation content 
- `/src/pages` - Custom pages including homepage
- `/src/components` - React components for the site
- `/static` - Static assets like images

See the [Docusaurus documentation](https://docusaurus.io/) for more information on how to customize the site.
