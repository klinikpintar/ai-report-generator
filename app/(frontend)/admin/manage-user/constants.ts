import { User } from "./types/user";

export const mockUsers: User[] = [
  {
    id: "1d305868-e285-44df-8fb4-9e24ad73f0a1",
    email: "admin@gmail.com",
    name: "Admin",
    role: "ADMIN",
    isActive: true,
  },
  {
    id: "2d305868-e285-44df-8fb4-9e24ad73f0a2",
    email: "rudi@gmail.com",
    name: "Rudi",
    role: "BUSINESS_ANALYST",
    isActive: false,
  }
]
