import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const workCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    url: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const learningCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/learning" }),
  schema: z.object({
    title: z.string(),
    hook: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
  }),
});

const photographyCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photography" }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    date: z.coerce.date(),
  }),
});

const hobbiesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/hobbies" }),
  schema: z.object({
    title: z.string(),
    hook: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    bannerImage: z.string().optional(),
  }),
});

const libraryCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/library" }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    coverImage: z.string().optional(),
    url: z.string().url().optional(),
    dateAdded: z.coerce.date(),
    genres: z.array(z.string()).optional(),
  }),
});

const jobsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/jobs" }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    status: z.enum(['active', 'expired']).default('active'),
    workMode: z.enum(['In-Office', 'Remote', 'Hybrid']),
    employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Freelance']),
    location: z.string().optional(),
    salary: z.string().optional(),
    skills: z.array(z.string()),
    dateAdded: z.coerce.date(),
  }),
});

const talentCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/talent" }),
  schema: z.object({
    name: z.string(),
    headline: z.string(),
    experience: z.string(),
    skills: z.array(z.string()),
    linkedin: z.string().url().optional(),
    portfolio: z.string().url().optional(),
    dateAdded: z.coerce.date(),
  }),
});

export const collections = {
  'work': workCollection,
  'learning': learningCollection,
  'photography': photographyCollection,
  'hobbies': hobbiesCollection,
  'library': libraryCollection,
  'jobs': jobsCollection,
  'talent': talentCollection,
};
