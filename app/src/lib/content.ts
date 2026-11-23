import type { WaitRow } from '@/features/wait/stats';
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
  /** Standalone SVG markup for the scene; empty when the scene is a photo. */
  scene: string;
  /** Key into drillPhotos when the scene is a photo. */
  photo: string | null;
  alt: string | null;
  draft: boolean;
};

export const contentVersion: string = bundle.version;
export const contentBuiltAt: string = bundle.builtAt;
export const containsDrafts: boolean = bundle.containsDrafts;
export const questions = bundle.questions as Question[];
export const guides = bundle.guides as Guide[];
export const drills = bundle.drills as Drill[];
export type CourseProvider = {
  id: string;
  name: string;
  regions: string[];
  venues: { city: string; place: string }[];
  courses: ('cfsc' | 'crfsc')[];
  website: string;
  phone: string | null;
  email: string | null;
  source: string;
  checked: string;
  draft: boolean;
};
export type ProvinceCourses = { province: string; regions: { id: string; name: string }[]; providers: CourseProvider[] };
export const courseDirectory = ((bundle as { courses?: ProvinceCourses[] }).courses ?? []) as ProvinceCourses[];
/** Where instructors ask to be listed or corrected. */
export const LISTINGS_EMAIL = 'milan@10tenStudio.com';
export type PracticalDrill = {
  id: string;
  course: 'cfsc' | 'crfsc';
  title: string;
  /** Flashcard front, phrased as a question. */
  prompt: string;
  situation: string;
  steps: string[];
  why: string;
  source: { edition: string | null; section: string | null; page: string | null };
  draft: boolean;
};
export const practicalDrills = ((bundle as { practical?: PracticalDrill[] }).practical ?? []) as PracticalDrill[];
export const waitRows = (bundle.waitTimes?.rows ?? []) as WaitRow[];

export const SITE_NAME = 'PAL Test Canada';
export const DISCLAIMER =
  'PAL Test Canada is not affiliated with the RCMP or the Canadian Firearms Program. It is a study aid and does not replace the mandatory instructor-led course.';

/** Production web address. Not registered yet (README: paltest.ca, availability not checked). */
export const SITE_URL = 'https://paltest.ca';
