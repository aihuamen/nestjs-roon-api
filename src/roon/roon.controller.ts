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
  StreamableFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { SongDto } from './roon.dto.js';
import { ImageResult } from './roon.interface.js';
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
  async toggleMusic() {
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
  async getCurrentImage(@Res() res: Response) {
    if (!this.roonService.currentSong) {
      throw new BadRequestException('No current song available');
    }
    if (!this.roonService.currentSong.image_key) {
      throw new BadRequestException('This song does not have image!');
    }
    const { type, image } = await this.roonService.getImage(
      this.roonService.currentSong.image_key,
    );
    res.contentType(type);
    res.end(image, 'binary');
  }

  @Put('browse/:key')
  async doBrowse(@Param('key') key: string) {
    return this.roonService.browseList(key);
  }

  @Get('/image/:key')
  async getImage(
    @Param('key') key: string,
    @Query('size') size: string,
    @Res() res: Response,
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
    res.contentType(type);
    return new StreamableFile(image);
    // res.end(image, 'binary')
  }

  @Get('setting')
  getSetting() {
    return this.roonService.playerSetting;
  }
}
