import prisma from "@/lib/prisma";
import {
  CreateUserDto,
  IUserCreator,
  IUserFinder,
  User,
} from "@backend/interfaces/IUsersService";
import {
  BadRequestResponse,
  ConflictResponse,
} from "@backend/utils/exceptions";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

class UsersService implements IUserCreator, IUserFinder {
  async createUser(data: CreateUserDto): Promise<User> {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestResponse(
        "Password and confirm password must be the same"
      );
    }

    const userCount = await prisma.user.count({ where: { email: data.email } });
    if (userCount > 0) {
      throw new ConflictResponse("Email already exists");
    }

    const userWithHashedPassword = {
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      role: data.role,
      isActive: true,
    };

    const user = await prisma.user.create({
      data: userWithHashedPassword,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return user;
  }

  async getUsers(
    page: number = 1,
    limit: number = 10,
    role?: string
  ): Promise<{
    users: User[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }> {
    const where = role ? { role: role as Role } : {};

    const [users, totalItems] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems: totalItems,
    };
  }
}

class UsersServiceSingleton {
  private static instance: UsersService;

  public static getInstance(): UsersService {
    if (!UsersServiceSingleton.instance) {
      UsersServiceSingleton.instance = new UsersService();
    }
    return UsersServiceSingleton.instance;
  }
}

const usersService = UsersServiceSingleton.getInstance();
export default usersService;
