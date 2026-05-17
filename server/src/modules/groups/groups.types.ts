export interface CreateGroupInput {
  name: string;
  description?: string;
}

export interface AssignUserGroupPermissionInput {
  userId: string;
  groupId: string;
}
