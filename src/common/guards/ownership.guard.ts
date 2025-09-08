import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../types/user.types';

/**
 * Ownership Guard
 * This guard ensures users can only access their own resources unless they are admins
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceUserId = request.params.userId || request.params.id;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }
    
    // Admins can access any resource
    if (user.role === UserRole.ADMIN) {
      return true;
    }
    
    // Users can only access their own resources
    if (user.sub !== resourceUserId) {
      throw new ForbiddenException('You can only access your own resources');
    }
    
    return true;
  }
}
