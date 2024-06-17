import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { BullModule } from '@nestjs/bull';
import { HealthProcessor } from './health/health.processor';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { ApolloDriver } from '@nestjs/apollo';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'my-queue',
    }),
    UserModule,
    ChatModule,
    MessageModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, HealthProcessor, AppResolver],
})
export class AppModule {}
