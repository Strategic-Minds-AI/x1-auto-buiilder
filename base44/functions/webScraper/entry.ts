import { createClientFromRequest } from "npm:@base44/sdk@0.8.52";

// Web Scraper — gives the Super Agent browser-like capability to fetch, discover,
// and extract content from any URL. Supports text extraction, link discovery,
// metadata parsing, and full HTML retrieval for integration into the platform.

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { url, extract_type, discover_links, max_depth } = body;

    if (!url) return Response.json({ error: "url is required" }, { status: 400 });

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
      redirect: "follow",
    });

    if (!res.ok) {
      return Response.json({ error: `Failed to fetch: ${res.status} ${res.statusText}`, url }, { status: res.status });
    }

    const html = await res.text();
    const contentType = res.headers.get("content-type") || "";

    // Extract based on type
    let extracted: any = {};

    if (extract_type === "text" || extract_type === "full" || !extract_type) {
      // Strip scripts, styles, and HTML tags
      const cleaned = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
      extracted.text = cleaned.substring(0, 50000); // Cap at 50k chars
    }

    if (extract_type === "links" || extract_type === "full" || discover_links) {
      const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
      const links: Array<{ url: string; text: string }> = [];
      let match;
      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].trim();
        if (href && !href.startsWith("javascript:") && !href.startsWith("#")) {
          // Resolve relative URLs
          let fullUrl = href;
          if (href.startsWith("/")) {
            const base = new URL(url);
            fullUrl = `${base.origin}${href}`;
          } else if (!href.startsWith("http")) {
            const base = new URL(url);
            fullUrl = `${base.origin}/${href}`;
          }
          links.push({ url: fullUrl, text });
        }
      }
      extracted.links = links.slice(0, 200); // Cap at 200 links
    }

    if (extract_type === "metadata" || extract_type === "full" || !extract_type) {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
      const ogDescMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
      const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      const h1Matches = html.match(/<h1[^>]*>([^<]*)<\/h1>/gi);
      const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi);

      extracted.metadata = {
        title: titleMatch?.[1]?.trim() || "",
        description: descMatch?.[1]?.trim() || ogDescMatch?.[1]?.trim() || "",
        ogTitle: ogTitleMatch?.[1]?.trim() || "",
        ogImage: ogImageMatch?.[1]?.trim() || "",
        headings: [
          ...(h1Matches || []).map(h => h.replace(/<[^>]+>/g, "").trim()).filter(Boolean),
          ...(h2Matches || []).map(h => h.replace(/<[^>]+>/g, "").trim()).filter(Boolean),
        ].slice(0, 30),
      };
    }

    if (extract_type === "images") {
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi;
      const images: Array<{ src: string; alt: string }> = [];
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        let src = match[1];
        if (src.startsWith("/")) {
          const base = new URL(url);
          src = `${base.origin}${src}`;
        }
        images.push({ src, alt: match[2] || "" });
      }
      extracted.images = images.slice(0, 100);
    }

    if (extract_type === "raw") {
      extracted.html = html.substring(0, 100000);
    }

    // Use LLM to analyze the scraped content if requested
    if (body.analyze) {
      const analysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Analyze this web page content and provide a structured summary including: main topic, key information, business type, target audience, and integration opportunities.\n\nURL: ${url}\nContent: ${JSON.stringify(extracted).substring(0, 10000)}`,
        response_json_schema: {
          type: "object",
          properties: {
            topic: { type: "string" },
            business_type: { type: "string" },
            key_info: { type: "array", items: { type: "string" } },
            target_audience: { type: "string" },
            integration_opportunities: { type: "array", items: { type: "string" } },
            summary: { type: "string" },
          },
        },
      });
      extracted.analysis = analysis;
    }

    return Response.json({
      success: true,
      url,
      contentType,
      status: res.status,
      extracted,
    });
  } catch (error) {
    return Response.json({ error: error.message || "Web scraping failed" }, { status: 500 });
  }
}