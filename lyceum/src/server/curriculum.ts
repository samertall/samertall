import type { Level } from "@/lib/text";

export type SeedChoice = { label: string; correct: boolean };
export type SeedQuestion = { id: string; prompt: string; explanation: string; choices: SeedChoice[] };
export type SeedLesson = {
  id: string;
  title: string;
  kind: "reading" | "quiz";
  minutes: number;
  body: string;
  questions?: SeedQuestion[];
};
export type SeedModule = { id: string; title: string; lessons: SeedLesson[] };
export type SeedCourse = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  subject: string;
  level: Level;
  modules: SeedModule[];
};

const quizIntro = "Four questions. A score of 70% or better completes the lesson. You can retake it, and a later miss does not undo a pass.";

export const curriculum: SeedCourse[] = [
  {
    id: "course_critique",
    slug: "giving-a-critique",
    title: "Giving a Critique",
    summary: "Run a critique that leaves the maker with decisions, not a pile of taste.",
    description:
      "A critique is a working session. This course is for designers, product managers, and engineers who sit in those rooms and want the work to get better because of it.\n\nYou will practice how to open, how to respond, and how to close so the next version has an owner.",
    subject: "Design",
    level: "Foundation",
    modules: [
      {
        id: "mod_critique_room",
        title: "The room",
        lessons: [
          {
            id: "les_purpose",
            title: "What a critique is for",
            kind: "reading",
            minutes: 11,
            body: `A critique is a working session, not a verdict. The point is to see whether the decisions in the work serve the goal, and to leave with a clearer next move.

## The subject is the work

Taste matters, and so does seniority. Neither one is the subject. The subject is the work: what it is trying to do, for whom, under which constraints, and which choices are carrying that load.

Bring the goal into the room before the pixels. If the room cannot say what success is, comments about color, tone, and layout have nothing to attach to. They pile up, and the maker leaves with a list instead of a decision.

## Notes you can use

Useful feedback names a decision and its effect.

- The primary action is the same weight as the secondary one, so a new customer cannot tell what to do first.
- The empty state explains the system, not the task, so a person who has never been here does not know how to start.
- The error asks them to try again without saying what failed.

**"I don't love it" cannot be acted on.** A note that names the decision can.

A critique fails when it becomes a redesign. The room's job is to pressure-test the work. The maker's job is to go back and change it. When those jobs collapse, the work gets better in the meeting and worse in the product, because no one owns the result.

> Leave with fewer open questions than you entered with, not with more opinions.`,
          },
          {
            id: "les_roles",
            title: "Roles in the room",
            kind: "reading",
            minutes: 10,
            body: `Three roles keep a critique honest. The maker presents. The room responds. One person facilitates. In a small team the maker can facilitate, but only after the group has practiced staying in the work.

## What each role protects

The maker opens with the goal, the audience, the constraint that matters, and the kind of feedback that is useful today. Early work wants a response to the direction. Late work wants a response to fit and finish. Asking for both at once produces notes that fight each other.

The room speaks to the work. It does not interview the maker into a corner, and it does not perform expertise. Questions are welcome when they uncover a constraint. They are a stall when they replace a point of view.

The facilitator protects the goal. When the conversation drifts to a different product, they say so and park it. When two notes contradict, they do not average them. They name the contradiction and ask which one serves the goal.

## The record

Write the decisions down before the room stands up. A critique without a record becomes a feeling that something was said. The next version then depends on whoever remembers it most vividly.

1. Goal and audience, in the maker's words.
2. The feedback that changed a decision.
3. The feedback that was parked, and why.
4. The two or three moves the maker will make next.

If you cannot say the decisions back in your own words, you do not have them yet.`,
          },
        ],
      },
      {
        id: "mod_critique_practice",
        title: "The practice",
        lessons: [
          {
            id: "les_sequence",
            title: "A sequence that holds",
            kind: "reading",
            minutes: 9,
            body: `Use the same sequence often enough that people can prepare. Novelty in the ritual is not useful. Novelty in the work is.

## The order

1. The maker states the goal, the user, and the constraint that matters most.
2. The maker walks the work once, without defending it.
3. The room asks clarifying questions.
4. The room offers feedback tied to the goal.
5. The facilitator names the two or three decisions the maker will take away.

Defense belongs after the walkthrough, and only to supply a constraint the room does not have. A defense offered before anyone has responded is a request for the room to agree.

## The pause

Silence is part of the sequence. After the walkthrough, give people a minute to look again. The first comment is often the most confident, not the most useful. A short pause changes who speaks and what they have actually seen.

Close on decisions, not on a score. "We will strengthen the empty state and leave the navigation alone" is a result. "Good discussion" is a dismissal.

If the room is stuck between two good notes, do not blend them. Pick the one that serves the stated goal, say which constraint made the choice, and let the other note live in the record as a rejected alternative. The next critique can reopen it if the goal changes.

> A sequence is a promise that the maker will be heard before they are edited.`,
          },
          {
            id: "les_critique_quiz",
            title: "Critique quiz",
            kind: "quiz",
            minutes: 8,
            body: quizIntro,
            questions: [
              {
                id: "q_critique_1",
                prompt: "What is a critique for?",
                explanation: "The session exists to improve the work against a goal and to leave with a next move.",
                choices: [
                  { label: "To approve the work so the team can ship", correct: false },
                  { label: "To improve the work by examining decisions against the goal", correct: true },
                  { label: "To let the most senior person set the taste", correct: false },
                  { label: "To collect as many opinions as possible", correct: false },
                ],
              },
              {
                id: "q_critique_2",
                prompt: "What should the maker do at the start?",
                explanation: "The room needs the goal, the audience, and the constraint before it can respond to the work.",
                choices: [
                  { label: "Defend each choice before anyone speaks", correct: false },
                  { label: "Present the goal, the constraints, and the work, then listen", correct: true },
                  { label: "Stay silent the entire time", correct: false },
                  { label: "Ask the room to vote on a direction", correct: false },
                ],
              },
              {
                id: "q_critique_3",
                prompt: "Which note is useful feedback?",
                explanation: "Useful feedback names a decision and how it serves or misses the goal.",
                choices: [
                  { label: "I would have used a different typeface.", correct: false },
                  { label: "The primary and secondary actions have the same weight, so a new customer cannot tell what to do first.", correct: true },
                  { label: "Can we make it pop?", correct: false },
                  { label: "Let me redraw this screen for you.", correct: false },
                ],
              },
              {
                id: "q_critique_4",
                prompt: "Two notes contradict each other. What should the facilitator do?",
                explanation: "Averaging contradictory notes hides the decision. Return to the goal and name what is still open.",
                choices: [
                  { label: "Average the two opinions so both people feel heard", correct: false },
                  { label: "Return to the goal and name the decision that is still open", correct: true },
                  { label: "Pick a winner quickly to save the meeting", correct: false },
                  { label: "Table the work until everyone agrees", correct: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course_sense",
    slug: "product-sense",
    title: "Product Sense",
    summary: "Frame the job, separate it from the solution, and defend a tradeoff.",
    description:
      "Product sense is the habit of choosing a problem worth solving and a solution you can explain. This course is short on frameworks and specific about the sentences a team should be able to say out loud.\n\nYou will practice the job story, the difference between an opportunity and a feature, and a tradeoff that has a reason.",
    subject: "Product",
    level: "Practice",
    modules: [
      {
        id: "mod_sense_frame",
        title: "Framing",
        lessons: [
          {
            id: "les_job",
            title: "The job, not the feature",
            kind: "reading",
            minutes: 12,
            body: `A feature is a thing you might build. A job is what someone is trying to get done when they reach for it. Teams that start from the feature collect requirements. Teams that start from the job can tell which requirements are the work.

## Say the job in one sentence

Use a sentence a teammate can repeat without the deck:

**When** a situation happens, **a person wants** to make progress, **so they can** reach an outcome.

"When a new manager opens the weekly report, they want to see which projects slipped and why, so they can decide what to raise on Monday." That sentence names a moment, a person, and a decision. "We need a dashboard" names none of those.

## What the sentence rules out

A good job story makes some ideas obviously off. If the manager's decision is what to raise on Monday, a chart of every event in the system is not the job, even if it is impressive. Write the story down where the critique and the spec can both see it. When a request arrives, ask which part of the sentence it serves.

Watch for jobs that are really the company's wish. "The user wants to upgrade" is often "we want the user to upgrade." If you cannot describe the progress from their side, you do not have a job yet. You have a target.

> If the sentence still sounds right after you remove the product, it is about the person. If it falls apart, it was about the feature.`,
          },
          {
            id: "les_opportunity",
            title: "Opportunity and solution",
            kind: "reading",
            minutes: 11,
            body: `An opportunity is a gap between the job and what is true today. A solution is one way to close it. Keeping them in separate sentences stops the team from falling in love with a screen before it has agreed on the gap.

## Two lists

Write the opportunity as an observation:

- New managers cannot tell a slip from a normal delay without asking three people.
- The reason for a slip lives in chat, not next to the project.
- Monday's meeting spends twenty minutes reconstructing the week.

Then write solutions as options, not as the plan. A digest, a change to the project page, a prompt in the existing report. Each option should say which observation it addresses and which it ignores.

## Evidence before size

You do not need a market model to have product sense. You do need to know whether the gap is real. Five conversations that repeat the same moment are stronger than a category slide. If you cannot find the moment, shrink the claim or pick a different job.

Rank opportunities by the cost of the gap, not by how exciting the solution is. A dull fix for a weekly failure often beats a new surface for a rare one. Say that out loud when the room is attracted to the new surface.

**Name the non-goal.** "We are not rebuilding the report" is a product decision. It keeps the solution attached to the opportunity you actually have evidence for.`,
          },
        ],
      },
      {
        id: "mod_sense_decide",
        title: "Decisions",
        lessons: [
          {
            id: "les_tradeoffs",
            title: "Tradeoffs you can defend",
            kind: "reading",
            minutes: 10,
            body: `A tradeoff is a choice to make one outcome worse so another can be better. If nothing gets worse, you have not made a tradeoff. You have made a wish.

## The shape of a defense

State four things, in this order:

1. The job and the opportunity you are serving.
2. The option you chose.
3. The cost you are accepting.
4. The signal that would make you reverse it.

"We will show only slipped projects, not every project. Managers will have to open a second view for a healthy week. We will reverse this if people still spend Monday reconstructing work that did not slip."

That is defendable. "We want it simple but powerful" is not, because it refuses the cost.

## Who pays

Say who pays the cost. Sometimes it is the new user, sometimes an internal team, sometimes a later version of the product. A tradeoff that hides its payer will be relitigated in every review. A tradeoff that names the payer can be accepted, scheduled, or rejected on purpose.

Do not use "best practice" as the reason. A practice is a prior team's tradeoff. It may be right here, but only if the job matches. If you cannot connect it to the sentence you wrote in the first lesson, it is decoration.

> Reversing a decision is a success when the signal you named has arrived. It is drift when you never named one.`,
          },
          {
            id: "les_sense_quiz",
            title: "Product sense quiz",
            kind: "quiz",
            minutes: 8,
            body: quizIntro,
            questions: [
              {
                id: "q_sense_1",
                prompt: "Which sentence is a job, not a feature?",
                explanation: "A job names a moment, a person, and the progress they want. A dashboard is a feature.",
                choices: [
                  { label: "We should add an analytics dashboard.", correct: false },
                  { label: "When a new manager opens the weekly report, they want to see what slipped and why, so they can decide what to raise.", correct: true },
                  { label: "Users want more insights.", correct: false },
                  { label: "The report should be best in class.", correct: false },
                ],
              },
              {
                id: "q_sense_2",
                prompt: "What is an opportunity?",
                explanation: "An opportunity is the gap between the job and what is true today, kept separate from any one solution.",
                choices: [
                  { label: "The screen you have already designed", correct: false },
                  { label: "A gap between the job and what is true today", correct: true },
                  { label: "The largest item in the backlog", correct: false },
                  { label: "A competitor's latest release", correct: false },
                ],
              },
              {
                id: "q_sense_3",
                prompt: "What makes a tradeoff defendable?",
                explanation: "A defense names the choice, the cost, who pays it, and the signal that would reverse it.",
                choices: [
                  { label: "It promises the outcome will be both simple and complete", correct: false },
                  { label: "It names the cost you accept and the signal that would reverse the choice", correct: true },
                  { label: "It cites a best practice", correct: false },
                  { label: "It was approved by the most senior person in the room", correct: false },
                ],
              },
              {
                id: "q_sense_4",
                prompt: "A request arrives mid-project. What do you ask first?",
                explanation: "Attach the request to the job sentence before debating the design of it.",
                choices: [
                  { label: "How fast can engineering build it?", correct: false },
                  { label: "Which part of the job sentence does this serve?", correct: true },
                  { label: "Which competitor already has it?", correct: false },
                  { label: "Can we add it without changing the schedule?", correct: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course_type",
    slug: "type-in-the-interface",
    title: "Type in the Interface",
    summary: "Set type so people can read, decide, and find their place.",
    description:
      "Interface type is not a mood board. It is how a product shows rank, invites a next step, and stays readable after the headline.\n\nThis course covers measure and leading, pairing, and the small set of roles a product actually needs.",
    subject: "Design",
    level: "Practice",
    modules: [
      {
        id: "mod_type_set",
        title: "Setting type",
        lessons: [
          {
            id: "les_measure",
            title: "Measure, leading, and rank",
            kind: "reading",
            minutes: 12,
            body: `People do not read an interface the way they read a novel, but the constraints are older than screens. A line that is too long makes the eye lose the next one. A line that is too tight makes the paragraph feel like a fence.

## Measure

Keep reading text near 60 to 75 characters. In a narrow card, the measure is already decided by the card. In a wide settings page, it is not, and a paragraph stretched across the viewport is a bug. Set a max width on the prose, not on the whole application.

Labels, buttons, and table cells are not prose. They can be short. Do not justify them, and do not letterspace them to look like a poster.

## Leading and rank

Leading is the space that lets a line finish before the next one starts. If you increase the type size, increase the leading, then look at a real paragraph rather than a type scale on a white artboard.

Rank is how a person knows what to read first. You need fewer sizes than you think:

- A title that names the page.
- A section heading.
- Body text.
- A secondary line for meta, help, and timestamps.

**If two elements are the same size, weight, and color, they are the same rank,** even if you meant one of them to be more important. Fix the rank before you add a new size.

> Hierarchy is a sequence of attention, not a collection of styles.`,
          },
          {
            id: "les_pairing",
            title: "Pairing without costume",
            kind: "reading",
            minutes: 9,
            body: `Two typefaces can clarify the difference between a title and the work. They can also make a product look like it borrowed a personality. Pair them only when the difference in role is real.

## A test

Set the title in the display face and a full paragraph in the text face, at the sizes the product will use. If the paragraph looks like it came from a different company, the pairing is a costume. If the paragraph is simply easier to read, the pairing is doing a job.

Prefer a text face with a real italic and enough weights for rank: regular for body, medium or semibold for labels you must not miss, and one heavier weight for rare emphasis. A family with nine weights is not an invitation to use nine.

## What to avoid

- All-caps paragraphs.
- Light weights for body text on a bright ground. They look elegant in a specimen and fail in a form.
- Centered blocks of instruction. People scan the left edge.
- A third typeface for "personality" in a chart, an empty state, or an error.

Use the product's text face for errors. An error is a sentence someone must trust. A display face makes it look like marketing.

If you only have one family, use it. Size, weight, and space will carry the rank. A second face is optional. A readable paragraph is not.`,
          },
        ],
      },
      {
        id: "mod_type_ui",
        title: "In the product",
        lessons: [
          {
            id: "les_interface",
            title: "Type as interface",
            kind: "reading",
            minutes: 10,
            body: `In a product, type does interface work: it labels a control, states a status, and tells a person what will happen if they continue. Treat those as roles, and write them as carefully as you draw them.

## Roles worth naming

Give the system a small vocabulary and reuse it.

- **Title** names where you are.
- **Label** names a control or a field, in the same voice every time.
- **Help** sits near the field and says what to enter, not what the database is called.
- **Status** says what is true now: saved, waiting, failed.
- **Action** says what will happen: "Publish course", not "Submit".

The action is a verb plus an object whenever the object is not obvious. "Delete" on a course page can mean the lesson, the module, or the course. "Delete course" cannot.

## Status is not decoration

Color can support a status. The words have to carry it. "Complete" next to a check is clear. A green dot alone is not, and a red paragraph that only says "Error" leaves the person with nothing to do. Say what happened and what they can do next.

Numbers and names need the tabular or lining figures of your text face when they sit in a column. Old-style figures jump in a price or a score, and the column becomes harder to compare.

> Write the interface so it can be read aloud and still tell the truth.`,
          },
          {
            id: "les_type_quiz",
            title: "Type quiz",
            kind: "quiz",
            minutes: 8,
            body: quizIntro,
            questions: [
              {
                id: "q_type_1",
                prompt: "Where should a paragraph of instruction sit?",
                explanation: "Long lines are hard to follow. Cap the measure of prose instead of stretching it with the window.",
                choices: [
                  { label: "Across the full width of a wide window", correct: false },
                  { label: "In a measure of about 60 to 75 characters", correct: true },
                  { label: "Centered, so both edges are even", correct: false },
                  { label: "In all capitals, to make it look precise", correct: false },
                ],
              },
              {
                id: "q_type_2",
                prompt: "Two elements share a size, weight, and color. What is true?",
                explanation: "Rank is what people see, not what the file named the style.",
                choices: [
                  { label: "They still differ if their layer names differ", correct: false },
                  { label: "They are the same rank, whatever you intended", correct: true },
                  { label: "The one higher on the page is always the heading", correct: false },
                  { label: "Adding a drop shadow creates a new level", correct: false },
                ],
              },
              {
                id: "q_type_3",
                prompt: "When is a second typeface justified?",
                explanation: "A second face should make a real role difference, usually title versus text, without making the paragraph look imported.",
                choices: [
                  { label: "Whenever the brand guidelines list one", correct: false },
                  { label: "When it clarifies a real role, and the paragraph still belongs to the product", correct: true },
                  { label: "For errors, so they feel more human", correct: false },
                  { label: "For every empty state, as a moment of personality", correct: false },
                ],
              },
              {
                id: "q_type_4",
                prompt: "Which action label does the job?",
                explanation: "An action says what will happen, including the object when it could be confused.",
                choices: [
                  { label: "Submit", correct: false },
                  { label: "OK", correct: false },
                  { label: "Delete course", correct: true },
                  { label: "Click here", correct: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "course_interview",
    slug: "interviewing-users",
    title: "Interviewing Users",
    summary: "Prepare questions that do not lead, then listen for the job.",
    description:
      "An interview is not a demo and not a survey. It is a way to hear the moment someone tries to make progress, in their words.\n\nThis course covers who to talk with, how to ask, and how to leave with evidence instead of a quote you liked.",
    subject: "Research",
    level: "Foundation",
    modules: [
      {
        id: "mod_interview_prep",
        title: "Preparation",
        lessons: [
          {
            id: "les_questions",
            title: "Questions that do not lead",
            kind: "reading",
            minutes: 11,
            body: `A leading question smuggles the answer you hope to hear. People are polite. They will often confirm it, and you will leave with a sentence you wrote yourself.

## Ask for the last time

"Tell me about the last time you prepared a weekly review" beats "Would you use a dashboard for weekly reviews?" The first asks for a memory. The second asks for a prediction, and predictions about future products are compliments more than evidence.

Stay with the sequence of that memory:

- What started it?
- What did you try first?
- Where did you get stuck?
- What did you do then?
- How did you know you were done?

When they abstract — "I usually just check in with the team" — ask for the specific Tuesday. Specifics have tools, workarounds, and irritations in them. Generalities have opinions.

## What not to ask

Avoid "how satisfied are you", "what features do you want", and any question that can be answered yes or no before you have the story. Those can come later, if at all. Also avoid pitching. The moment you explain the product, you have changed the interview into a reaction to your idea.

Write the questions down, then read them aloud. If you can hear the "right" answer, rewrite the question until you cannot.

> The best question is one you do not know the answer to.`,
          },
          {
            id: "les_who",
            title: "Who to talk with",
            kind: "reading",
            minutes: 9,
            body: `The right person is someone who has done the job recently, not someone who has a strong opinion about your industry. A title is a weak proxy. "Opened the weekly report in the last month" is a strong one.

## A small, specific set

Five to eight conversations can teach you the shape of a job if the people share the situation and not much else. Variety of company size is useful. Variety of job — interviewing both the manager and the procurement lead as if they were the same person — muddies the story.

Screen with behavior. "When did you last do this, and what did you use?" If they cannot recall a time, thank them and do not spend the hour hypothesizing.

## Recruiting without biasing

Tell them you want to learn how they handle the situation. Do not tell them you are validating a dashboard. Incentives should pay for the hour, not for enthusiasm. And talk to at least one person who abandoned the task, if you can find them. The people who finished it will describe a path. The people who stopped will describe the obstacle your happy path skips.

Write who you did not talk to. That list belongs next to the findings, so a later decision does not pretend the sample was everyone.

**Do not interview only your friends in the product.** They already share your vocabulary, and they will skip the part where a stranger gets lost.`,
          },
        ],
      },
      {
        id: "mod_interview_session",
        title: "The session",
        lessons: [
          {
            id: "les_listen",
            title: "Listening for the job",
            kind: "reading",
            minutes: 11,
            body: `In the session your job is to stay with their sequence. You are not there to solve the problem, teach them a better way, or collect feature requests. Those impulses are useful later. In the hour, they close the story.

## How to listen

Let pauses stand. A person often adds the real detail after they think they have finished. When you do speak, prefer a short prompt: "What happened next?" or "Where was that?" Mirror their words instead of upgrading them. If they say "the sheet", do not rename it "your analytics workflow" in the next question. You will drag them into your model.

Take notes on what they did, what they used, and what they were trying to finish. Mark quotes that are specific. A quote without a moment attached is easy to misuse in a readout.

## Afterward

Write the job sentence the same day, while the sequence is still vivid, and list the evidence under it. Separate what you heard from what you think it implies. The implication can be wrong. The story of last Tuesday is the part another teammate should be able to check.

Compare notes across interviews before you change the product. One vivid story is a start. A decision wants the moment to repeat. If it does not repeat, narrow the audience or keep looking.

> You are finished listening when you can tell the story without your solution in it.`,
          },
          {
            id: "les_interview_quiz",
            title: "Interview quiz",
            kind: "quiz",
            minutes: 8,
            body: quizIntro,
            questions: [
              {
                id: "q_interview_1",
                prompt: "Which question is least likely to lead?",
                explanation: "Asking for the last real time produces a memory. Asking people to predict their use of your idea produces a compliment.",
                choices: [
                  { label: "Would a dashboard make your reviews easier?", correct: false },
                  { label: "How satisfied are you with reporting today?", correct: false },
                  { label: "Tell me about the last time you prepared a weekly review.", correct: true },
                  { label: "Don't you think the current report is too slow?", correct: false },
                ],
              },
              {
                id: "q_interview_2",
                prompt: "Who is a strong participant?",
                explanation: "Screen for the behavior you are studying, done recently, not for a title or a strong opinion.",
                choices: [
                  { label: "Anyone with the job title you plan to market to", correct: false },
                  { label: "Someone who did this job recently and can recall the tools they used", correct: true },
                  { label: "A friend on the product team who knows the vocabulary", correct: false },
                  { label: "The person with the strongest opinion about the industry", correct: false },
                ],
              },
              {
                id: "q_interview_3",
                prompt: "They answer in generalities. What do you do?",
                explanation: "Specific days contain the workaround. Ask for the last real occasion.",
                choices: [
                  { label: "Move to the next topic so you cover the script", correct: false },
                  { label: "Ask them to walk through the specific last time", correct: true },
                  { label: "Offer your feature as an example", correct: false },
                  { label: "Ask them to score the experience from one to ten", correct: false },
                ],
              },
              {
                id: "q_interview_4",
                prompt: "What should you write the same day?",
                explanation: "Capture the job and the evidence while the sequence is vivid, and keep your inference separate from what you heard.",
                choices: [
                  { label: "The feature list they seemed to want", correct: false },
                  { label: "The job sentence, the evidence under it, and your inference kept apart", correct: true },
                  { label: "A polished quote for the slide", correct: false },
                  { label: "Nothing, so you stay unbiased", correct: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const samplePeople = [
  { id: "sample_amira", name: "Amira Hassan", email: "amira@example.com" },
  { id: "sample_jonah", name: "Jonah Ellis", email: "jonah@example.com" },
  { id: "sample_priya", name: "Priya Shah", email: "priya@example.com" },
];

export const sampleWork: { personId: string; courseId: string; done: string[]; quiz: { lessonId: string; correct: number } | null }[] = [
  { personId: "sample_amira", courseId: "course_critique", done: ["les_purpose", "les_roles", "les_sequence", "les_critique_quiz"], quiz: { lessonId: "les_critique_quiz", correct: 4 } },
  { personId: "sample_jonah", courseId: "course_critique", done: ["les_purpose", "les_roles"], quiz: null },
  { personId: "sample_priya", courseId: "course_critique", done: [], quiz: null },
  { personId: "sample_priya", courseId: "course_sense", done: ["les_job", "les_opportunity", "les_tradeoffs", "les_sense_quiz"], quiz: { lessonId: "les_sense_quiz", correct: 4 } },
  { personId: "sample_jonah", courseId: "course_sense", done: ["les_job", "les_opportunity"], quiz: { lessonId: "les_sense_quiz", correct: 1 } },
  { personId: "sample_amira", courseId: "course_type", done: ["les_measure", "les_pairing"], quiz: null },
  { personId: "sample_jonah", courseId: "course_interview", done: ["les_questions", "les_who", "les_listen", "les_interview_quiz"], quiz: { lessonId: "les_interview_quiz", correct: 3 } },
];
