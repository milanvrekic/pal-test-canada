// Cross-app hand-off destinations. One file so status and links change in one place.
// TODO: align with the 10ten "Also here" card rules once that doc is in the project.
export type Handoff = {
  id: 'huntable' | 'shootable';
  question: string;
  name: string;
  blurb: string;
  status: 'live' | 'coming-soon';
  /** Store or web link. Null until confirmed: the card then shows no button. */
  url: string | null;
};

export const HANDOFFS: Handoff[] = [
  {
    id: 'huntable',
    question: 'Where can I hunt?',
    name: 'Huntable',
    blurb: 'Find where you can legally hunt.',
    status: 'live',
    url: null, // TODO: Huntable store and web links with campaign tags
  },
  {
    id: 'shootable',
    question: 'Where can I legally shoot?',
    name: 'Shootable',
    blurb: 'Find places to shoot. Launching in BC and Alberta first.',
    status: 'coming-soon',
    url: null,
  },
];
