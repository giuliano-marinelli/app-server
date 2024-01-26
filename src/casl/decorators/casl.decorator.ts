import { SetMetadata } from '@nestjs/common';

import { Action } from '../casl-ability.factory';

export type Policy = (args, selectionsSet?) => { action: Action; subject: string; fields?: any };

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...policies: Policy[]) => SetMetadata(CHECK_POLICIES_KEY, policies);
