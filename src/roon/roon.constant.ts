/* eslint-disable prettier/prettier */
import { GatewayMetadata } from '@nestjs/websockets';
import { ImageOption } from 'node-roon-api-image';

export const IMAGE_OPTION_DEFAULT: ImageOption = {
  scale: 'fit',
  width: 200,
  height: 200,
};

export const GATEWAY_METADATA: GatewayMetadata = {
  cors: {
    origin: true,
    credentials: true,
  },
};

export const ROON_CONFIG = 'ROON_CONFIG'
