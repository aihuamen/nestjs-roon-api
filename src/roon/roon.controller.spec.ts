import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { RoonService } from './providers/roon.service.js';
import { ROON_CONFIG } from './roon.constant.js';
import { RoonController } from './roon.controller.js';

describe('RoonController', () => {
  let controller: RoonController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot()],
      providers: [
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
      controllers: [RoonController],
    }).compile();

    controller = module.get(RoonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
