import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import { ROON_CONFIG } from '../roon.constant.js';
import { RoonService } from './roon.service.js';

describe('RoonService', () => {
  let service: RoonService;

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
    }).compile();

    service = module.get(RoonService);
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to call play', async () => {
    const playFn = jest.spyOn(service, 'play');
    const promisifyTransport = jest
      .spyOn(RoonService.prototype as any, 'promisifyTransportMethod')
      .mockImplementation(() => Promise.resolve());
    await service.play();
    expect(playFn).toBeCalled();
    expect(promisifyTransport).toBeCalled();
  });
});
