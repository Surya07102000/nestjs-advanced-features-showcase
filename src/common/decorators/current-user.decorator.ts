import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from '../types/user.types';

/**
 * Custom decorator to extract the current user from the request
 * This decorator extracts the user payload that was attached by the JWT strategy
 */
export const CurrentUser = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext): UserPayload | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserPayload;
    
    return data ? user?.[data] : user;
  },
);
