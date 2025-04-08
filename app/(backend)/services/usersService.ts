import prisma from "@/lib/prisma";
import {
  CreateUserDto,
  IUserCreator,
  User,
} from "@backend/interfaces/IUsersService";
import {
  BadRequestResponse,
  ConflictResponse,
} from "@backend/utils/exceptions";
import bcrypt from "bcryptjs";

class UsersService implements IUserCreator {
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
