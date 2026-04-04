import { z } from "zod";
import { INDUSTRY_LIST, AUDIENCE_LIST } from "./types/business";

// ─── Business Analysis Request ────────────────────────────────────────────────

export const analyzeRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name too long")
    .transform((v) => v.trim()),

  websiteUrl: z
    .string()
    .url("Must be a valid URL (include https://)")
    .optional()
    .or(z.literal("")),

  industry: z
    .string()
    .min(1, "Industry is required"),

  targetAudience: z
    .array(z.string())
    .min(1, "Select at least one target audience")
    .max(5, "Select up to 5 audiences"),

  location: z
    .string()
    .min(2, "Location is required")
    .transform((v) => v.trim()),

  products: z
    .array(z.string().min(1))
    .min(1, "Add at least one product or service")
    .max(20, "Maximum 20 products"),

  tone: z.enum(["professional", "casual", "playful", "luxurious", "friendly"]),

  brandColors: z
    .array(z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid hex color"))
    .max(3)
    .optional(),

  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type ValidatedAnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

// ─── Weekly Planner Request ───────────────────────────────────────────────────

export const plannerRequestSchema = z.object({
  businessId: z.string().min(1, "Business ID is required"),

  weekStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format"),

  weeklyGoals: z.string().max(500).optional(),

  excludeTypes: z
    .array(z.enum(["post", "carousel", "festival", "banner", "story"]))
    .optional(),

  platforms: z
    .array(z.enum(["instagram", "facebook", "linkedin", "twitter"]))
    .optional(),
});

export type ValidatedPlannerRequest = z.infer<typeof plannerRequestSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function validateAndParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const zodError = result.error as unknown as { issues: Array<{ path: (string | number)[]; message: string }> };
  const errors = (zodError.issues || []).map((e) => `${e.path.join(".")}: ${e.message}`);
  return { success: false, errors };
}
