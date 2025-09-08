import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract request metadata
 * This decorator can extract various request information like IP, user agent, etc.
 */
export const RequestMetadata = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): any => {
    const request = ctx.switchToHttp().getRequest();
    
    const metadata = {
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
    };
    
    return data ? metadata[data] : metadata;
  },
);
