import { timeConvertMs } from '@/app/(backend)/utils/timeUtils';
const DEV_FALLBACK_KEY = '3a6cf3ffafdd79ff6703e6d7f399b9fccb42accbb974e80586ac3653104bba2c';

const config = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? "access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? "refresh_secret",
  JWT_ACCESS_EXPIRES: timeConvertMs(process.env.JWT_ACCESS_EXPIRES ?? "1h"),
  JWT_REFRESH_EXPIRES: timeConvertMs(process.env.JWT_REFRESH_EXPIRES ?? "7d"),
  NODE_ENV: process.env.NODE_ENV ?? "development",
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
  ENCRYPTION_KEY:
    process.env.NODE_ENV === 'production'
      ? process.env.ENCRYPTION_KEY ?? (() => { throw new Error('ENCRYPTION_KEY must be set in production'); })()
      : process.env.ENCRYPTION_KEY ?? DEV_FALLBACK_KEY,
};

export default config;
