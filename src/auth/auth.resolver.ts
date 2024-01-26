import { Args, Context, Query, Resolver } from '@nestjs/graphql';

import { Public } from './decorators/public.decorator';

import { LoginInput } from './dto/login.input';

import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Query(() => String, {
    name: 'login',
    description: 'Login with username or email and password. Returns the token string.'
  })
  async login(@Args('loginInput') loginInput: LoginInput, @Context() context: any) {
    return await this.authService.login(loginInput.usernameOrEmail, loginInput.password, context);
  }
}
