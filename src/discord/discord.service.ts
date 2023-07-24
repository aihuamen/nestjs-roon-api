import {
  Injectable,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Client } from 'discord-rpc';
import { type CurrentSong } from '../roon/roon.interface.js';
import { DISCORD_CLIENT_ID } from './discord.constant.js';

@Injectable()
export class DiscordService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private client: Client;
  private isReady = false;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({ transport: 'ipc' });
  }

  async onApplicationBootstrap() {
    const clientId = this.configService.get<string>(DISCORD_CLIENT_ID) ?? '';
    try {
      this.client = await this.client.login({ clientId });
      this.isReady = true;
      await this.client.setActivity({
        state: 'Chillyyy',
        details: 'Yee',
        instance: false,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async onApplicationShutdown() {
    if (!this.isReady) return;
    await this.client.clearActivity();
    await this.client.destroy();
  }

  @OnEvent('music.playing')
  async updateRichPresencePlay(currentSong: CurrentSong) {
    if (!this.isReady) return;
    const { title, artist, album, seek_position, length } = currentSong;
    const startTimestamp = Math.round(
      new Date().getTime() / 1000 - seek_position,
    );
    const endTimestamp = Math.round(startTimestamp + length);

    await this.client.setActivity({
      details: title.length < 2 ? `${title}  ` : title,
      state: `${
        artist.length <= 128 ? artist : artist.substring(0, 128)
      } - ${album}`,
      instance: false,
      startTimestamp,
      endTimestamp,
      largeImageKey: 'roon-main',
      smallImageKey: 'play-symbol',
      smallImageText: 'Play',
    });
  }

  @OnEvent('music.paused')
  async updateRichPresencePause(currentSong: CurrentSong) {
    if (!this.isReady) return;
    const { title, artist, album } = currentSong;

    await this.client.setActivity({
      details: '[Paused] ' + title,
      state: `${
        artist.length <= 128 ? artist : artist.substring(0, 128)
      } - ${album}`,
      largeImageKey: 'roon-main',
      smallImageKey: 'pause-symbol',
      smallImageText: 'Pause',
      instance: false,
    });
  }

  @OnEvent('music.loading')
  async updateRichPresenceLoad() {
    if (!this.isReady) return;

    await this.client.setActivity({
      details: 'Loading...',
      largeImageKey: 'roon-main',
      smallImageKey: 'roon-small',
      smallImageText: 'Load',
      instance: false,
    });
  }

  @OnEvent('music.stopped')
  async updateRichPresenceStop() {
    if (!this.isReady) return;

    await this.client.setActivity({
      details: 'Not listening',
      largeImageKey: 'roon-main',
      largeImageText: 'Idling in Roon',
      smallImageKey: 'stop-symbol',
      smallImageText: 'Stop',
      instance: false,
    });
  }
}
