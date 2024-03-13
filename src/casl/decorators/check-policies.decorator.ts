import { SetMetadata } from '@nestjs/common';

import { Action } from '../casl.factory';

export type Policy = (args) => { action: Action; subject: string; fields?: any };

export const CHECK_POLICIES_KEY = 'checkPolicy';
export const CheckPolicies = (...policies: Policy[]) => SetMetadata(CHECK_POLICIES_KEY, policies);
