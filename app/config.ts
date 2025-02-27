import dotenv from "dotenv";
dotenv.config();

const config = {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "access_secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "refresh_secret",
  JWT_ACCESS_EXPIRES: parseInt(process.env.JWT_ACCESS_EXPIRES || "3600", 10),
  JWT_REFRESH_EXPIRES: parseInt(process.env.JWT_REFRESH_EXPIRES || "86400", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
};

export default config;
