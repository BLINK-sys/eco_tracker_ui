import React from 'react';
import { useAccessControl } from '../hooks/useAccessControl';

interface AccessControlProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const AccessControl: React.FC<AccessControlProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children
}) => {
  const { hasAccess, hasAnyAccess, hasAllAccess, isLoading } = useAccessControl();

  if (isLoading) {
    return <>{fallback}</>;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  
  const hasRequiredAccess = requireAll 
    ? hasAllAccess(permissions as any[])
    : hasAnyAccess(permissions as any[]);

  if (!hasRequiredAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AccessControl;
