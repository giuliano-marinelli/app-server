import { PipeTransform } from '@nestjs/common';

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { Upload } from 'graphql-upload-ts';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

export class UploadTransform implements PipeTransform {
  async transform(value: Upload) {
    return await transformUpload(value);
  }
}

const transformUpload = async (upload: any) => {
  if (!upload) return null;

  // create the uploads directory if it doesn't exist
  const dir = join(__dirname, '..', '..', 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }

  // get the filename and read stream from the upload promise object
  const { createReadStream } = await upload;
  const readStream = createReadStream();

  // generate a unique filename
  const filename = uuid() + '.png';

  // save the file into the uploads directory
  readStream.pipe(createWriteStream(join(dir, filename)));

  return '/public/' + filename;
};
