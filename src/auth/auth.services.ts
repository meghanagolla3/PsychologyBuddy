// src/auth/auth.service.ts

import { AuthRepository } from "./auth.repository";
import { comparePassword } from "@/src/utils/password.util";
import { createSession, destroySession, getSessionUser } from "@/src/utils/session.util";
import { BadRequestError, UnauthorizedError } from "@/src/utils/errors";

class AuthService {
  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------
  async login(email: string, password: string) {
    const user = await AuthRepository.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // Validate password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password.");
    }

    // Create secure session
    await createSession(user.id, user.roleId);

    return {
      message: "Login successful.",
      user: {
        id: user.id,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  // --------------------------------------------------
  // LOGOUT
  // --------------------------------------------------
  async logout() {
    await destroySession();
    return { message: "Logged out successfully." };
  }

  // --------------------------------------------------
  // ME — Validate session + fetch user
  // --------------------------------------------------
  async me() {
    const session = await getSessionUser();
    if (!session) throw new UnauthorizedError("Session expired.");

    const { user } = session;

    return {
      id: user.id,
      email: user.email,
      role: user.role.name,
    };
  }
}

export const AuthService = new AuthService();
