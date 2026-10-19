
import { z } from "zod";

type Translate = (key: string) => string;

export const createPasswordSchema = (t: Translate) =>
  z
    .string()
    .min(8, t("passwordMin"))
    .regex(/[a-z]/, t("passwordLowercase"))
    .regex(/[A-Z]/, t("passwordUppercase"))
    .regex(/[0-9]/, t("passwordNumber"))
    .regex(/[^A-Za-z0-9]/, t("passwordSpecial"));

const emailSchema = (t: Translate) =>
  z
    .string()
    .trim()
    .min(1, t("emailRequired"))
    .email(t("emailInvalid"))
    .transform((value) => value.toLowerCase());

export const createLoginSchema = (t: Translate) =>
  z.object({
    email: emailSchema(t),
    password: createPasswordSchema(t),
  });

export const createRegisterSchema = (t: Translate) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(2, t("firstNameMin"))
        .max(100, t("firstNameMax")),

      lastName: z
        .string()
        .trim()
        .min(2, t("lastNameMin"))
        .max(100, t("lastNameMax")),

      email: emailSchema(t),
      password: createPasswordSchema(t),
      confirmPassword: z
        .string()
        .min(1, t("confirmPasswordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("passwordMismatch"),
    })
    .transform(({ confirmPassword, ...data }) => data);

export const createVerifyEmailSchema = (t: Translate) =>
  z.object({
    email: emailSchema(t),
    otp: z
      .string()
      .regex(/^\d{6}$/, t("otpInvalid")),
  });

export const createForgotPasswordSchema = (t: Translate) =>
  z.object({
    email: emailSchema(t),
  });

export const createResetPasswordSchema = (t: Translate) =>
  z.object({
    email: emailSchema(t),
    otp: z.string().regex(/^\d{6}$/, t("otpInvalid")),
    password: createPasswordSchema(t),
    confirmPassword: z
      .string()
      .min(1, t("confirmPasswordRequired")),
  }).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: t("passwordMismatch"),
  }).transform(({ confirmPassword, ...data }) => data);

  export const loginSchema = z.object({
  email: z.string().trim().email().transform(
    (value) => value.toLowerCase(),
  ),
  password: z.string().min(8),
});