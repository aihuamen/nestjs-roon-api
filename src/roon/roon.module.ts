import { DynamicModule, Module } from '@nestjs/common';
import { RoonService } from './providers/roon.service.js';
import { RoonController } from './roon.controller.js';
import { RoonGateway } from './providers/roon.gateway.js';
import { RoonModuleConfig } from './roon.interface.js';
import { ROON_CONFIG } from './roon.constant.js';
import { FileModule } from '../file/file.module.js';

@Module({
  imports: [FileModule],
})
export class RoonModule {
  static register(config: RoonModuleConfig): DynamicModule {
    return {
      module: RoonModule,
      providers: [
        {
          provide: ROON_CONFIG,
          useValue: config,
        },
        RoonService,
        RoonGateway,
      ],
      controllers: [RoonController],
    };
  }
}
