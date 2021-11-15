import { DynamicModule, Module } from '@nestjs/common';
import { RoonService } from './roon.service';
import { RoonController } from './roon.controller';
import { RoonGateway } from './roon.gateway';
import { RoonModuleConfig } from '../common';
import { ROON_CONFIG } from './roon.constant';

@Module({})
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
