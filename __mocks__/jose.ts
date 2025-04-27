export const jwtVerify = jest.fn().mockResolvedValue({
  payload: {
    id: "test-user",
    email: "user@example.com",
    role: "ADMIN",
    exp: Math.floor(Date.now() / 1000) + 3600,
  },
});