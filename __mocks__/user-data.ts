import { User } from "@frontend/admin/manage-user/types/user";

export const adminUser: User = {
  id: "1d305868-e285-44df-8fb4-9e24ad73f0a1",
  email: "maya@gmail.com",
  name: "Maya",
  role: "ADMIN",
  isActive: true,
};

export const businessAnalystUser: User = {
  id: "2d305868-e285-44df-8fb4-9e24ad73f0a2",
  email: "rudi@gmail.com",
  name: "Rudi",
  role: "BUSINESS_ANALYST",
  isActive: false,
};

export const activeUser = adminUser;

export const inactiveUser = businessAnalystUser;

export const mockUsers: User[] = [adminUser, businessAnalystUser];
