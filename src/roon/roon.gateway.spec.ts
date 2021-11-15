import { Test, TestingModule } from '@nestjs/testing';
import { RoonGateway } from './roon.gateway';

describe('RoonGateway', () => {
  let gateway: RoonGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoonGateway],
    }).compile();

    gateway = module.get<RoonGateway>(RoonGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
