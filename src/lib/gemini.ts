import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface GeminiOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

// ─── Core caller ──────────────────────────────────────────────────────────────

export async function callGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<string> {
  const { temperature = 0.7, maxTokens = 4096, jsonMode = false } = options;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        ...(jsonMode ? { responseMimeType: "application/json" } : {}),
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error?.status === 429) {
      throw new GeminiRateLimitError("Gemini rate limit reached");
    }
    throw err;
  }
}

// ─── JSON wrapper ─────────────────────────────────────────────────────────────

export async function callGeminiJSON<T>(
  prompt: string,
  options: GeminiOptions = {}
): Promise<T> {
  const raw = await callGemini(prompt, { ...options, jsonMode: true });

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Gemini sometimes wraps JSON in markdown code fences — strip them
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch (parseErr) {
      console.error("Gemini JSON parse failed. Raw response:", raw.slice(0, 500));
      throw new Error("Failed to parse Gemini JSON response");
    }
  }
}

// ─── Custom errors ────────────────────────────────────────────────────────────

export class GeminiRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

// ─── Availability check ───────────────────────────────────────────────────────

export function isGeminiAvailable(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}
