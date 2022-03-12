import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Put,
  Query,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { SongDto } from './roon.dto';
import { ImageResult } from './roon.interface';
import { RoonService } from './providers/roon.service';

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
  toggleMusic() {
    this.roonService.togglePlayPause();
    return 'play/pause';
  }

  @Put('mute')
  muteMusic() {
    this.roonService.mute();
    return 'mute';
  }

  @Put('unmute')
  unmuteMusic() {
    this.roonService.unmute();
    return 'unmute';
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
    res.end(image, 'binary');
  }
}
