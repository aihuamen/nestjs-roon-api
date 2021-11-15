import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToClass } from 'class-transformer';
import { Server, Socket } from 'socket.io';
import { SongDto } from '../common';
import { GATEWAY_METADATA } from './roon.constant';
import { CurrentSong } from '../common';
import { RoonService } from './roon.service';

@WebSocketGateway(GATEWAY_METADATA)
export class RoonGateway implements OnGatewayConnection {
  @WebSocketServer()
  wss: Server;

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
