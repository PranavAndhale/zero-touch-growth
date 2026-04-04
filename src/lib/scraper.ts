import * as cheerio from "cheerio";
import { ScrapedData } from "./types/business";

const SCRAPE_TIMEOUT = 10000; // 10 seconds
const USER_AGENT =
  "Mozilla/5.0 (compatible; ZeroTouchGrowth/1.0; +https://zero-touch-growth.vercel.app)";

export async function scrapeWebsite(url: string): Promise<ScrapedData | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT);

    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const html = await res.text();
    const $ = cheerio.load(html);

    // ── Meta ──────────────────────────────────────────────────────────────────
    const title =
      $("title").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      "";

    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    const ogImage = $('meta[property="og:image"]').attr("content");

    // ── Headings ──────────────────────────────────────────────────────────────
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text && headings.length < 20) headings.push(text);
    });

    // ── Body text ─────────────────────────────────────────────────────────────
    // Remove script, style, nav, footer noise
    $("script, style, nav, footer, header, noscript, iframe").remove();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 2000);

    // ── Social links ──────────────────────────────────────────────────────────
    const socialLinks: ScrapedData["socialLinks"] = {};
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href") || "";
      if (href.includes("instagram.com") && !socialLinks.instagram)
        socialLinks.instagram = href;
      else if (href.includes("facebook.com") && !socialLinks.facebook)
        socialLinks.facebook = href;
      else if (
        (href.includes("linkedin.com") || href.includes("linked.in")) &&
        !socialLinks.linkedin
      )
        socialLinks.linkedin = href;
      else if (
        (href.includes("twitter.com") || href.includes("x.com")) &&
        !socialLinks.twitter
      )
        socialLinks.twitter = href;
      else if (href.includes("youtube.com") && !socialLinks.youtube)
        socialLinks.youtube = href;
    });

    // ── Contact info ──────────────────────────────────────────────────────────
    const contactInfo: ScrapedData["contactInfo"] = {};
    $("a[href^='mailto:']").each((_, el) => {
      if (!contactInfo.email)
        contactInfo.email = ($(el).attr("href") || "").replace("mailto:", "");
    });
    $("a[href^='tel:']").each((_, el) => {
      if (!contactInfo.phone)
        contactInfo.phone = ($(el).attr("href") || "").replace("tel:", "");
    });

    // ── Tech stack detection ──────────────────────────────────────────────────
    const techStack: string[] = [];
    const rawHtml = html.toLowerCase();
    if (rawHtml.includes("wp-content") || rawHtml.includes("wordpress"))
      techStack.push("WordPress");
    if (rawHtml.includes("shopify")) techStack.push("Shopify");
    if (rawHtml.includes("wix.com") || rawHtml.includes("wixstatic"))
      techStack.push("Wix");
    if (rawHtml.includes("squarespace")) techStack.push("Squarespace");
    if (rawHtml.includes("webflow")) techStack.push("Webflow");
    if (rawHtml.includes("gtag") || rawHtml.includes("ga.js"))
      techStack.push("Google Analytics");
    if (rawHtml.includes("fbevents") || rawHtml.includes("facebook.net"))
      techStack.push("Facebook Pixel");

    return {
      title,
      description,
      ogImage,
      headings,
      bodyText,
      socialLinks,
      contactInfo,
      techStack,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn(`Scrape timed out for ${url}`);
    } else {
      console.warn(`Scrape failed for ${url}:`, err);
    }
    return null;
  }
}
