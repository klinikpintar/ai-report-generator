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

export interface IUserFinder {
  /**
   * Get users with pagination and optional role filter
   * @param page - The page number (default: 1)
   * @param limit - The number of items per page (default: 10)
   * @param role - Optional role filter
   * @returns Promise<{ users: User[]; totalPages: number; totalItems: number }>
   * The list of users and pagination info
   * */
  getUsers(
    page?: number,
    limit?: number,
    role?: Role
  ): Promise<{
    users: User[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>; 
}
