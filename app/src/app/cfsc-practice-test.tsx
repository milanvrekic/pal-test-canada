import type { Metadata } from 'expo-router/server';

import { PracticeLanding, bankSize } from '@/components/practice-landing';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/cfsc-practice-test', {
    title: 'Free CFSC practice test with answers (2026) | PAL Test Canada',
    description: `Free Canadian Firearms Safety Course practice test: ${bankSize('cfsc')} questions with answers and handbook page references, checked by a certified instructor. No sign-up.`,
  });
}

export default function CfscPracticeTest() {
  return (
    <PracticeLanding
      title="Free CFSC practice test"
      intro="Practice questions for the Canadian Firearms Safety Course, the course you pass for a non-restricted PAL. Every question has its answer, an explanation and the handbook page it comes from. No sign-up, and your progress stays on your device."
      sections={[{ course: 'cfsc', heading: 'Sample CFSC questions with answers', count: 15 }]}
    />
  );
}
