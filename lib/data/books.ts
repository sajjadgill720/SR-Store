import { Book, BundleOffer, Review } from '../types';

export const BOOKS_DATA: Book[] = [
  {
    id: 'book-deep-work',
    slug: 'the-focused-mind',
    title: 'The Focused Mind: Deep Work in a Distracted World',
    subtitle: 'A practical framework for high cognitive output, intentional attention, and sustainable daily focus.',
    author: 'S.R. Rehman',
    penName: 'S.R. Rehman',
    category: 'Productivity',
    productType: 'ebook',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    accentColor: '#1d4ed8',
    price: 1999, // $19.99
    originalPrice: 2800,
    badge: 'Bestseller',
    conditionLabel: 'Digital Master • EPUB + PDF',
    formats: ['epub', 'pdf'],
    pageCount: 284,
    isbn: '978-1-95432-101-8',
    shortDescription: 'Master the art of unbroken focus, conquer digital fragmentation, and reclaim your deepest creative cognitive powers.',
    fullDescription: 'In an economy engineered to monopolize your attention, depth has become a superpower. "The Focused Mind" presents a rigorous yet compassionate methodology for reconstructing your cognitive environment. Through actionable daily protocols, energy budgeting systems, and attention architecture, this guide equips knowledge workers, writers, and builders to consistently execute meaningful deep work without burnout.',
    targetAudience: 'Knowledge workers, creative professionals, students, and ambitious creators seeking sustained concentration.',
    whatsIncluded: [
      'Reflowable EPUB format optimized for Kindle, Apple Books, and Kobo',
      'Typeset PDF edition with margin callouts and printable worksheets',
      'Daily 90-Minute Focus Protocol template (PDF)',
      'Distraction Audit Checklist & Digital Hygiene matrix'
    ],
    tableOfContents: [
      '1. The Economics of Attention: Why Depth is Scarce and Lucrative',
      '2. Cognitive Architecture: The Biological Anatomy of High Focus',
      '3. The 4-Hour Daily Deep Work Threshold and Energy Budgeting',
      '4. Designing Friction: How to Neutralize Digital Rabbit Holes',
      '5. Solitude and Synthesis: The Weekly Brain Defragmentation Ritual',
      '6. Building Your Lifelong Focus Arsenal'
    ],
    sampleExcerpt: `Chapter 1: The Economics of Attention

The screen hums with quiet insistence. Before you have finished reading the first sentence of a technical memorandum, a red badge pulses in the periphery of your browser. A message arrives from a colleague; an automated notification reports a code build; an algorithmically tailored headline reminds you of world events three thousand miles away.

Each interruption demands only three seconds of your attention. Yet cognitive science has decisively established that the true cost is not three seconds—it is twenty-three minutes.

When you switch tasks, your neurochemistry leaves behind what Dr. Sophie Leroy terms "attention residue." A fraction of your working memory remains tethered to the previous task. Multiply this across sixty workday interruptions, and your intellect operates at a permanent cognitive deficit.

Deep work is not a luxury; it is the foundational prerequisite for high-tier contribution in the twenty-first century...`,
    rightsStatus: 'wide',
    currentEdition: {
      id: 'ed-fm-v2',
      version: 'Edition 2.1 (2026 Revised)',
      releaseDate: 'October 2026',
      releaseNotes: 'Added Chapter 5 companion worksheets, modernized Send-to-Kindle formatting, and improved typography readability.',
      assets: [
        {
          id: 'asset-fm-epub',
          format: 'epub',
          fileName: 'The-Focused-Mind-v2.1.epub',
          fileSize: '3.4 MB',
          storageKey: 'secure/books/focused-mind-2.1.epub',
          mimeType: 'application/epub+zip',
          checksum: 'sha256-a9b8c7d6e5f4...'
        },
        {
          id: 'asset-fm-pdf',
          format: 'pdf',
          fileName: 'The-Focused-Mind-v2.1.pdf',
          fileSize: '7.8 MB',
          storageKey: 'secure/books/focused-mind-2.1.pdf',
          mimeType: 'application/pdf',
          checksum: 'sha256-f1e2d3c4b5a6...'
        }
      ]
    },
    rating: 4.9,
    reviewCount: 142,
    isPublished: true,
    isInStock: true,
    featured: true
  },
  {
    id: 'book-habit-systems',
    slug: 'atomic-architectures',
    title: 'Atomic Architectures: Systems Over Motivation',
    subtitle: 'How to build enduring personal operating habits using behavioral leverage, friction loops, and micro-rituals.',
    author: 'S.R. Rehman',
    penName: 'S.R. Rehman',
    category: 'Personal Growth',
    productType: 'ebook',
    coverImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800&auto=format&fit=crop',
    accentColor: '#059669',
    price: 1850, // $18.50
    originalPrice: 2500,
    badge: 'Popular',
    conditionLabel: 'Digital Master • EPUB + PDF',
    formats: ['epub', 'pdf'],
    pageCount: 240,
    isbn: '978-1-95432-102-5',
    shortDescription: 'Stop relying on fickle willpower. Learn how to design environmental systems that make good habits inevitable.',
    fullDescription: 'Willpower is an exhaustible battery; system architecture is an infinite circuit. "Atomic Architectures" dismantles the common myths of motivational willpower and replaces them with systemic environmental design. Discover how subtle cues in your physical workspace, timing triggers, and identity accountability loops can automate compounding progress.',
    targetAudience: 'Professionals seeking dependable consistency in health, deep study, writing, and creative craft.',
    whatsIncluded: [
      'Reflowable EPUB format compatible with all major e-readers',
      'Interactive PDF Edition with editable daily habit scorecards',
      'The Habit Stacking Cheat Sheet (Print-ready single-page reference)'
    ],
    tableOfContents: [
      '1. The Fallacy of Raw Willpower: Biology vs Architecture',
      '2. Designing Physical Friction: The 20-Second Rule',
      '3. Micro-Habit Stacking: Connecting Nuance to Identity',
      '4. Failure Recovery Protocols: Never Miss Twice',
      '5. The 90-Day Compounding Log'
    ],
    sampleExcerpt: `Chapter 1: The Fallacy of Raw Willpower

Every January, millions of people make vows backed by pure emotional fervor. By February, ninety-two percent of those commitments lie abandoned.

The popular diagnosis for this failure is character deficiency: "I lacked discipline." But behavioral physiology shows the opposite: relying on discipline is itself the strategic flaw.

Discipline requires glucose, prefrontal cortex engagement, and emotional tranquility. System architecture requires only that you exist in an environment you arranged in advance. When your shoes sit by the front door and your phone sleeps in another room, the decision is already made before your executive brain can protest...`,
    rightsStatus: 'wide',
    currentEdition: {
      id: 'ed-aa-v1',
      version: 'Edition 1.4',
      releaseDate: 'August 2026',
      releaseNotes: 'Refined habit scorecard layout and added high-contrast reading profile.',
      assets: [
        {
          id: 'asset-aa-epub',
          format: 'epub',
          fileName: 'Atomic-Architectures-v1.4.epub',
          fileSize: '2.8 MB',
          storageKey: 'secure/books/atomic-arch-1.4.epub',
          mimeType: 'application/epub+zip',
          checksum: 'sha256-b8c7d6e5...'
        },
        {
          id: 'asset-aa-pdf',
          format: 'pdf',
          fileName: 'Atomic-Architectures-v1.4.pdf',
          fileSize: '6.2 MB',
          storageKey: 'secure/books/atomic-arch-1.4.pdf',
          mimeType: 'application/pdf',
          checksum: 'sha256-c7d6e5f4...'
        }
      ]
    },
    rating: 4.8,
    reviewCount: 98,
    isPublished: true,
    isInStock: true,
    featured: true
  },
  {
    id: 'book-kids-printable-pack',
    slug: 'explorers-mind-activities',
    title: 'The Young Explorer: STEM & Mindfulness Activity Pack',
    subtitle: '75 high-resolution printable worksheets, sensory mindfulness mazes, and creative logic puzzles for ages 6–10.',
    author: 'S.R. Rehman',
    penName: 'S.R. Rehman',
    category: 'Children & Family',
    productType: 'printable',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    accentColor: '#d97706',
    price: 1400, // $14.00
    originalPrice: 2000,
    badge: 'Parent Favorite',
    conditionLabel: 'Printable PDF • High-Res 300 DPI',
    formats: ['printable_pdf'],
    pageCount: 88,
    isbn: '978-1-95432-103-2',
    shortDescription: 'Delightful, screen-free learning worksheets with calming mindfulness drawing and engaging nature-themed STEM challenges.',
    fullDescription: 'Crafted specifically for parents looking for wholesome, screen-free learning activities. "The Young Explorer" combines playful STEM concepts with gentle mindfulness exercises. Printable on standard US Letter or A4 household printers, these high-contrast vector illustrations invite hours of curious discovery, calm focus, and creative problem-solving.',
    targetAudience: 'Parents, homeschool educators, and grandparents of children ages 6 to 10.',
    whatsIncluded: [
      'High-Resolution 300 DPI PDF formatted for standard household printers',
      'Both US Letter (8.5 x 11 in) and International A4 sizing included',
      'Unlimited personal household re-printing license for your children',
      'Answer Keys & Parent Companion Discussion Prompts'
    ],
    tableOfContents: [
      'Part 1: Nature Explorers — Animal Tracks, Forest Navigation, Botany Sketches',
      'Part 2: Logic Quests — Space Maze, Pattern Decoders, Geometry Puzzles',
      'Part 3: Calm Breathing Mazes — Finger-Trace Labyrinths and Emotion Wheels',
      'Part 4: Creative Inventing — Blueprint Sheets for Young Builders'
    ],
    sampleExcerpt: `Parent Introduction & Printing Guide

Welcome to The Young Explorer! This collection was designed to offer children a peaceful, tactile haven away from rapid-fire screen animations.

Recommended Printing Instructions:
- Paper: Standard 20lb or heavier 28lb paper for best marker/crayon durability.
- Settings: "Fit to Printable Area" or "Actual Size (100%)". Both US Letter and A4 margins have been calibrated with generous 0.5-inch safety gutters.
- License: You have full personal rights to print as many copies as needed for children in your immediate household.`,
    rightsStatus: 'wide',
    currentEdition: {
      id: 'ed-ye-v1',
      version: 'Edition 1.2 (Printable Vector Edition)',
      releaseDate: 'September 2026',
      releaseNotes: 'Enhanced vector line weights for standard black & white home laser printers.',
      assets: [
        {
          id: 'asset-ye-pdf-letter',
          format: 'printable_pdf',
          fileName: 'The-Young-Explorer-US-Letter.pdf',
          fileSize: '18.4 MB',
          storageKey: 'secure/printables/young-explorer-letter.pdf',
          mimeType: 'application/pdf',
          checksum: 'sha256-e4d3c2b1...'
        },
        {
          id: 'asset-ye-pdf-a4',
          format: 'printable_pdf',
          fileName: 'The-Young-Explorer-A4.pdf',
          fileSize: '18.2 MB',
          storageKey: 'secure/printables/young-explorer-a4.pdf',
          mimeType: 'application/pdf',
          checksum: 'sha256-d3c2b1a0...'
        }
      ]
    },
    rating: 5.0,
    reviewCount: 64,
    isPublished: true,
    isInStock: true,
    featured: false
  },
  {
    id: 'book-solo-architect',
    slug: 'the-solo-architect',
    title: 'The Solo Architect: Building High-Leverage Software',
    subtitle: 'From specification to production: how one disciplined engineer ships durable software in days, not quarters.',
    author: 'S.R. Rehman',
    penName: 'S.R. Rehman',
    category: 'Nonfiction',
    productType: 'ebook',
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
    accentColor: '#0f766e',
    price: 2400, // $24.00
    originalPrice: 3200,
    badge: 'New Release',
    conditionLabel: 'Digital Master • EPUB + PDF',
    formats: ['epub', 'pdf'],
    pageCount: 312,
    isbn: '978-1-95432-104-9',
    shortDescription: 'The modern playbook for individual builders: ruthless prioritization, modular monoliths, and agentic leverage.',
    fullDescription: 'Building resilient software no longer requires fifty engineers or layers of management. "The Solo Architect" details the engineering principles, architectural patterns, and automation workflows that allow a single craftsperson to conceive, engineer, and deploy mission-critical systems with speed and surgical precision.',
    targetAudience: 'Software engineers, technical founders, and solo developers seeking maximum leverage.',
    whatsIncluded: [
      'Reflowable EPUB + Typeset PDF format',
      'System Architecture Blueprint Checklist',
      'Production Deployment & Rollback Runbook template'
    ],
    tableOfContents: [
      '1. The Monolith Reclaimed: Simplicity as a Superpower',
      '2. Invariant-Driven Design: Making Illegal States Unrepresentable',
      '3. Ergonomic Schemas and Database-Backed Outbox Patterns',
      '4. Agentic Pair Programming: Directing the Coding Assistant',
      '5. Testing What Truly Matters in Commercial Software'
    ],
    sampleExcerpt: `Chapter 1: The Monolith Reclaimed

For a decade, the software industry suffered from collective organizational mimicry. Startups with two engineers and twenty users were instructed to decompose their application into forty microservices, orchestrate them with Kubernetes clusters, and communicate via distributed message buses.

The result was predictable: overwhelming latency, distributed transaction chaos, and massive cloud hosting invoices.

The Solo Architect chooses a different path: the modular monolith. By co-locating domain boundaries in a single, well-typed repository with explicit database transactions, you eliminate network boundaries from your critical path...`,
    rightsStatus: 'wide',
    currentEdition: {
      id: 'ed-sa-v1',
      version: 'Edition 1.0 (First Release)',
      releaseDate: 'October 2026',
      releaseNotes: 'First published edition.',
      assets: [
        {
          id: 'asset-sa-epub',
          format: 'epub',
          fileName: 'The-Solo-Architect-v1.0.epub',
          fileSize: '4.1 MB',
          storageKey: 'secure/books/solo-architect-1.0.epub',
          mimeType: 'application/epub+zip',
          checksum: 'sha256-789abcde...'
        },
        {
          id: 'asset-sa-pdf',
          format: 'pdf',
          fileName: 'The-Solo-Architect-v1.0.pdf',
          fileSize: '9.2 MB',
          storageKey: 'secure/books/solo-architect-1.0.pdf',
          mimeType: 'application/pdf',
          checksum: 'sha256-89abcdef...'
        }
      ]
    },
    rating: 4.9,
    reviewCount: 38,
    isPublished: true,
    isInStock: true,
    featured: true
  }
];

