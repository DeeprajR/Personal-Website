export interface LearningTopic {
  id: string;
  name: string;
  status: 'active' | 'planned' | 'completed';
  description: string;
}

export const learningTopics: LearningTopic[] = [
  {
    id: 'mckinsey-forward',
    name: 'McKinsey Forward Learning Program',
    status: 'active',
    description: 'Building core problem-solving, communication, and leadership capabilities through McKinsey\'s structured program.',
  
  },
  {
    id: 'generative-ai',
    name: 'Generative AI',
    status: 'active',
    description: 'Understanding foundational models, prompt engineering, RAG architectures, and production AI systems.',
  },
  {
    id: 'sql',
    name: 'SQL',
    status: 'planned',
    description: 'Mastering relational databases, complex queries, performance tuning, and data modeling.',
  },
  {
    id: 'python',
    name: 'Python',
    status: 'planned',
    description: 'Deep-diving into Python for data analysis, automation, and backend development.',
    },
  {
    id: 'ux',
    name: 'UX Design',
    status: 'planned',
    description: 'Learning user research methods, interaction design patterns, and usability testing frameworks.',
  },
  {
    id: 'product-management',
    name: 'Product Management',
    status: 'planned',
    description: 'Deepening expertise in product strategy, roadmap prioritization, and stakeholder alignment.',
  },
  {
    id: 'system-design',
    name: 'System Design',
    status: 'planned',
    description: 'Understanding distributed systems, scalability patterns, and architectural trade-offs.',
  },
];

export function getTopicById(id: string): LearningTopic | undefined {
  return learningTopics.find(t => t.id === id);
}
