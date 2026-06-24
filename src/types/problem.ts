export type Difficulty = "easy" | "medium" | "hard";

export type ClarificationFact = {
  question: string;
  answer: string;
};

export type Problem = {
  id: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  /** Deliberately vague prompt shown to the user */
  prompt: string;
  /** Canned facts revealed when user asks clarifying questions */
  clarificationFacts: ClarificationFact[];
  /** Hidden from client — used to ground LLM critique */
  rubric: string[];
  /** Hidden from client — revealed in debrief as "one strong approach" */
  referenceDesign: string;
};
