import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { GraphQLEmailAddress, GraphQLObjectID, GraphQLURL } from 'graphql-scalars';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { SessionsModule } from './sessions/sessions.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.development.env',
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI')
      })
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'app-client', 'dist', 'app-client', 'browser'),
      exclude: ['/api/(.*)', '/graphql']
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      playground: false,
      sortSchema: true,
      resolvers: {
        ObjectID: GraphQLObjectID,
        EmailAddress: GraphQLEmailAddress,
        URL: GraphQLURL
      }
    }),
    AuthModule,
    CaslModule,
    UsersModule,
    SessionsModule,
    SharedModule
  ]
})
export class AppModule {}
