import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoonModule } from './roon/roon.module';
import { DiscordModule } from './discord/discord.module';
import { FileModule } from './file/file.module';

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
export class AppModule {}
