import jwt from "jsonwebtoken";
import config from "../../config";

/**
 * Generate Access Token
 * @param payload - Data payload (id, role)
 * @returns {string} Access Token
 */
export const generateAccessToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES,
  });
};

/**
 * Generate Refresh Token
 * @param payload - Data payload (id)
 * @returns {string} Refresh Token
 */
export const generateRefreshToken = (payload: object): string => {
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES,
  });
};
