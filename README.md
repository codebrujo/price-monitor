# This is simple express boilerplate

## Environment

- PostgreSQL (v12+) is up and running

- NodeJS (v13.9+) is installed

## Setup

(1) Create .env file with the same variables as mentioned in .env.example file:

- NODE_ENV=, development or production

- DEFAULT_PORT=, default app port if not specified in process.env.PORT

- JWT_SECRET=, session secret

- APP_HOST=, app host name without protocol (e.g. da4c-31-134-191-40.ngrok.io)

- API_HOST=, api host name without protocol (e.g. api.example.com)

- POSTGRES_DB=, name of PostgreSQL database

- POSTGRES_HOST=, PostgreSQL hostname

- POSTGRES_PORT=, PostgreSQL port

- POSTGRES_USER=, PostgreSQL user

- POSTGRES_PASSWORD=, POSTGRES_USER password

The following variables are used for QA/development purposes only, leave blank for production environment:

- EXPOSED_PROTOCOL=, blank, http or https, force application exposing specified protocol (http is default value)

- CERT_PEM_PATH=, relative path to SSL certificate file (.pem). Applicable for 'EXPOSED_PROTOCOL=https' only.

- CERT_KEY_PATH=, relative path to private key of SSL certificate (.key file). Applicable for 'EXPOSED_PROTOCOL=https' only.

(2) Install dependencies: npm i

(3) Run 'npm run initDb' to initialize database.

(4) Replace ./public files with appropriate frontend build

All migrations are applied automatically when any of 'Run server' command called

## Run server

'npm run devsrv' for development environment
'npm run server' for production environment

## Run client

Open browser with the url '{{protocol}}://{{host}}:{{port}}/', e.g. 'http://localhost:8080/' for development environment

## Run tests

Create a separate database named {POSTGRES_DB}\_test
run 'npm run test' to start tests
