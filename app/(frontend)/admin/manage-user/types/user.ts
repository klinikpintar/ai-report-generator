export type UserRole = "BUSINESS_ANALYST" | "ADMIN";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
};