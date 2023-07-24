import {
  type OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';
import type { Server, Socket } from 'socket.io';
import { SongDto } from '../roon.dto.js';
import { GATEWAY_METADATA } from '../roon.constant.js';
import { type CurrentSong } from '../roon.interface.js';
import { RoonService } from './roon.service.js';

@WebSocketGateway(GATEWAY_METADATA)
export class RoonGateway implements OnGatewayConnection {
  @WebSocketServer()
  wss!: Server;

  constructor(private readonly roonService: RoonService) {}

  handleConnection(socket: Socket) {
    socket.emit(
      'currentSong',
      plainToClass(SongDto, this.roonService.currentSong),
    );
  }

  @OnEvent('music.*')
  handleMusicChange(currentSong: CurrentSong) {
    this.wss.emit('currentSong', plainToClass(SongDto, currentSong));
  }
}
