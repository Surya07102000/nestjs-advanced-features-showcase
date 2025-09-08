import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Custom decorator to mark routes as public (no authentication required)
 * This decorator sets metadata that can be read by the JwtAuthGuard
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
