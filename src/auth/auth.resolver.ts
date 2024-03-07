import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { AuthUser } from '@nestjs!/graphql-filter';

import { Public } from './decorators/public.decorator';

import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Query(() => String, {
    name: 'login',
    description: 'Login with username or email and password. Returns the token string.'
  })
  async login(
    @Args('usernameOrEmail') usernameOrEmail: string,
    @Args('password') password: string,
    @Context() context: any
  ) {
    return await this.authService.login(usernameOrEmail, password, context);
  }

  @Query(() => Boolean, {
    name: 'logout',
    description: 'Logout the current user. Close current session of device.'
  })
  async logout(@Context() context: any) {
    return await this.authService.logout(context);
  }
}
