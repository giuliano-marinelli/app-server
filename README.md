# App _2024_

_On this project we had the **backend** code._

It's a [Nest](https://nestjs.com/) project that serves the [app-client](https://github.com/giuliano-marinelli/app-client) via [Express](https://expressjs.com). It uses [GraphQL]() for query the application endpoints, [JWT](https://jwt.io/) for authentication via token, with [device-detector-js](https://github.com/etienne-martin/device-detector-js) for secure sessions, [CASL](https://casl.js.org/) for authorization management, [TypeORM](https://typeorm.io/) for database schema and queries, and [class-validator](https://github.com/typestack/class-validator) for specific attributes validations. By default it's conneted to a [PostgreSQL](https://www.postgresql.org/) datasource, but it can be used with most databases (including [MySQL](https://www.mysql.com/), [MongoDB](https://www.mongodb.com/), [SQLServer](https://www.microsoft.com/es-es/sql-server), [MariaDB](https://mariadb.org/), etc).

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

Run `npm start`: execute [nest start](https://docs.nestjs.com/cli/usages#nest-start) that compiles and runs the server and put it listening at [localhost:3000](http://localhost:3000)

Run `npm run start:dev`: execute [nest start --watch](https://docs.nestjs.com/cli/usages#nest-start) that compiles and runs the server and put it listening at [localhost:3000](http://localhost:3000) and any change automatically re-compiles and restart server.

### Production

Run `npm run build`: execute [nest build](https://docs.nestjs.com/cli/usages#nest-build) that generates **dist** folder at the project root folder for been used with node command.

Run `npm run start:prod`: execute `node` command over **dist/main** folder to start server listening at [localhost:3000](http://localhost:3000).
