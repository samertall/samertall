export const TOPICS = [
  { slug: "design", label: "Design" },
  { slug: "product", label: "Product" },
  { slug: "culture", label: "Culture" },
  { slug: "tech", label: "Tech" },
  { slug: "cities", label: "Cities" },
  { slug: "film", label: "Film" },
] as const;

export type TopicSlug = (typeof TOPICS)[number]["slug"];

export function topicBySlug(slug: string) {
  return TOPICS.find((topic) => topic.slug === slug) ?? null;
}

export function topicLabel(slug: string) {
  return topicBySlug(slug)?.label ?? slug;
}
