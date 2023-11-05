import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { type FastifyReply } from 'fastify';
import { SongDto } from './roon.dto.js';
import { type ImageResult } from './roon.interface.js';
import { RoonService } from './providers/roon.service.js';

@Controller('roon')
export class RoonController {
  constructor(private roonService: RoonService) {}

  @Put('play')
  async playMusic() {
    await this.roonService.play();
    return 'play';
  }

  @Put('pause')
  async pauseMusic() {
    await this.roonService.pause();
    return 'pause';
  }

  @Put('playpause')
  async togglePlayPauseMusic() {
    await this.roonService.togglePlayPause();
    return 'play/pause';
  }

  @Put('mute')
  async muteMusic() {
    await this.roonService.mute();
    return 'mute';
  }

  @Put('unmute')
  async unmuteMusic() {
    await this.roonService.unmute();
    return 'unmute';
  }

  @Put('toggleMute')
  async toggleMuteMusic() {
    await this.roonService.toggleMute();
    return 'mute/unmute';
  }

  @Put('shuffle')
  async shuffleList() {
    await this.roonService.shuffle();
    return 'shuffle';
  }

  @Put('unshuffle')
  async unshuffleList() {
    await this.roonService.unshuffle();
    return 'unshuffle';
  }

  @Put('toggleShuffle')
  async toggleShuffleList() {
    await this.roonService.toggleShuffle();
    return 'toggleShuffle';
  }

  @Put('volume/:vol')
  async changeVolume(@Param('vol', ParseIntPipe) vol: number) {
    await this.roonService.changeVolume(vol);
    return `volume: ${vol}`;
  }

  @Put('status')
  setStatus(@Body() { status }: { status: string }) {
    this.roonService.setStatus(status);
    return 'status';
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('/current/song')
  getCurrentSong() {
    if (!this.roonService.currentSong) {
      throw new BadRequestException('No current song available');
    }
    return new SongDto(this.roonService.currentSong);
  }

  @Get('/current/image')
  async getCurrentImage(@Res() res: FastifyReply) {
    if (!this.roonService.currentSong) {
      throw new BadRequestException('No current song available');
    }
    if (!this.roonService.currentSong.image_key) {
      throw new BadRequestException('This song does not have image!');
    }
    const { type, image } = await this.roonService.getImage(
      this.roonService.currentSong.image_key,
    );
    await res.type(type).send(image);
  }

  @Put('browse/:key')
  async doBrowse(@Param('key') key: string) {
    return this.roonService.browseList(key);
  }

  @Get('/image/:key')
  async getImage(
    @Param('key') key: string,
    @Query('size') size: string,
    @Res() res: FastifyReply,
  ) {
    let result: ImageResult;
    if (size) {
      result = await this.roonService.getImage(key, {
        scale: 'fit',
        width: Number(size),
        height: Number(size),
      });
    } else {
      result = await this.roonService.getImage(key);
    }
    const { type, image } = result;
    await res.type(type).send(image);
  }

  @Get('setting')
  getSetting() {
    return this.roonService.playerSetting;
  }
}
