import { Test, TestingModule } from '@nestjs/testing';
import { RoonService } from './roon.service';

describe('RoonService', () => {
  let service: RoonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoonService],
    }).compile();

    service = module.get<RoonService>(RoonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
