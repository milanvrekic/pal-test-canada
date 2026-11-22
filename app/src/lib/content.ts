import bundle from '@/content/bundle.json';
import type { Question } from '@/features/quiz/engine';

export type Guide = {
  slug: string;
  title: string;
  description: string;
  order: number;
  lastReviewed: string | null;
  draft: boolean;
  body: string;
};

export type Drill = {
  id: string;
  course: 'cfsc' | 'crfsc';
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  source: { edition: string | null; section: string | null; page: string | null };
  /** Standalone SVG markup for the scene. */
  scene: string;
  draft: boolean;
};

export const contentVersion: string = bundle.version;
export const contentBuiltAt: string = bundle.builtAt;
export const containsDrafts: boolean = bundle.containsDrafts;
export const questions = bundle.questions as Question[];
export const guides = bundle.guides as Guide[];
export const drills = bundle.drills as Drill[];

export const SITE_NAME = 'PAL Test Canada';
export const DISCLAIMER =
  'PAL Test Canada is not affiliated with the RCMP or the Canadian Firearms Program. It is a study aid and does not replace the mandatory instructor-led course.';
