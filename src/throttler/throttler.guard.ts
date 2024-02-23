import { ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  ThrottlerException,
  ThrottlerGenerateKeyFunction,
  ThrottlerGetTrackerFunction,
  ThrottlerGuard,
  ThrottlerOptions
} from '@nestjs/throttler';
import { ThrottlerLimitDetail } from '@nestjs/throttler/dist/throttler.guard.interface';

import { THROTTLER_EXCEPTION_MESSAGES } from './decorators/throttler.decorator';

@Injectable()
export class GraphQLThrottlerGuard extends ThrottlerGuard {
  protected keyToName = new Map<string, string>();

  getRequestResponse(execContext: ExecutionContext) {
    const context = GqlExecutionContext.create(execContext);
    const { req, res } = context.getContext();

    return { req: req, res: res };
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: ThrottlerOptions,
    getTracker: ThrottlerGetTrackerFunction,
    generateKey: ThrottlerGenerateKeyFunction
  ): Promise<boolean> {
    const { req } = this.getRequestResponse(context);
    const tracker = await getTracker(req);
    const key = generateKey(context, tracker, throttler.name);
    this.keyToName.set(key, throttler.name);

    return super.handleRequest(context, limit, ttl, throttler, getTracker, generateKey);
  }

  protected async throwThrottlingException(
    execContext: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail
  ): Promise<void> {
    const context = GqlExecutionContext.create(execContext);

    const throttlerName = this.keyToName.get(throttlerLimitDetail.key);

    const exceptionMessage = this.reflector.get<any>(THROTTLER_EXCEPTION_MESSAGES, context.getHandler())?.[
      throttlerName
    ];

    if (exceptionMessage) {
      if (typeof exceptionMessage === 'function') {
        throw new ThrottlerException(
          exceptionMessage({
            limit: throttlerLimitDetail.limit,
            ttl: throttlerLimitDetail.ttl,
            timeToExpire: throttlerLimitDetail.timeToExpire,
            totalHits: throttlerLimitDetail.totalHits
          })
        );
      } else {
        throw new ThrottlerException(exceptionMessage);
      }
    } else {
      throw new ThrottlerException(await this.getErrorMessage(execContext, throttlerLimitDetail));
    }
  }
}
