import { timeConvertMs } from '@/app/(backend)/utils/timeUtils';

const config = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "refresh_secret",
  JWT_ACCESS_EXPIRES: timeConvertMs(process.env.JWT_ACCESS_EXPIRES ?? "1h"),
  JWT_REFRESH_EXPIRES: timeConvertMs(process.env.JWT_REFRESH_EXPIRES ?? "7d"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10)
};

export default config;
