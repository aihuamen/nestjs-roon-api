import {
  Injectable,
  ServiceUnavailableException,
  type NestMiddleware,
} from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { RoonService } from '../providers/roon.service.js';

@Injectable()
export class RoonReadyMiddleware implements NestMiddleware {
  constructor(private roonservice: RoonService) {}

  use(
    _req: FastifyRequest['raw'],
    _res: FastifyReply['raw'],
    next: (error?: unknown) => void,
  ) {
    if (!this.roonservice.isReady) {
      next(new ServiceUnavailableException('Roon is not ready yet!'));
      return;
    }
    next();
  }
}
