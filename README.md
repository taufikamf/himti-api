<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# HIMTI API

## Description
Backend API for HIMTI (Himpunan Mahasiswa Teknik Informatika) website.

## Prerequisites
- Node.js v18 or later
- PostgreSQL 15 or later
- Docker (optional, for containerized deployment)

## Installation

```bash
# Install dependencies
$ npm install
```

## Environment Setup
1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Update the environment variables in `.env` with your values

## Running the Application

### Development Mode
```bash
# Development mode with watch
$ npm run start:dev

# Production mode
$ npm run start:prod
```

### Using Docker
```bash
# Build and start containers
$ docker-compose up -d

# View logs
$ docker-compose logs -f

# Stop containers
$ docker-compose down
```

## Database Migrations

```bash
# Generate migrations
$ npx prisma migrate dev

# Apply migrations
$ npx prisma migrate deploy

# Reset database
$ npx prisma migrate reset
```

## API Documentation
API documentation is available at `/api/docs` when running the application.

## Test

```bash
# Unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Deployment

### Prerequisites
1. Ensure you have Docker and Docker Compose installed
2. Set up your production environment variables
3. Configure your database connection

### Deployment Steps
1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Build and start the containers:
```bash
docker-compose up -d
```

### Production Considerations
- Set `NODE_ENV=production` in your environment
- Use a secure `JWT_SECRET`
- Configure proper database credentials
- Set up SSL/TLS for secure communication
- Implement proper logging and monitoring
- Configure backup strategies for the database

## Support
For support, contact the HIMTI development team.

## License
This project is licensed under the MIT License.
