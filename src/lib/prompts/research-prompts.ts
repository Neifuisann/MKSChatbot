export type ResearchPrompt = {
  id: string;
  code: string;
  category: string;
  title: string;
  purpose: string;
  content: string;
  tip: string;
  sortOrder: number;
};

export type PromptRow = {
  id: string;
  code: string;
  category: string;
  title: string;
  purpose: string;
  content: string;
  tip: string;
  sort_order: number;
};

export function mapPromptRow(row: PromptRow): ResearchPrompt {
  return {
    id: row.id,
    code: row.code,
    category: row.category,
    title: row.title,
    purpose: row.purpose,
    content: row.content,
    tip: row.tip,
    sortOrder: row.sort_order,
  };
}
