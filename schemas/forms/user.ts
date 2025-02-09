import { z } from "zod";

import { SharedAttributes } from "../_shared";

export const UserRoleSchema = z.enum(["admin", "user", "guest", "editor"]);
export const UserStatusSchema = z.enum(["active", "inactive", "suspended"]);

export const UserSchema = SharedAttributes.extend({
  name: z.string().describe("Name of the user"),
  email: z.string().email().describe("Email address of the user"),
  role: UserRoleSchema.describe("Role of the user"),
  countryId: z
    .string()

    .describe("ID of the country the user is associated with"),

  status: UserStatusSchema.describe("Current status of the user"),
});
