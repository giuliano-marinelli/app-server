import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { CaslAbilityFactory } from './casl-ability.factory';
import { PoliciesGuard } from './casl.guard';

import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [CaslAbilityFactory, { provide: APP_GUARD, useClass: PoliciesGuard }],
  exports: [CaslAbilityFactory]
})
export class CaslModule {}
