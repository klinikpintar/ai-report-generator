import { UnauthenticatedResponse } from "./exceptions";

/**
 * Extract Refresh Token from Cookie
 * @param cookie - Cookie header
 * @returns Refresh token or null if not found
 */
export const extractToken = (cookie: string, key: string) => {
  const refreshToken = cookie?.split(`${key}=`)[1]?.split(";")[0] || null;
  if (!refreshToken) {
    throw new UnauthenticatedResponse("Unauthorized");
  }
  return refreshToken;
};

const units = {
  s: 1000, // Detik ke milidetik
  m: 60 * 1000, // Menit ke milidetik
  h: 60 * 60 * 1000, // Jam ke milidetik
  d: 24 * 60 * 60 * 1000, // Hari ke milidetik
  w: 7 * 24 * 60 * 60 * 1000, // Minggu ke milidetik
  mo: 30 * 24 * 60 * 60 * 1000, // Bulan ke milidetik
  y: 365 * 24 * 60 * 60 * 1000, // Tahun ke milidetik
};

export const timeConvertMs = (time: string): number => {
  const match = /^(\d+)([smhdwoy])$/.exec(time);
  const [, value, unit] = match as unknown as [
    string,
    string,
    keyof typeof units
  ];

  return parseInt(value) * units[unit];
};
