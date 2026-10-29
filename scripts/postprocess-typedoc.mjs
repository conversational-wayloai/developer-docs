// Turns typedoc-plugin-markdown output into Fumadocs pages: frontmatter, absolute links, descriptions, folder icons.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, posix, relative } from 'node:path';

const root = 'content/docs/web-sdk/api';
const url = '/docs/web-sdk/api';
const folders = {
  classes: { title: 'Classes', icon: 'Cube' },
  interfaces: { title: 'Interfaces', icon: 'BracketsCurly' },
  'type-aliases': { title: 'Types', icon: 'TextT' },
};

function absoluteLinks(text, directory) {
  return text.replace(/\]\((?!\w+:|#|\/)([^)#\s]+)\.mdx(#[^)\s]*)?\)/g, (_, path, hash = '') => {
    const target = posix.join(url, directory, path).replace(/\/index$/, '');

    return `](${target}${hash})`;
  });
}

function fields(body) {
  const names = [...body.matchAll(/^\| <a id="property-[^"]+"><\/a> `([^`?]+)\??`/gm)].map(
    match => match[1],
  );

  return names.length ? `Fields: ${names.join(', ')}.` : undefined;
}

function summary(body) {
  const paragraph = body
    .split(/\n{2,}/)
    .map(block => block.trim())
    .find(block => block && !/^(?:#|```|\||-|\*|>|`[^`]+`$)/.test(block));

  return paragraph?.replace(/`/g, '').replace(/\s*\n\s*/g, ' ');
}

function walk(directory) {
  for (const name of readdirSync(directory)) {
    const file = join(directory, name);

    if (statSync(file).isDirectory()) {
      writeFileSync(
        join(file, 'meta.json'),
        `${JSON.stringify(folders[name] ?? { title: name })}\n`,
      );
      walk(file);
    } else if (name.endsWith('.mdx')) {
      const raw = readFileSync(file, 'utf8');

      if (raw.startsWith('---')) continue;
      const text = absoluteLinks(raw, relative(root, directory).split('\\').join('/'));
      const match = text.match(/^# (.+)\n+/m);
      const title = (match?.[1] ?? name.replace('.mdx', ''))
        .replace(/^(Class|Interface|Type Alias): /, '')
        .replace(/\\/g, '');
      const body = match ? text.replace(match[0], '') : text;
      const description =
        name === 'index.mdx'
          ? 'Generated from the TypeScript of @waylovoice/client.'
          : (summary(body) ?? fields(body) ?? `The ${title} type of @waylovoice/client.`);
      const frontmatter = `title: ${JSON.stringify(name === 'index.mdx' ? 'API reference' : title)}\ndescription: ${JSON.stringify(description)}`;

      writeFileSync(file, `---\n${frontmatter}\n---\n\n${body}`);
    }
  }
}

walk(root);
writeFileSync(
  join(root, 'meta.json'),
  `${JSON.stringify({
    title: 'API reference',
    icon: 'Code',
    defaultOpen: false,
    pages: ['index', '...'],
  })}\n`,
);
