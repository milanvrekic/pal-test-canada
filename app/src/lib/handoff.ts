// Cross-promotion to the other 10ten Studio apps, following the Moment Engine's site cross-promotion
// (10ten-command: netlify/lib/promo.mts, public/siblings.js):
//
// - The app reads https://command.10tenstudio.com/xp/paltest.json once per session. It is data only (both stores forbid
//   downloading code). `enabled: false` there hides every card without an app release; its lines and in-season flags win.
// - Every tap goes through /xp/go/paltest/<app>, which counts the click and sends phones to the store with
//   ct=xp-paltest (Apple) or utm_source=10ten-crosspromo (Play), desktops to the website, and pre-launch apps
//   (Shootable) to their waitlist site.
// - Until the Moment Engine knows the paltest site (or when the request fails), the built-in copy below is used and taps
//   go straight to the store with the same campaign tags, so installs are still attributed.
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type AppId = 'huntable' | 'shootable';

export type PromoItem = {
  id: AppId;
  name: string;
  line: string;
  color: string;
  inSeason: boolean;
  soon: boolean;
  href: string;
};

const FEED = 'https://command.10tenstudio.com/xp/paltest.json';
const CAMPAIGN = 'paltest';

type Builtin = { name: string; line: string; color: string; months: number[]; soon: boolean; ios?: string; android?: string; web: string };

// Names, lines, colours, seasons and store links copied from 10ten-command DEFAULT_APPS and DEFAULT_PROMO.
const BUILTIN: Record<AppId, Builtin> = {
  huntable: {
    name: 'Huntable',
    line: 'Can I hunt here today? Seasons by zone for BC and Nova Scotia.',
    color: '#7A4A1C',
    months: [9, 10, 11],
    soon: false,
    ios: 'https://apps.apple.com/app/huntable-can-i-hunt-here/id6827829619',
    android: 'https://play.google.com/store/apps/details?id=app.gethuntable',
    web: 'https://gethuntable.app',
  },
  shootable: {
    name: 'Shootable',
    line: 'Where can I shoot today, with this firearm? For BC and Alberta PAL holders.',
    color: '#8E1B2E',
    months: [],
    soon: true,
    web: 'https://getshootable.app',
  },
};

export const APP_ICONS: Record<AppId, number> = {
  huntable: require('../../assets/images/apps/huntable.png'),
  shootable: require('../../assets/images/apps/shootable.png'),
};

/** The same campaign tags the Moment Engine's /xp/go redirect adds (storeUrlFor in netlify/lib/apps.mts). */
export function directLink(id: AppId, os: string = Platform.OS): string {
  const a = BUILTIN[id];
  if (!a.soon && os === 'ios' && a.ios) return `${a.ios}?ct=xp-${CAMPAIGN}&mt=8`;
  if (!a.soon && os === 'android' && a.android)
    return `${a.android}&referrer=${encodeURIComponent(`utm_source=10ten-crosspromo&utm_medium=app&utm_campaign=${CAMPAIGN}`)}`;
  return `${a.web}/?utm_source=10ten-crosspromo&utm_medium=app&utm_campaign=${CAMPAIGN}`;
}

function builtinItems(month: number): PromoItem[] {
  return (Object.keys(BUILTIN) as AppId[]).map((id) => {
    const a = BUILTIN[id];
    return { id, name: a.name, line: a.line, color: a.color, inSeason: a.months.includes(month), soon: a.soon, href: directLink(id) };
  });
}

type Feed = { enabled: boolean; items: { id: string; name: string; line: string; color: string; inSeason: boolean; soon: boolean; href: string }[] };

let cache: Promise<PromoItem[] | null> | null = null;

/** Remote feed when the Moment Engine serves one; built-in copy otherwise. Resolves to null when switched off remotely. */
function load(): Promise<PromoItem[] | null> {
  cache ??= fetch(FEED)
    .then((r) => (r.ok ? (r.json() as Promise<Feed>) : null))
    .then((feed) => {
      const fallback = builtinItems(new Date().getMonth() + 1);
      if (!feed) return fallback;
      if (!feed.enabled) return null;
      const remote = new Map(feed.items.map((i) => [i.id, i]));
      // Only Huntable and Shootable belong in this app; anything the feed doesn't list keeps the built-in copy.
      return fallback.map((b) => {
        const r = remote.get(b.id);
        return r && /^https:\/\//.test(r.href) ? { ...b, name: r.name, line: r.line, inSeason: r.inSeason, soon: r.soon, href: r.href } : b;
      });
    })
    .catch(() => builtinItems(new Date().getMonth() + 1));
  return cache;
}

/** Items to show, in the order given. Starts with the built-in copy so cards never pop in late on a slow network. */
export function usePromo(order: AppId[]): PromoItem[] {
  const [items, setItems] = useState<PromoItem[] | null>(() => builtinItems(new Date().getMonth() + 1));
  useEffect(() => {
    let live = true;
    void load().then((v) => live && setItems(v));
    return () => {
      live = false;
    };
  }, []);
  if (!items) return [];
  return order.map((id) => items.find((i) => i.id === id)).filter((i): i is PromoItem => !!i);
}
