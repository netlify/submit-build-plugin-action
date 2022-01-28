FROM node:lts-alpine

LABEL "com.github.actions.name"="Submit Netlify Build Plugin"
LABEL "com.github.actions.description"="Submit a Netlify Build Plugin to the plugins directory"
LABEL "com.github.actions.icon"="upload"
LABEL "com.github.actions.color"="green"

LABEL "repository"="https://github.com/netlify/submit-build-plugin-action"
LABEL "homepage"="https://github.com/netlify/submit-build-plugin-action"
LABEL "maintainer"="Netlify"
LABEL "version"="1.0.0"

COPY package.json package-lock.json tsconfig.json /
COPY src/ src/
RUN npm ci
RUN npm run build

ENTRYPOINT ["node", "/dist/bin.js"]
