import type { Metadata } from 'expo-router/server';

import { PracticeLanding, bankSize } from '@/components/practice-landing';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/crfsc-practice-test', {
    title: 'Free CRFSC (RPAL) practice test with answers (2026) | PAL Test Canada',
    description: `Free Canadian Restricted Firearms Safety Course practice test: ${bankSize('crfsc')} questions on handguns, revolvers and restricted firearms, with answers and handbook page references.`,
  });
}

export default function CrfscPracticeTest() {
  return (
    <PracticeLanding
      title="Free CRFSC practice test"
      intro="Practice questions for the Canadian Restricted Firearms Safety Course, the second course you need for a restricted licence (RPAL). It covers revolvers, semi-automatic pistols, handgun shooting and the rules for restricted firearms. Every question has its answer and the handbook page it comes from."
      sections={[{ course: 'crfsc', heading: 'Sample CRFSC questions with answers', count: 15 }]}
    />
  );
}
