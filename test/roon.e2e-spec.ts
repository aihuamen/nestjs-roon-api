import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Roon Feature', () => {
  let app: INestApplication;
  let agent: request.SuperAgentTest;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    agent = request.agent(app.getHttpServer());
  });

  it('should return music status correctly', async () => {
    let response: request.Response;

    await agent.put('/roon/play');
    // await new Promise((r) => {
    //   setTimeout(r, 2000);
    // });
    response = await agent.get('/roon/current/song');

    expect(response.ok).toBe(true);
    expect(response.body.status).toBe('playing');

    await agent.put('/roon/pause');
    // await new Promise((r) => {
    //   setTimeout(r, 2000);
    // });
    response = await agent.get('/roon/current/song');

    expect(response.ok).toBe(true);
    expect(response.body.status).toBe('paused');
  });

  afterAll(async () => {
    await app.close();
  });
});
