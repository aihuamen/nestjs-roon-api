import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { ROON_CONFIG } from '../roon.constant';
import { RoonGateway } from './roon.gateway';
import { RoonService } from './roon.service';

describe('RoonGateway', () => {
  let gateway: RoonGateway;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
        RoonGateway,
        RoonService,
        {
          provide: ROON_CONFIG,
          useValue: {
            extension_id: 'com.aihuamen.test',
            display_name: 'Roon Nest API Test',
            display_version: '1.0.0',
            publisher: 'Yama K',
            email: 'yama@email.com',
            website: 'https://github.com/aihuamen/Roon_thingy',
          },
        },
      ],
    }).compile();

    gateway = module.get(RoonGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
