import { z } from "zod";

import { SharedAttributes } from "../_shared";

export const CountrySchema = SharedAttributes.extend({
  name: z.string().describe("Name of the country"),
  code: z.string().length(2).describe("ISO 3166-1 alpha-2 country code"),
  continent: z.string().describe("Continent where the country is located"),
  currency: z.string().describe("Currency code used in the country"),
  phoneCode: z.string().describe("International phone code for the country"),
});
