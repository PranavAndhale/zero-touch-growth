import { z } from "zod";

// ─── Business Analysis Request ────────────────────────────────────────────────

const VALID_TONES = ["professional", "casual", "playful", "luxurious", "friendly", "authoritative"] as const;

export const analyzeRequestSchema = z.object({
  name: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name too long")
    .transform((v) => v.trim()),

  // Accept valid URL, empty string, or absent — never reject
  websiteUrl: z
    .union([z.string().url(), z.string().max(0), z.undefined()])
    .optional()
    .transform((v) => (!v || v.trim() === "" ? undefined : v.trim())),

  industry: z.string().min(1, "Industry is required"),

  // Accept plain string or array of strings
  targetAudience: z
    .union([
      z.string().transform((v) => (v.trim() ? [v.trim()] : ["General audience"])),
      z.array(z.string()).min(1),
      z.undefined(),
    ])
    .optional()
    .transform((v) => v ?? ["General audience"]),

  location: z
    .string()
    .optional()
    .transform((v) => v?.trim() || "India"),

  // Accept plain string (split by comma) or array
  products: z
    .union([
      z.string().transform((v) =>
        v.trim() ? v.split(/[,\n]+/).map((s) => s.trim()).filter(Boolean) : []
      ),
      z.array(z.string()),
      z.undefined(),
    ])
    .optional()
    .transform((v) => (!v || v.length === 0 ? [] : v)),

  // Any casing — normalise and fallback to "professional" if invalid
  tone: z
    .string()
    .optional()
    .transform((v) => {
      const lower = (v ?? "professional").toLowerCase();
      return (VALID_TONES as readonly string[]).includes(lower)
        ? (lower as typeof VALID_TONES[number])
        : "professional";
    }),

  // Brand colors — strip any invalid entries instead of rejecting
  brandColors: z
    .array(z.string())
    .optional()
    .transform((v) =>
      (v ?? []).filter((c) => /^#[0-9A-Fa-f]{6}$/.test(c))
    ),

  logoUrl: z
    .union([z.string().url(), z.string().max(0), z.undefined()])
    .optional()
    .transform((v) => (!v || v.trim() === "" ? undefined : v.trim())),
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
  // Zod v4 compatible — .issues is on result.error directly
  const errors = (result.error.issues ?? []).map(
    (e) => `${(e.path ?? []).join(".")}: ${e.message}`
  );
  return { success: false, errors };
}
