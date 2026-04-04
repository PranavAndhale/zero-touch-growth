import { AnalyzeRequest, ScrapedData } from "../types/business";
import { TrendingTopic, Festival } from "../types/calendar";

export function buildBusinessAnalysisPrompt(
  formData: AnalyzeRequest,
  scrapedData: ScrapedData | null,
  trendingTopics: TrendingTopic[],
  upcomingFestivals: Festival[]
): string {
  const websiteSection = scrapedData
    ? `
WEBSITE ANALYSIS:
- Website Title: ${scrapedData.title}
- Meta Description: ${scrapedData.description}
- Key Headings: ${scrapedData.headings.slice(0, 10).join(", ")}
- Body Content Summary: ${scrapedData.bodyText.slice(0, 1000)}
- Social Presence: Instagram: ${scrapedData.socialLinks.instagram ? "Yes" : "No"}, Facebook: ${scrapedData.socialLinks.facebook ? "Yes" : "No"}, LinkedIn: ${scrapedData.socialLinks.linkedin ? "Yes" : "No"}
- Technologies: ${scrapedData.techStack.join(", ") || "Not detected"}`
    : "";

  const trendsSection =
    trendingTopics.length > 0
      ? `\nTRENDING IN INDIA TODAY:\n${trendingTopics
          .slice(0, 5)
          .map((t) => `- ${t.title} (${t.trafficVolume} searches)`)
          .join("\n")}`
      : "";

  const festivalsSection =
    upcomingFestivals.length > 0
      ? `\nUPCOMING FESTIVALS (next 90 days):\n${upcomingFestivals
          .filter((f) => f.marketingRelevance !== "low")
          .slice(0, 10)
          .map((f) => `- ${f.name} on ${f.date} (${f.daysAway} days away, ${f.marketingRelevance} relevance)`)
          .join("\n")}`
      : "";

  return `You are an expert Indian digital marketing strategist who specializes in helping small and medium businesses grow their online presence. You understand Indian market dynamics, festival seasons, regional preferences, and social media trends across Instagram, Facebook, LinkedIn, and Twitter/X.

BUSINESS INFORMATION:
- Name: ${formData.name}
- Industry: ${formData.industry}
- Location: ${formData.location}
- Products/Services: ${formData.products.join(", ")}
- Target Audience: ${formData.targetAudience.join(", ")}
- Brand Tone: ${formData.tone}
- Website URL: ${formData.websiteUrl || "Not provided"}
${websiteSection}
${trendsSection}
${festivalsSection}

Based on all this information, generate a comprehensive business intelligence profile for this Indian SMB. Respond ONLY with valid JSON matching this exact structure:

{
  "businessSummary": "2-3 sentence summary of the business, its unique positioning, and market opportunity in India",
  "industryAnalysis": {
    "marketOverview": "1-2 sentences about the ${formData.industry} industry in India",
    "keyTrends": ["trend1 specific to this industry", "trend2", "trend3"],
    "competitiveAdvantages": ["what this business can leverage advantage1", "advantage2"]
  },
  "audiencePersona": {
    "primaryDemographic": "Detailed description of the ideal customer for this business in ${formData.location}",
    "painPoints": ["specific pain point 1 this business solves", "pain point 2", "pain point 3"],
    "buyingBehavior": "How the target audience discovers and purchases from this type of business in India",
    "preferredPlatforms": ["platform1", "platform2"]
  },
  "competitorInsights": {
    "directCompetitors": "Type of businesses competing for the same customers in ${formData.location}",
    "differentiators": ["what makes this business unique vs local competition 1", "differentiator 2"],
    "marketGaps": ["opportunity this business can exploit 1", "opportunity 2"]
  },
  "contentPillars": [
    {"name": "Pillar Name", "description": "What specific content to post about and why it works for this audience", "frequency": "Xx/week"},
    {"name": "Pillar Name 2", "description": "...", "frequency": "Xx/week"},
    {"name": "Pillar Name 3", "description": "...", "frequency": "Xx/week"},
    {"name": "Pillar Name 4", "description": "...", "frequency": "Xx/week"}
  ],
  "platformStrategy": {
    "primary": {"platform": "instagram", "reason": "Specific reason why this is best for THIS business and audience", "postingFrequency": "5x/week"},
    "secondary": {"platform": "facebook", "reason": "Why secondary platform works for this audience", "postingFrequency": "3x/week"},
    "optional": {"platform": "linkedin", "reason": "Why or why not relevant", "postingFrequency": "2x/week"}
  },
  "seasonalOpportunities": [
    {"occasion": "Festival/Occasion Name", "date": "YYYY-MM-DD", "campaignIdea": "Specific campaign idea for THIS business during this occasion", "contentType": "post + carousel"},
    {"occasion": "Next occasion", "date": "YYYY-MM-DD", "campaignIdea": "...", "contentType": "festival creative"}
  ],
  "quickWins": [
    "Specific actionable recommendation this business can implement THIS week on social media",
    "Quick win recommendation 2",
    "Quick win recommendation 3"
  ]
}

CRITICAL RULES:
- Every insight must be SPECIFIC to ${formData.name} in ${formData.location}, not generic advice
- Festival suggestions must be relevant to the ${formData.industry} industry
- Platform recommendations must match the ${formData.targetAudience.join(", ")} demographics
- Content pillars must be actionable topics (not "post good content")
- Seasonal opportunities must use actual upcoming festival dates listed above
- Quick wins must be implementable with zero budget using only social media
- Think like an Indian marketing expert who understands local buying patterns, festivals, and SMB constraints
- Keep language professional but accessible for non-marketing business owners`;
}
