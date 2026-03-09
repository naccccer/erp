import { ForbiddenException, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  REQUIRED_PERMISSION_METADATA_KEY,
  type PermissionKey,
} from './require-permission.decorator.ts';
import {
  resolveTenantRequestContext,
  type RequestWithTenantContext,
} from './request-context.ts';

@Injectable()
export class TenantPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<PermissionKey>(
      REQUIRED_PERMISSION_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithTenantContext>();
    const tenantContext = resolveTenantRequestContext(request);

    const hasPermission = tenantContext.permission_keys.includes('*')
      || tenantContext.permission_keys.includes(requiredPermission);

    if (!hasPermission) {
      throw new ForbiddenException(`Permission "${requiredPermission}" is required.`);
    }

    return true;
  }
}
