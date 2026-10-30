import type { ComponentProps, ReactNode } from 'react';
import { BrainIcon, EarIcon, SpeakerHighIcon } from '@phosphor-icons/react/ssr';
import { cn } from 'cn';
import { asMarkdown, md } from 'fumadocs-core/server';
import { Callout as UiCallout } from 'fumadocs-ui/components/callout';
import { Card as UiCard, Cards as UiCards } from 'fumadocs-ui/components/card';
import { Step as UiStep, Steps as UiSteps } from 'fumadocs-ui/components/steps';

import UiMermaid from '~/components/Mermaid';

// Every component that content uses as JSX defines its Markdown form here, next to its HTML form.
// Without one, the .md and llms output show the raw JSX.

async function calloutMarkdown(title: ReactNode, children: ReactNode) {
  const body = await stringify(children);

  return title ? md`**${title}.** ${body}\n\n` : `${body}\n\n`;
}

// One list: without this each card would be its own paragraph.
async function cardsMarkdown(children: ReactNode) {
  const list = await stringify(children);

  return `${list.replace(/\n{2,}/g, '\n')}\n\n`;
}

async function stageMarkdown(label: string, title: string | undefined, children: ReactNode) {
  const text = await stringify(children);

  return `- **${label}**${title ? ` (${title})` : ''}: ${text}`;
}

async function stringify(children: ReactNode) {
  const text = await md`${children}`;

  return text.trim();
}

export function Callout(props: ComponentProps<typeof UiCallout>) {
  const { children, title } = props;

  if (asMarkdown()) return calloutMarkdown(title, children);

  return <UiCallout {...props} />;
}

export function Card(props: ComponentProps<typeof UiCard>) {
  const { description, href, title } = props;

  if (asMarkdown()) {
    const label = href ? md`[${title}](${href})` : md`**${title}**`;

    return description ? md`- ${label}: ${description}` : md`- ${label}`;
  }

  return <UiCard {...props} />;
}

export function Cards(props: ComponentProps<typeof UiCards>) {
  const { children } = props;

  if (asMarkdown()) return cardsMarkdown(children);

  return <UiCards {...props} />;
}

export function Mermaid(props: ComponentProps<typeof UiMermaid>) {
  const { chart } = props;

  if (asMarkdown()) return `\`\`\`mermaid\n${chart.trim()}\n\`\`\`\n\n`;

  return <UiMermaid {...props} />;
}

export function Step(props: ComponentProps<typeof UiStep>) {
  const { children } = props;

  if (asMarkdown()) return md`${children}`;

  return <UiStep {...props} />;
}

export function Steps(props: ComponentProps<typeof UiSteps>) {
  const { children } = props;

  if (asMarkdown()) return md`${children}`;

  return <UiSteps {...props} />;
}

// Labels, icons and colours copied from the application's agent editor (AgentConfig/sections.tsx),
// so a reader recognises each stage in the dashboard.
const STAGES = {
  transcriber: { color: 'text-orange-500', Icon: EarIcon, label: 'Transcriber' },
  model: { color: 'text-blue-500', Icon: BrainIcon, label: 'Model' },
  voice: { color: 'text-purple-500', Icon: SpeakerHighIcon, label: 'Voice' },
} as const;

interface StageCardProps {
  children: ReactNode;
  stage: keyof typeof STAGES;
  title?: string;
}

export function StageCard(props: StageCardProps) {
  const { children, stage, title } = props;
  const { color, Icon, label } = STAGES[stage];

  if (asMarkdown()) return stageMarkdown(label, title, children);

  return (
    <div className="not-prose flex flex-col gap-3 rounded-xl border bg-fd-card p-4 @max-lg:col-span-full">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-fd-muted-foreground">
        <Icon className={cn('size-5 shrink-0', color)} />
        <span>{label}</span>
      </div>
      <div className="flex flex-col gap-1">
        {!!title && <p className="font-semibold leading-tight">{title}</p>}
        <div className="text-sm text-fd-card-foreground [&>p+p]:mt-2">{children}</div>
      </div>
    </div>
  );
}
