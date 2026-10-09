import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One file per project. `section` decides which home-page group it appears in (the
// David Shaver layout: professional work first, then studio, then earlier work).
const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    role: z.string(),
    dates: z.string(),
    section: z.enum(['professional', 'studio', 'earlier']),
    order: z.number(),
    summary: z.string(),
    tech: z.array(z.string()).default([]),
    cover: z.string().optional(),
    // YouTube video id (the part after watch?v=). Shown instead of the cover when set.
    video: z.string().optional(),
    coverAlt: z.string().optional(),
    // Real code or config from the project, shown as the tile's picture when there is no video
    // or screenshot. Never a drawn illustration.
    snippet: z.object({ file: z.string(), code: z.string() }).optional(),
    // For work with nothing public to show (employers' private code): a few facts on the tile instead.
    highlights: z.array(z.string()).default([]),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string(),
    kind: z.enum(['postmortem', 'engineering', 'design', 'devlog']),
    // Shown after the kind, e.g. "design takeaway".
    tag: z.enum(['takeaway', 'learning', 'adopted', 'postmortem', 'consideration']).optional(),
    project: z.string().optional(),
  }),
});

export const collections = { projects, writing };
