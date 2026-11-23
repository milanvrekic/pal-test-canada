import { Linking, View } from 'react-native';

import { Spacing } from '@/constants/theme';

import { ThemedText } from './themed-text';

// A small renderer for the subset of markdown the guides use:
// ## and ### headings, paragraphs, - and 1. lists, **bold** and [links](https://...).
type Block =
  | { kind: 'h2'; text: string }
  | { kind: 'h3'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] };

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of md.split(/\n{2,}/)) {
    const lines = chunk.split('\n').filter((l) => l.trim());
    if (!lines.length) continue;
    if (lines[0].startsWith('### ')) blocks.push({ kind: 'h3', text: lines[0].slice(4) });
    else if (lines[0].startsWith('## ')) blocks.push({ kind: 'h2', text: lines[0].slice(3) });
    else if (lines.every((l) => /^- /.test(l))) blocks.push({ kind: 'list', ordered: false, items: lines.map((l) => l.slice(2)) });
    else if (lines.every((l) => /^\d+\. /.test(l)))
      blocks.push({ kind: 'list', ordered: true, items: lines.map((l) => l.replace(/^\d+\. /, '')) });
    else blocks.push({ kind: 'p', text: lines.join(' ') });
    if (/^#{2,3} /.test(lines[0]) && lines.length > 1) blocks.push({ kind: 'p', text: lines.slice(1).join(' ') });
  }
  return blocks;
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) return <ThemedText key={i} type="bold">{bold[1]}</ThemedText>;
        const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)$/);
        if (link)
          return (
            <ThemedText
              key={i}
              themeColor="signal"
              accessibilityRole="link"
              style={{ textDecorationLine: 'underline' }}
              onPress={() => void Linking.openURL(link[2])}>
              {link[1]}
            </ThemedText>
          );
        return part;
      })}
    </>
  );
}

const READ = { fontSize: 17, lineHeight: 28 };

export function Markdown({ source }: { source: string }) {
  return (
    <View style={{ gap: Spacing.three }}>
      {parse(source).map((b, i) => {
        if (b.kind === 'h2') return <ThemedText key={i} type="heading" accessibilityRole="header" style={{ marginTop: Spacing.two }}>{b.text}</ThemedText>;
        if (b.kind === 'h3') return <ThemedText key={i} type="subheading" accessibilityRole="header">{b.text}</ThemedText>;
        if (b.kind === 'p') return <ThemedText key={i} style={READ}><Inline text={b.text} /></ThemedText>;
        return (
          <View key={i} style={{ gap: Spacing.two }}>
            {b.items.map((item, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: Spacing.two }}>
                <ThemedText themeColor="signal" type="bold" style={[READ, { minWidth: 18 }]}>{b.ordered ? `${j + 1}.` : '•'}</ThemedText>
                <ThemedText style={[READ, { flex: 1 }]}><Inline text={item} /></ThemedText>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
