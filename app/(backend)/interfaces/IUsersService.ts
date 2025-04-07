import { Role } from "@prisma/client";

export type CreateUserDto = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
};

export interface IUserCreator {
  /**
   * Create a new user
   * @param data - Required fields to create a user
   * @returns Promise<User> The created user
   */
  createUser(data: CreateUserDto): Promise<User>;
}
