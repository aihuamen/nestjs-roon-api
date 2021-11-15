import { RoonApiConstructor } from 'node-roon-api';
import { MusicStatus } from 'node-roon-api-transport';

export type RoonModuleConfig = Pick<
  RoonApiConstructor,
  | 'extension_id'
  | 'display_name'
  | 'display_version'
  | 'email'
  | 'publisher'
  | 'website'
>;

export interface SettingConfig {
  zone: {
    output_id: string;
    name: string;
  };
}

export interface ImageResult {
  type: string;
  image: Buffer;
}

export interface CurrentSong extends MusicStatus {
  title: string;
  artist: string;
  album: string;
}
