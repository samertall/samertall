import type { TopicSlug } from "@/lib/topics";

export type SeedVoice = {
  id: string;
  handle: string;
  name: string;
  bio: string;
};

export type SeedReply = {
  handle: string;
  body: string;
  minutesOld: number;
};

export type SeedRipple = {
  handle: string;
  topic: TopicSlug;
  body: string;
  minutesOld: number;
  passes: { hour: number; six: number; older: number };
  replies: SeedReply[];
};

export const VOICES: SeedVoice[] = [
  {
    id: "seed_nora",
    handle: "nora.vale",
    name: "Nora Vale",
    bio: "Designs products that feel decided, then leaves room to change your mind.",
  },
  {
    id: "seed_jules",
    handle: "jules.okonkwo",
    name: "Jules Okonkwo",
    bio: "Writes roadmaps that can survive a Tuesday with real users.",
  },
  {
    id: "seed_mina",
    handle: "mina.park",
    name: "Mina Park",
    bio: "Cares about empty states, specificity, and what a product refuses to say.",
  },
  {
    id: "seed_adi",
    handle: "adi.rehman",
    name: "Adi Rehman",
    bio: "Treats latency, cities, and software as the same material problem.",
  },
  {
    id: "seed_leah",
    handle: "leah.costa",
    name: "Leah Costa",
    bio: "Looks at rooms, frames, and the cost of being allowed to stay.",
  },
  {
    id: "seed_theo",
    handle: "theo.march",
    name: "Theo March",
    bio: "Cuts, models, and the moment someone feels understood.",
  },
  {
    id: "seed_sellin",
    handle: "sellin",
    name: "S. Ellin",
    bio: "Interested in recognition, taste, and sentences teams can repeat.",
  },
  {
    id: "seed_rafi",
    handle: "rafi.nunez",
    name: "Rafi Nuñez",
    bio: "Ships the sentence first. The feature has to make it true.",
  },
];

export const OPENING_BOARD: SeedRipple[] = [
  {
    handle: "nora.vale",
    topic: "design",
    body: "The interface should feel like it already knows the next move, and still let you change your mind.",
    minutesOld: 860,
    passes: { hour: 18, six: 7, older: 5 },
    replies: [
      {
        handle: "mina.park",
        body: "That second half is the whole craft. Confidence without a trapdoor.",
        minutesOld: 40,
      },
      {
        handle: "rafi.nunez",
        body: "Most teams ship the knowing and forget the exit.",
        minutesOld: 22,
      },
    ],
  },
  {
    handle: "sellin",
    topic: "culture",
    body: "Virality is what happens when a stranger recognizes themselves. You cannot schedule that.",
    minutesOld: 640,
    passes: { hour: 11, six: 5, older: 4 },
    replies: [
      {
        handle: "jules.okonkwo",
        body: "You can schedule the posting. You cannot schedule the recognition.",
        minutesOld: 55,
      },
    ],
  },
  {
    handle: "theo.march",
    topic: "tech",
    body: "The model is not the product. The moment a person feels understood is the product.",
    minutesOld: 500,
    passes: { hour: 7, six: 4, older: 3 },
    replies: [
      {
        handle: "adi.rehman",
        body: "And that moment has a latency budget, whether the model is good or not.",
        minutesOld: 70,
      },
    ],
  },
  {
    handle: "mina.park",
    topic: "design",
    body: "If the empty state is an apology, the product does not know why it exists.",
    minutesOld: 420,
    passes: { hour: 5, six: 4, older: 2 },
    replies: [
      {
        handle: "nora.vale",
        body: "An empty state should be an invitation with a point of view.",
        minutesOld: 90,
      },
    ],
  },
  {
    handle: "jules.okonkwo",
    topic: "product",
    body: "A roadmap that cannot survive a real user is a wish list with dates on it.",
    minutesOld: 380,
    passes: { hour: 3, six: 3, older: 4 },
    replies: [
      {
        handle: "sellin",
        body: "Dates are fine. Unexamined certainty is the expensive part.",
        minutesOld: 120,
      },
    ],
  },
  {
    handle: "adi.rehman",
    topic: "tech",
    body: "Latency is a material. People feel two hundred milliseconds before they can name it.",
    minutesOld: 300,
    passes: { hour: 2, six: 3, older: 2 },
    replies: [],
  },
  {
    handle: "leah.costa",
    topic: "cities",
    body: "The best public rooms do not ask you to buy something in order to stay.",
    minutesOld: 260,
    passes: { hour: 2, six: 2, older: 3 },
    replies: [
      {
        handle: "mina.park",
        body: "Software has the same tell. A free plan that still lets you linger.",
        minutesOld: 200,
      },
    ],
  },
  {
    handle: "rafi.nunez",
    topic: "product",
    body: "Ship the sentence first. The feature is whatever makes that sentence true.",
    minutesOld: 48,
    passes: { hour: 2, six: 0, older: 0 },
    replies: [],
  },
  {
    handle: "nora.vale",
    topic: "product",
    body: "Onboarding should feel like the product already trusts you.",
    minutesOld: 26,
    passes: { hour: 1, six: 0, older: 0 },
    replies: [],
  },
  {
    handle: "mina.park",
    topic: "culture",
    body: "Everyone wants the reach. Almost nobody wants to be specific.",
    minutesOld: 180,
    passes: { hour: 1, six: 2, older: 2 },
    replies: [],
  },
  {
    handle: "jules.okonkwo",
    topic: "film",
    body: "A cut that arrives half a second early is how a scene tells the truth.",
    minutesOld: 210,
    passes: { hour: 0, six: 2, older: 2 },
    replies: [
      {
        handle: "theo.march",
        body: "Late cuts explain. Early cuts trust the audience.",
        minutesOld: 150,
      },
    ],
  },
  {
    handle: "adi.rehman",
    topic: "cities",
    body: "A city that only works from a car is a product with one persona.",
    minutesOld: 240,
    passes: { hour: 1, six: 1, older: 2 },
    replies: [],
  },
  {
    handle: "leah.costa",
    topic: "film",
    body: "The frame you remember is usually the one that held still.",
    minutesOld: 90,
    passes: { hour: 1, six: 0, older: 0 },
    replies: [],
  },
  {
    handle: "theo.march",
    topic: "design",
    body: "Dark mode is not a palette swap. It is another material under another light.",
    minutesOld: 150,
    passes: { hour: 2, six: 1, older: 1 },
    replies: [],
  },
  {
    handle: "sellin",
    topic: "product",
    body: "Alignment is a sentence two teams can repeat when you leave the room.",
    minutesOld: 70,
    passes: { hour: 1, six: 0, older: 0 },
    replies: [],
  },
  {
    handle: "rafi.nunez",
    topic: "culture",
    body: "Trends are rented. Taste is what is left when the metric goes quiet.",
    minutesOld: 14,
    passes: { hour: 0, six: 0, older: 0 },
    replies: [],
  },
];
