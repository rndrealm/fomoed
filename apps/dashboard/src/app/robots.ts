import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/_next/"],
      },
      // Block AI scrapers and crawlers
      {
        userAgent: [
          "GPTBot", // OpenAI
          "ChatGPT-User", // OpenAI
          "CCBot", // Common Crawl (used by many AI companies)
          "anthropic-ai", // Anthropic
          "Claude-Web", // Anthropic
          "Google-Extended", // Google AI training
          "GoogleOther", // Google generic bot
          "Omgilibot", // Omgili
          "Omgili", // Omgili
          "FacebookBot", // Meta AI
          "Diffbot", // Diffbot
          "Bytespider", // ByteDance (TikTok)
          "ImagesiftBot", // Image analysis
          "cohere-ai", // Cohere
          "PerplexityBot", // Perplexity AI
          "YouBot", // You.com
          "Applebot-Extended", // Apple AI training
          "Amazonbot", // Amazon AI
          "ClaudeBot", // Anthropic
          "Scrapy", // Python scraping framework
          "python-requests", // Common Python library
          "Twitterbot", // Twitter/X scraper
          "Bytespider", // ByteDance
          "meta-externalagent", // Meta
        ],
        disallow: ["/"],
      },
    ],
};
}
