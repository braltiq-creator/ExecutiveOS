export {
  RUNTIME_ROLES,
  RUNTIME_PERMISSIONS,
  getRoleDefinition,
  resolvePermissions,
  hasPermission,
  isTemporaryAccessActive,
  mergeDelegatedPermissions,
} from "@/runtime/rbac/roles";
export type {
  RuntimeRole,
  RuntimePermission,
  RoleDefinition,
  TemporaryAccessGrant,
  DelegatedAdminGrant,
} from "@/runtime/rbac/roles";
