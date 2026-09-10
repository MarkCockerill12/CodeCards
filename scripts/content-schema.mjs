import { z } from 'zod';

export const CARD_TYPES = [
  'flip',
  'predict-output',
  'spot-bug',
  'cloze',
  'compare',
  'complexity',
  'scenario',
];

export const resourceSchema = z.object({
  title: z.string().min(3),
  url: z.string().url(),
  kind: z.enum(['docs', 'article', 'video', 'spec', 'book', 'tool']),
});

export const cardSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'card ids are lowercase-kebab'),
    type: z.enum(CARD_TYPES),
    difficulty: z.number().int().min(1).max(5),
    tags: z.array(z.string().regex(/^[a-z0-9.+#-]+$/)).min(1),
    prompt: z.string().min(5),
    answer: z.string().min(1),
    explanation: z.string().min(20, 'explanations must stand on their own without the link'),
    code: z.string().optional(),
    lang: z.string().optional(),
    columns: z
      .object({
        left: z.object({ title: z.string(), points: z.array(z.string()).min(1) }),
        right: z.object({ title: z.string(), points: z.array(z.string()).min(1) }),
      })
      .optional(),
    complexity: z.object({ time: z.string(), space: z.string().optional() }).optional(),
    prerequisites: z.array(z.string()).optional(),
    resources: z.array(resourceSchema).min(1, 'every card needs at least one resource'),
    verify: z
      .object({
        runtime: z.enum(['node', 'python']),
        expectedOutput: z.string(),
      })
      .optional(),
    verifiedAt: z.string().optional(),
  })
  .superRefine((card, ctx) => {
    const needsCode = ['predict-output', 'spot-bug'];
    if (needsCode.includes(card.type) && !card.code) {
      ctx.addIssue({ code: 'custom', message: `${card.type} cards require a code snippet` });
    }
    if (card.code && !card.lang) {
      ctx.addIssue({ code: 'custom', message: 'cards with code must declare a lang' });
    }
    if (card.type === 'cloze' && !card.prompt.includes('___')) {
      ctx.addIssue({ code: 'custom', message: 'cloze prompts must contain a ___ blank' });
    }
    if (card.type === 'compare' && !card.columns) {
      ctx.addIssue({ code: 'custom', message: 'compare cards require columns' });
    }
    if (card.type === 'complexity' && !card.complexity) {
      ctx.addIssue({ code: 'custom', message: 'complexity cards require a complexity block' });
    }
    if (card.verify && !card.code) {
      ctx.addIssue({ code: 'custom', message: 'verify blocks need code to run' });
    }
  });

export const moduleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2),
  description: z.string().min(10),
  cards: z.array(cardSchema).min(1),
});

export const topicSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  icon: z.string().min(1),
  category: z.string().min(2),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  description: z.string().min(10),
  modules: z.array(moduleSchema).min(1),
});
