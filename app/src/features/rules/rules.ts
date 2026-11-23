/**
 * Storage, transport and display checker. Every answer is an approved question's explanation and handbook citation,
 * so the checker adds no new rule wording of its own.
 */
export type FirearmClass = 'non-restricted' | 'restricted';
export type Situation = 'store' | 'display-home' | 'display-away' | 'vehicle-attended' | 'vehicle-unattended';

export const CLASSES: { id: FirearmClass; label: string; sub: string }[] = [
  { id: 'non-restricted', label: 'Non-restricted', sub: 'Most rifles and shotguns' },
  { id: 'restricted', label: 'Restricted', sub: 'Most handguns, some rifles' },
];

export const SITUATIONS: { id: Situation; label: string; only?: FirearmClass }[] = [
  { id: 'store', label: 'Storing it at home' },
  { id: 'display-home', label: 'Displaying it at home' },
  { id: 'display-away', label: 'Displaying it away from home (e.g. a gun show)', only: 'restricted' },
  { id: 'vehicle-attended', label: 'Driving with it' },
  { id: 'vehicle-unattended', label: 'Leaving it in a parked vehicle' },
];

/** Question ids whose explanations answer each case, most important first. */
export const RULES: Record<FirearmClass, Partial<Record<Situation, string[]>>> = {
  'non-restricted': {
    store: ['cfsc-storage-001', 'cfsc-storage-002'],
    'display-home': ['cfsc-display-001'],
    'vehicle-attended': ['cfsc-handling-004', 'cfsc-handling-103'],
    'vehicle-unattended': ['cfsc-transport-001', 'cfsc-handling-004'],
  },
  restricted: {
    store: ['crfsc-storage-001', 'crfsc-storage-002', 'crfsc-storage-004', 'crfsc-storage-003'],
    'display-home': ['crfsc-display-001'],
    'display-away': ['crfsc-display-002'],
    'vehicle-attended': ['crfsc-transport-001', 'crfsc-transport-002', 'crfsc-transport-004', 'crfsc-transport-005'],
    'vehicle-unattended': ['crfsc-transport-003', 'crfsc-transport-001'],
  },
};
