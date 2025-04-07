import prisma from "@/lib/prisma";
import config from "@backend/config";
import {
  CreateUserDto,
  IUserCreator,
  User,
} from "@backend/interfaces/IUsersService";
import { ConflictResponse } from "@backend/utils/exceptions";
import bcrypt from "bcryptjs";

class UsersService implements IUserCreator {
  async createUser(data: CreateUserDto): Promise<User> {
    const userCount = await prisma.user.count({ where: { email: data.email } });
    if (userCount > 0) {
      throw new ConflictResponse("Email already exists");
    }

    const userWithHashedPassword = {
      name: data.name,
      email: data.email,
      password: await bcrypt.hash(data.password, config.BCRYPT_SALT_ROUNDS),
      role: data.role,
      isActive: true,
    };

    const user = await prisma.user.create({
      data: userWithHashedPassword,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return user;
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
