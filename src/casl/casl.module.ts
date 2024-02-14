import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { CaslFactory } from './casl.factory';
import { PoliciesGuard } from './casl.guard';

import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [CaslFactory, { provide: APP_GUARD, useClass: PoliciesGuard }],
  exports: [CaslFactory]
})
export class CaslModule {}
