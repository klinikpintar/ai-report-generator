export const UserRole = {
  ADMIN: "ADMIN",
  BUSINESS_ANALYST: "BUSINESS_ANALYST",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
};