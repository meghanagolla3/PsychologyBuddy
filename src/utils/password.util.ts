// src/utils/password.util.ts
import bcrypt from "bcryptjs";

export const PasswordUtil = {
  hash: async (plain: string) => bcrypt.hash(plain, 10),
  compare: async (plain: string, hashed: string) =>
    bcrypt.compare(plain, hashed),
  verify: async (plain: string, hashed: string) =>
    bcrypt.compare(plain, hashed), // Alias for compare
};
