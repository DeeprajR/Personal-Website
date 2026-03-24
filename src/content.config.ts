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

const researchCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/research" }),
  schema: z.object({
    title: z.string(),
    hook: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    bannerImage: z.string().optional(),
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

export const collections = {
  'work': workCollection,
  'research': researchCollection,
  'photography': photographyCollection,
  'hobbies': hobbiesCollection,
  'library': libraryCollection,
};
