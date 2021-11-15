import { Test, TestingModule } from '@nestjs/testing';
import { RoonController } from './roon.controller';

describe('RoonController', () => {
  let controller: RoonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoonController],
    }).compile();

    controller = module.get<RoonController>(RoonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
