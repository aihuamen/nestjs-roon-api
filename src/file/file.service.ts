import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { DEFAULT_IMAGE_TYPE, IMAGE_PATH } from './file.constant';

@Injectable()
export class FileService {
  getImage(id: string, type?: string) {
    return readFile(this.getImagePath(id, type));
  }

  async checkImageExist(id: string, type?: string) {
    return existsSync(this.getImagePath(id, type));
  }

  async saveImage(id: string, content: Buffer, type?: string) {
    if (!existsSync(IMAGE_PATH)) {
      await mkdir(IMAGE_PATH);
    }
    await writeFile(this.getImagePath(id, type), content);
  }

  private getImagePath(id: string, type = DEFAULT_IMAGE_TYPE) {
    const [, p] = type.split('/');
    return join(IMAGE_PATH, `${id}.${p}`);
  }
}
