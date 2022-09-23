import { DynamicModule, Module } from '@nestjs/common';
import { RoonService } from './providers/roon.service';
import { RoonController } from './roon.controller';
import { RoonGateway } from './providers/roon.gateway';
import { RoonModuleConfig } from './roon.interface';
import { ROON_CONFIG } from './roon.constant';
import { FileModule } from 'src/file/file.module';

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
