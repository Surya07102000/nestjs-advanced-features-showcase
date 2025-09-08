import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../types/user.types';

export const ROLES_KEY = 'roles';

/**
 * Custom decorator to specify required roles for a route
 * This decorator sets metadata that can be read by the RolesGuard
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
