import { Linking, Platform } from 'react-native';

import { SUPPORT_EMAIL, contentBuiltAt, contentVersion } from './content';

/**
 * One-tap "report a problem": opens an email to us with the question's id, text and content version already filled
 * in, so a wrong answer can be checked against the handbook without the person retyping anything.
 */
export function reportUrl(kind: 'question' | 'scene' | 'drill', id: string, text: string): string {
  const subject = `Report: ${kind} ${id}`;
  const body = [
    'What looks wrong? (For example: the answer marked correct, the wording, or the handbook page.)',
    '',
    '',
    '---',
    `${kind}: ${id}`,
    text,
    `Content ${contentVersion}, built ${contentBuiltAt}, ${Platform.OS}`,
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export const reportProblem = (kind: 'question' | 'scene' | 'drill', id: string, text: string): void =>
  void Linking.openURL(reportUrl(kind, id, text)).catch(() => {});
