import type { Metadata } from 'expo-router/server';

import { PracticeLanding, bankSize } from '@/components/practice-landing';
import { page } from '@/lib/seo';

export function generateMetadata(): Metadata {
  return page('/pal-test-questions', {
    title: 'PAL test questions and answers (CFSC and RPAL) | PAL Test Canada',
    description: `Real-format PAL test questions with answers for the CFSC and CRFSC. ${bankSize('cfsc') + bankSize('crfsc')} questions, each cited to the student handbook and checked by a certified instructor.`,
  });
}

export default function PalTestQuestions() {
  return (
    <PracticeLanding
      title="PAL test questions and answers"
      intro="The PAL written tests are multiple choice and need 80% to pass. These sample questions come from both courses: the CFSC for a non-restricted licence, and the CRFSC for a restricted one (RPAL). Each shows the correct answer, why it's right, and the handbook page."
      sections={[
        { course: 'cfsc', heading: 'CFSC (non-restricted) questions', count: 10 },
        { course: 'crfsc', heading: 'CRFSC (restricted) questions', count: 8 },
      ]}
    />
  );
}
