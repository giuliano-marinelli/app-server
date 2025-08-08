# App _2025_

_On this project we had the **backend** code._

It's a [Nest](https://nestjs.com/) project that serves the [app-client](https://github.com/giuliano-marinelli/app-client) via [Express](https://expressjs.com). It uses [GraphQL](https://graphql.org/) + [Apollo](https://www.apollographql.com/) for query the application endpoints, [JWT](https://jwt.io/) for authentication via token, with [device-detector-js](https://github.com/etienne-martin/device-detector-js) for secure sessions, [CASL](https://casl.js.org/) for authorization management, [TypeORM](https://typeorm.io/) for database schema and queries, and [class-validator](https://github.com/typestack/class-validator) for specific attributes validations. By default it's conneted to a [PostgreSQL](https://www.postgresql.org/) datasource, but it can be used with most databases (including [MySQL](https://www.mysql.com/), [MongoDB](https://www.mongodb.com/), [SQLServer](https://www.microsoft.com/es-es/sql-server), [MariaDB](https://mariadb.org/), etc).

Additionally, it uses [GraphQL Filters](https://github.com/giuliano-marinelli/nestjs-graphql-filter) for easily create and use Where and Order input types and Selection Set management.

## Setup

1. Install [Node.js](https://nodejs.org)
2. Install the DBMS you want, by default install [PostgreSQL](https://www.postgresql.org/)
3. From project root folder install all the dependencies: `npm install`
4. For serve [app-client](https://github.com/giuliano-marinelli/app-client), it must be located at sibling folder of this project, as shown:

```
app
└─ app-client
└─ app-server
   └─ uploads (this is where server saves users uploaded files)
```

## Run

### Development

Run `npm run start:dev` or `npm run start:watch`: execute [nest start](https://docs.nestjs.com/cli/usages#nest-start) that compiles and runs the server in watch mode (if corresponding command is used) and put it listening at [localhost:3000](http://localhost:3000) where [app-client](https://github.com/giuliano-marinelli/app-client) is hosted and accessible. Any change on source code automatically creates a new bundle if in watch mode.

Run `npm run start:debug`: execute [nest start](https://docs.nestjs.com/cli/usages#nest-start) in debug and watch mode for showing debug information on console, including breakpoints and stack traces.

### Production

Run `npm run build`: execute [nest build](https://docs.nestjs.com/cli/usages#nest-build) that compiles to **dist** folder at the project root folder for been used with [node](https://nodejs.org).

Run `npm run start:prod`: execute [node](https://nodejs.org) command over **dist/main** folder to start server at [localhost:3000](http://localhost:3000).

### Format and Lint

Run `npm run format`: formats the code using [Prettier](https://prettier.io/), which enforces a consistent style.

Run `npm run lint`: runs [ESLint](https://eslint.org/) to lint the code, for catching potential errors and enforcing coding standards.

Run `npm run lint:fix`: runs [ESLint](https://eslint.org/) to lint the code, and automatically fix linting errors and warnings.

### Test

Run `npm run test` or `npm run test:watch`: executes [jest](https://jestjs.io/) to run the unit tests in watch mode (if corresponding command is used). Any change on source code automatically creates a new bundle if in watch mode.

Run `npm run test:cov`: executes [jest](https://jestjs.io/) to run the unit tests and generate a code coverage report.

Run `npm run test:e2e`: executes [jest](https://jestjs.io/) to run the end-to-end tests.
