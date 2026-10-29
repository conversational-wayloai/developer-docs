import type { ComponentProps, ReactNode } from 'react';
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
    return description ? md`- [${title}](${href}): ${description}` : md`- [${title}](${href})`;
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
