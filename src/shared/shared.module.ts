import { Module } from '@nestjs/common';

import { SharedService } from './shared.service';

@Module({
  imports: [],
  providers: [SharedService],
  exports: [SharedService]
})
export class SharedModule {}
