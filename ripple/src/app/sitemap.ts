import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/format";
import { TOPICS } from "@/lib/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: base, changeFrequency: "always", priority: 1 },
    { url: `${base}/rising`, changeFrequency: "hourly", priority: 0.8 },
    { url: `${base}/drop`, changeFrequency: "monthly", priority: 0.5 },
    ...TOPICS.map((topic) => ({
      url: `${base}/t/${topic.slug}`,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
  ];
}