export const BUNDLES_DATA: BundleOffer[] = [
  {
    id: 'bundle-mastery-pack',
    slug: 'the-complete-mastery-bundle',
    title: 'The Complete Mastery & Productivity Bundle',
    subtitle: 'Get both "The Focused Mind" and "Atomic Architectures" together with exclusive companion habit scorecards and focus worksheets.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    books: [BOOKS_DATA[0], BOOKS_DATA[1]],
    price: 2999, // $29.99 (Standalone: $19.99 + $18.50 = $38.49)
    originalPrice: 3849,
    savingsPercentage: 22,
    badge: 'Best Value • Save 22%',
    description: 'The ultimate dual-edition digital box set for deep focus and sustainable behavioral architecture. Includes complete EPUB and PDF editions for both titles, plus all bonus worksheets.'
  }
];

export const REVIEWS_DATA: Review[] = [
  {
    id: 'rev-1',
    bookId: 'book-deep-work',
    authorName: 'David H.',
    location: 'United States',
    rating: 5,
    reviewText: 'The Focused Mind completely rewired how I plan my mornings. The daily 90-minute focus protocol cut my workday stress in half while doubling my actual output.',
    createdAt: '2026-09-28',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    id: 'rev-2',
    bookId: 'book-deep-work',
    authorName: 'Sarah Jenkins',
    location: 'United Kingdom',
    rating: 5,
    reviewText: 'Clean, practical, and devoid of fluff. The EPUB loaded seamlessly into my Kindle app, and the formatting is pristine.',
    createdAt: '2026-10-02',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    id: 'rev-3',
    bookId: 'book-habit-systems',
    authorName: 'Marcus Chen',
    location: 'Canada',
    rating: 5,
    reviewText: 'Atomic Architectures teaches environmental design instead of lecturing about willpower. The 20-second rule and habit stack templates alone are worth ten times the price.',
    createdAt: '2026-10-04',
    isVerifiedPurchase: true,
    isApproved: true
  },
  {
    id: 'rev-4',
    bookId: 'book-kids-printable-pack',
    authorName: 'Emily Watson',
    location: 'Australia',
    rating: 5,
    reviewText: 'Printed these out on our home printer for a rainy weekend. The calm breathing mazes kept our 7-year old thoroughly engaged and peaceful without a tablet in sight.',
    createdAt: '2026-09-19',
    isVerifiedPurchase: true,
    isApproved: true
  }
];

export function getAllBooks(): Book[] {
  return BOOKS_DATA;
}

export function getBookBySlug(slug: string): Book | undefined {
  return BOOKS_DATA.find((b) => b.slug === slug);
}

export function getBookById(id: string): Book | undefined {
  return BOOKS_DATA.find((b) => b.id === id);
}

export function getAllBundles(): BundleOffer[] {
  return BUNDLES_DATA;
}

export function getBundleBySlug(slug: string): BundleOffer | undefined {
  return BUNDLES_DATA.find((b) => b.slug === slug);
}

export function getReviewsForBook(bookId: string): Review[] {
  return REVIEWS_DATA.filter((r) => r.bookId === bookId && r.isApproved);
}
