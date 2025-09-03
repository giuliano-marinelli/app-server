# App _2025_

_This repository contains the **backend**._

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

## Progressive Web App (PWA)

Both client and server are configured to support PWA features, allowing for a more app-like experience on the web. This includes service workers for offline support, as well as manifest files for home screen installation.

For allow PWA features, the application must be served over HTTPS, which is already configured in the server. Also, it is necessary to provide a valid SSL certificate.

For development, self-signed certificates can be used. Use [mkcert](https://github.com/FiloSottile/mkcert) to create and install a local CA (Certificate Authority) and generate locally trusted certificates.

Firstly, install mkcert by following the instructions in the [mkcert repository](https://github.com/FiloSottile/mkcert#installation).

Then, run the following commands to create and install the local CA:

```bash
mkcert -install
```

After the CA is installed, you can generate a certificate and key for your local server:

```bash
cd ./src/ssl # navigate to the ssl folder
mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1 192.168.1.40
# replace the IP address with your host IP in the LAN for access in other devices
```

This will create two files: `cert.pem` (the certificate) and `key.pem` (the private key). These files will be used by the server to establish secure HTTPS connections.

If you want to access the PWA features from other devices in your local network, make sure to use the host IP address (e.g., `192.168.1.40`) in the `mkcert` command. **And more important**, you have to copy and set the `rootCA.pem` file into your device's trusted CA store.

You can find the `rootCA.pem` file by using the next command after **mkcert** has been installed in your host:

```bash
mkcert -CAROOT
```

In **Android** you have to go to `Settings > Security & Privacy > Advanced (sometimes)  > Install certificate from storage` and add the copied `rootCA.pem`.

See more about this at [mkcert documentation](https://github.com/FiloSottile/mkcert?tab=readme-ov-file#installing-the-ca-on-other-systems)
