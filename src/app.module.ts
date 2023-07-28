import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RoonModule } from './roon/roon.module.js';
import { DiscordModule } from './discord/discord.module.js';
import { FileModule } from './file/file.module.js';
import { RoonReadyMiddleware } from './roon/middlewares/roon-ready.middleware.js';
import { RoonController } from './roon/roon.controller.js';

@Module({
  imports: [
    RoonModule.register({
      extension_id: 'com.aihuamen.test',
      display_name: 'Roon Nest API Test',
      display_version: '1.0.0',
      publisher: 'Yama K',
      email: 'yama@email.com',
      website: 'https://github.com/aihuamen/Roon_thingy',
      log_level: 'none',
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    DiscordModule,
    ConfigModule.forRoot(),
    FileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RoonReadyMiddleware).forRoutes(RoonController);
  }
}
