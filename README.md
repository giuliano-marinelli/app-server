# App _2024_

*On this project we had the **backend** code.*

It's a [Nest](https://nestjs.com/) project that serves the [app-client](https://github.com/giuliano-marinelli/app-client) via [Express](https://expressjs.com). It uses [GraphQL]() for query the application endpoints, [JWT](https://jwt.io/) for authentication via token, [CASL](https://casl.js.org/) for authorization management, and connects with [MongoDB](https://www.mongodb.com/) database using [Mongoose](https://mongoosejs.com/). 

## Setup
1. Install [Node.js](https://nodejs.org) and [MongoDB](https://www.mongodb.com)
2. From project root folder install all the dependencies: `npm install`
3. For serve [app-client](https://github.com/giuliano-marinelli/app-client), it must be located at sibling folder of this project, as shown:
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

Run `npm run start:prod`: execute `node` command over **dist/main** folder  to start server listening at [localhost:3000](http://localhost:3000).
