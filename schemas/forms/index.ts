import { z } from "zod";
import { ToolSchema } from "./tool";
import { CountrySchema } from "./country";
import { PurposeSchema } from "./purpose";
import { UserSchema } from "./user";
import { ToolGroupSchema } from "./toolGroup";
import { TagSchema } from "./tag";
export const schemasMap = {
  ToolSchema,
  CountrySchema,
  PurposeSchema,
  UserSchema,
  ToolGroupSchema,
  TagSchema,
};

// Define SharedAttributes

// Generic function to create a schema for creating an entity
export function createInputSchema<T extends z.ZodObject<any>>(schema: T) {
  return schema.omit({
    id: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    deletedAt: true,
    deletedBy: true,
  });
}

// Generic function to create a schema for updating an entity
export function updateInputSchema<T extends z.ZodObject<any>>(schema: T) {
  return schema.partial().omit({
    id: true,
    createdAt: true,
    createdBy: true,
    updatedAt: true,
    updatedBy: true,
    deletedAt: true,
    deletedBy: true,
  });
}

// Generic function to create a response schema for a single entity
export function responseSchema<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    data: schema,
    message: z.string(),
    success: z.boolean(),
  });
}

// Generic function to create a response schema for a list of entities
export function listResponseSchema<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    data: z.object({
      items: z.array(schema),
      totalCount: z.number(),
      page: z.number(),
      pageSize: z.number(),
      totalPages: z.number(),
    }),
    message: z.string(),
    success: z.boolean(),
  });
}

export function defineEntitySchemas<T extends z.ZodObject<any>>(schema: T) {
  return {
    input: createInputSchema(schema),
    update: updateInputSchema(schema),
    response: responseSchema(schema),
    listResponse: listResponseSchema(schema),
  };
}

export type SchemaName =
  | "tool"
  | "country"
  | "purpose"
  | "user"
  | "toolgroup"
  | "tag";

export type SchemaMap = {
  tool: ToolView;
  country: Country;
  purpose: Purpose;
  tag: Tag;
  toolgroup: ToolGroup;
  user: User;
};
export const typeNames: { [K in SchemaName]: string } = {
  tool: "Tool",
  country: "Country",
  purpose: "Purpose",
  tag: "Tag",
  toolgroup: "ToolGroup",
  user: "User",
};
export const schemaMapTypes: { [K in SchemaName]: z.ZodType<SchemaMap[K]> } = {
  tool: ToolSchema,
  country: CountrySchema,
  purpose: PurposeSchema,
  tag: TagSchema,
  toolgroup: ToolGroupSchema,
  user: UserSchema,
};
export const schemaMapObjects: {
  [K in SchemaName]: z.ZodObject<any, any, any>;
} = {
  tool: ToolSchema,
  country: CountrySchema,
  purpose: PurposeSchema,
  tag: TagSchema,
  toolgroup: ToolGroupSchema,
  user: UserSchema,
};
export type ToolView = z.infer<typeof ToolSchema>;
export type Country = z.infer<typeof CountrySchema>;
export type Purpose = z.infer<typeof PurposeSchema>;
export type User = z.infer<typeof UserSchema>;
export type ToolGroup = z.infer<typeof ToolGroupSchema>;
export type Tag = z.infer<typeof TagSchema>;

// Tool types
