import { Router } from "express";
import { asyncHandler } from "../../shared/utils/async-handler";
import { authMiddleware } from "../../shared/middleware/auth.middleware";
import { authController } from "./auth.controller";
import { validateLogin, validateRfidLogin } from "./auth.validators";

export const authRoutes = Router();

authRoutes.post("/login", validateLogin, asyncHandler(authController.login.bind(authController)));
authRoutes.post("/rfid", validateRfidLogin, asyncHandler(authController.loginWithRfid.bind(authController)));
authRoutes.get("/me", authMiddleware, asyncHandler(authController.me.bind(authController)));
authRoutes.post("/logout", authMiddleware, asyncHandler(authController.logout.bind(authController)));
