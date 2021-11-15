import { Exclude, Transform } from 'class-transformer';
import { CurrentSong } from '../../common/';

export class SongDto {
  title: string;
  artist: string;
  album: string;

  @Transform(
    ({ value }) =>
      `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`,
  )
  seek_position: string;

  @Transform(
    ({ value }) =>
      `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`,
  )
  length: string;

  image_key: string;

  @Exclude()
  one_line: { line1: string };

  @Exclude()
  two_line: { line1: string; line2: string };

  @Exclude()
  three_line: { line1: string; line2: string; line3: string };

  constructor(s: CurrentSong) {
    Object.assign(this, s);
  }
}
