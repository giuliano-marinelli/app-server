import { ApolloDriver } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';

import { GraphQLError } from 'graphql';
import { GraphQLEmailAddress, GraphQLURL, GraphQLUUID } from 'graphql-scalars';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { CaslModule } from './casl/casl.module';
import { SessionsModule } from './sessions/sessions.module';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
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
      sortSchema: true,
      formatError: (error: GraphQLError) => {
        // here we can format the error messages if we want
        return error;
      },
      resolvers: {
        UUID: GraphQLUUID,
        EmailAddress: GraphQLEmailAddress,
        URL: GraphQLURL
      }
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'app-client', 'dist', 'app-client', 'browser'),
      exclude: ['/api/(.*)', '/graphql']
    }),
    AuthModule,
    CaslModule,
    UsersModule,
    SessionsModule,
    SharedModule
  ]
})
export class AppModule {}
