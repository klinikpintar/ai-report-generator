const units = {
  s: 1000, // Seconds to milliseconds
  m: 60 * 1000, // Minutes to milliseconds
  h: 60 * 60 * 1000, // Hours to milliseconds
  d: 24 * 60 * 60 * 1000, // Days to milliseconds
  w: 7 * 24 * 60 * 60 * 1000, // Weeks to milliseconds
  mo: 30 * 24 * 60 * 60 * 1000, // Months to milliseconds
  y: 365 * 24 * 60 * 60 * 1000, // Years to milliseconds
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