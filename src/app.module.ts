import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, minutes } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { GraphQLError } from 'graphql';
import { GraphQLEmailAddress, GraphQLUUID } from 'graphql-scalars';
import { GraphQLUpload } from 'graphql-upload-ts';
import { join } from 'path';

import { CaslFactory } from './casl/casl.factory';
import { GraphQLThrottlerGuard } from './throttler/throttler.guard';

import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { EmailsModule } from './emails/emails.module';
import { SessionsModule } from './sessions/sessions.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    ThrottlerModule.forRoot({
      errorMessage: 'You have exceed the request limit, please try again later.',
      throttlers: [
        {
          ttl: minutes(1),
          limit: 1000
        }
      ]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USERNAME'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        autoLoadEntities: true,
        synchronize: true
      })
    }),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      playground: false,
      uploads: false,
      sortSchema: true,
      context: ({ req, res }) => ({ req, res, casl: new CaslFactory() }),
      formatError: (error: GraphQLError, origError: any) => {
        return error;
      },
      resolvers: {
        UUID: GraphQLUUID,
        Upload: GraphQLUpload,
        EmailAddress: GraphQLEmailAddress
      }
    }),
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'uploads'),
        serveRoot: '/public',
        serveStaticOptions: {
          index: false,
          extensions: ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webp']
        }
      },
      {
        rootPath: join(__dirname, '..', '..', 'app-client', 'dist', 'app-client', 'browser')
      }
    ),
    AuthModule,
    CaslModule,
    UsersModule,
    SessionsModule,
    EmailsModule,
    SharedModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GraphQLThrottlerGuard
    }
  ]
})
export class AppModule {}
