import { SetMetadata, applyDecorators } from '@nestjs/common';
import {
  Throttle as NestJSThrottle,
  Resolvable,
  ThrottlerGenerateKeyFunction,
  ThrottlerGetTrackerFunction
} from '@nestjs/throttler';

interface ThrottlerExceptionMessageInfo {
  limit?: number;
  ttl?: number;
  timeToExpire?: number;
  totalHits?: number;
}

interface ThrottlerMethodOrControllerOptions {
  limit?: Resolvable<number>;
  ttl?: Resolvable<number>;
  getTracker?: ThrottlerGetTrackerFunction;
  generateKey?: ThrottlerGenerateKeyFunction;
  exceptionMessage?: ((data: ThrottlerExceptionMessageInfo) => string) | string;
}

export const THROTTLER_EXCEPTION_MESSAGES = 'THROTTLER:EXCEPTION_MESSAGES';

export const Throttle = (options: Record<string, ThrottlerMethodOrControllerOptions>) =>
  applyDecorators(
    SetMetadata(
      THROTTLER_EXCEPTION_MESSAGES,
      Object.fromEntries(
        Object.entries(options).map(([throttleName, throttleConfig]) => [throttleName, throttleConfig.exceptionMessage])
      )
    ),
    NestJSThrottle(options)
  );
