export interface Circle {
  slug: string;
  name: string;
  category: string;
  description: string;
  intention: string;
  icon: 'focus' | 'habits' | 'family';
  bookSlug: string;
  bookTitle: string;
  prompts: string[];
}
export interface Discussion {
  slug: string;
  circle: string;
  title: string;
  excerpt: string;
  body: string[];
  category: 'Reflection' | 'Question' | 'Practice';
  minutes: number;
}
export const CIRCLES: Circle[] = [
  { slug: 'the-focus-room', name: 'The Focus Room', category: 'Productivity', icon: 'focus', description: 'Less distraction. More room for the work that matters.', intention: 'Build a calmer relationship with attention through short reading sessions and practical experiments.', bookSlug: 'the-focused-mind', bookTitle: 'The Focused Mind', prompts: ['Notice what interrupts your attention today.', 'Try one uninterrupted 25-minute reading session.', 'Write down one boundary you want to protect.'] },
  { slug: 'small-steps-club', name: 'Small Steps Club', category: 'Personal growth', icon: 'habits', description: 'A place for tiny habits and thoughtful progress.', intention: 'Explore how everyday environments and small actions make change easier to repeat.', bookSlug: 'atomic-architectures', bookTitle: 'Atomic Architectures', prompts: ['Choose one habit small enough for a difficult day.', 'Connect it to something you already do.', 'Reflect on what made it easier, without judging the result.'] },
  { slug: 'curious-families', name: 'Curious Families', category: 'Family & learning', icon: 'family', description: 'Make space for curiosity, creativity, and shared reading.', intention: 'Find simple ways to bring reading and screen-free discovery into family life. Keep children’s personal information private.', bookSlug: 'explorers-mind-activities', bookTitle: 'The Young Explorer', prompts: ['Let everyone choose a question they are curious about.', 'Try a ten-minute screen-free activity together.', 'Capture the idea, rather than a child’s identifying details.'] },
];
export const DISCUSSIONS: Discussion[] = [
  { slug: 'protecting-your-first-hour', circle: 'the-focus-room', title: 'What would you protect in your first hour?', excerpt: 'A gentle experiment in giving your attention a place to land before the day gets noisy.', category: 'Reflection', minutes: 3, body: ['The first hour does not have to be a productivity contest. It can be a small pocket of quiet: a chapter, a notebook, or a task that deserves your full attention.', 'Consider the first thing that usually claims your attention. Is it a choice, or a default? What would change if you made a little space before responding?', 'For your next reading session, choose one interruption to remove. Afterwards, write what you noticed. There is no perfect routine to copy; the useful routine is the one that fits your life.'] },
  { slug: 'reading-without-finishing', circle: 'the-focus-room', title: 'Can a few pages be enough?', excerpt: 'On reading slowly, returning to a passage, and letting a good idea settle.', category: 'Question', minutes: 2, body: ['A reading habit can become another checklist. But finishing a book is not the only way to learn from it.', 'Try reading a few pages and pausing when something catches your attention. Put the book down and explain the idea in your own words.', 'What would a satisfying reading session look like if page count did not matter?'] },
  { slug: 'make-the-next-step-smaller', circle: 'small-steps-club', title: 'Make the next step smaller', excerpt: 'Turn an ambitious habit into a version that still works on an ordinary Tuesday.', category: 'Practice', minutes: 4, body: ['Choose one habit you have been trying to build. Now imagine doing it on a low-energy day.', 'Reduce the first step until starting feels easy: open the book, put a glass of water on the desk, or write a single sentence.', 'Try that version for three days. Note what helped you begin. You can expand later; today, make the doorway easier to walk through.'] },
  { slug: 'design-a-reading-corner', circle: 'small-steps-club', title: 'Design a reading corner, not a perfect routine', excerpt: 'What can your environment do for you when motivation is missing?', category: 'Question', minutes: 3, body: ['Your surroundings can offer a quiet invitation to read. A visible book and a comfortable chair can be more useful than a complicated schedule.', 'Choose one small change: leave a book within reach, charge your phone elsewhere, or place a notebook beside your reading spot.', 'Which change would remove the most friction for you?'] },
  { slug: 'follow-one-good-question', circle: 'curious-families', title: 'Follow one good question together', excerpt: 'An easy invitation to shared curiosity, with no supplies or perfect answers required.', category: 'Practice', minutes: 3, body: ['Start with a question someone asks during an ordinary day. Why does a shadow move? What makes a story funny?', 'Spend ten minutes exploring it together through drawing, talking, or looking at a book. You do not need to know the answer beforehand.', 'In your journal, capture the question and an idea for next time. Avoid names, photos, schools, or other identifying details about children.'] },
];
export const getCircle = (slug: string) => CIRCLES.find(circle => circle.slug === slug);
export const getDiscussion = (slug: string) => DISCUSSIONS.find(discussion => discussion.slug === slug);
