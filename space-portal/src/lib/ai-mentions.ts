import { part450FormTemplate } from '@/lib/mock-data';
import {
  FileText,
  CheckCircle,
  Shield,
  Target,
  Clock,
  Sparkles,
  MessageSquare,
  Upload,
  type LucideIcon,
} from 'lucide-react';

export type MentionType = 'field' | 'section' | 'action';

export interface MentionItem {
  id: string;
  type: MentionType;
  label: string;
  description?: string;
  fieldName?: string;
  sectionTitle?: string;
  prompt?: string;
  icon: LucideIcon;
}

const ACTION_MENTIONS: MentionItem[] = [
  {
    id: 'action-fill',
    type: 'action',
    label: 'Fill Form',
    description: 'Auto-fill from mission description',
    prompt: 'Help me fill out a Part 450 application with my mission details',
    icon: FileText,
  },
  {
    id: 'action-compliance',
    type: 'action',
    label: 'Check Compliance',
    description: 'Verify FAA Part 450 requirements',
    prompt: 'Check my application for FAA Part 450 compliance',
    icon: CheckCircle,
  },
  {
    id: 'action-safety',
    type: 'action',
    label: 'Safety Review',
    description: 'Review safety and risk considerations',
    prompt: 'Review safety considerations for my launch mission',
    icon: Shield,
  },
  {
    id: 'action-analyze',
    type: 'action',
    label: 'Analyze Mission',
    description: 'Detailed mission analysis',
    prompt: 'Analyze my mission description and provide insights',
    icon: Target,
  },
  {
    id: 'action-timeline',
    type: 'action',
    label: 'Timeline Planning',
    description: 'Plan application and launch timeline',
    prompt: 'Help me plan the timeline for my launch application',
    icon: Clock,
  },
  {
    id: 'action-document',
    type: 'action',
    label: 'Analyze Documents',
    description: 'Extract info from uploaded documents',
    prompt: 'Analyze my uploaded documents for Part 450 application relevance',
    icon: Upload,
  },
  {
    id: 'action-best-practices',
    type: 'action',
    label: 'Best Practices',
    description: 'Tips for successful applications',
    prompt: 'What are best practices for a successful Part 450 application?',
    icon: Sparkles,
  },
  {
    id: 'action-help',
    type: 'action',
    label: 'Get Help',
    description: 'General Part 450 guidance',
    prompt: 'What are the key FAA Part 450 requirements I should know?',
    icon: MessageSquare,
  },
];

function buildFieldMentions(): MentionItem[] {
  const items: MentionItem[] = [];

  part450FormTemplate.sections.forEach((section) => {
    const sectionTitle = section.title.replace(/\n/g, ' ');
    items.push({
      id: `section-${sectionTitle}`,
      type: 'section',
      label: sectionTitle,
      description: `All fields in ${sectionTitle}`,
      sectionTitle,
      prompt: `Help me complete the "${sectionTitle}" section of my Part 450 application`,
      icon: FileText,
    });

    section.fields.forEach((field) => {
      items.push({
        id: `field-${field.name}`,
        type: 'field',
        label: field.label,
        description: sectionTitle,
        fieldName: field.name,
        sectionTitle,
        prompt: `Help me write content for the "${field.label}" field in my Part 450 application. Provide FAA-ready language.`,
        icon: FileText,
      });
    });
  });

  return items;
}

export const ALL_MENTION_ITEMS: MentionItem[] = [
  ...ACTION_MENTIONS,
  ...buildFieldMentions(),
];

export function filterMentions(query: string): MentionItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_MENTION_ITEMS.slice(0, 12);

  return ALL_MENTION_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.sectionTitle?.toLowerCase().includes(q) ||
      item.fieldName?.toLowerCase().includes(q)
  ).slice(0, 12);
}

export function expandMentionsInText(text: string): string {
  let expanded = text;

  for (const item of ALL_MENTION_ITEMS) {
    const pattern = new RegExp(`@${escapeRegex(item.label)}`, 'gi');
    if (item.type === 'field' && item.fieldName) {
      expanded = expanded.replace(
        pattern,
        `[Regarding Part 450 field "${item.label}" (field: ${item.fieldName})]`
      );
    } else if (item.type === 'section') {
      expanded = expanded.replace(
        pattern,
        `[Regarding Part 450 section "${item.label}"]`
      );
    }
  }

  return expanded;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function getMentionQueryAtCursor(
  text: string,
  cursorPos: number
): { query: string; startIndex: number } | null {
  const before = text.slice(0, cursorPos);
  const atMatch = before.match(/@([\w\s./()-]*)$/);
  if (!atMatch) return null;
  return {
    query: atMatch[1],
    startIndex: cursorPos - atMatch[0].length,
  };
}
