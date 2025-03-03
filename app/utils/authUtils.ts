/**
 * Extract JWT Token from Authorization Header
 * @param authHeader - Authorization header
 * @returns JWT token or null if not found
 */
export const extractToken = (authHeader: string) => {
  return authHeader?.split(" ")[1] || null;
};

/**
 * Extract Refresh Token from Cookie
 * @param cookie - Cookie header
 * @returns Refresh token or null if not found
 */
export const extractRefreshToken = (cookie: string) => {
  return cookie?.split("refresh_token=")[1]?.split(";")[0] || null;
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
  const match = time.match(/^(\d+)([smhdwmoy])$/);
  const [, value, unit] = match as [string, string, keyof typeof units];

  return parseInt(value) * units[unit];
};
