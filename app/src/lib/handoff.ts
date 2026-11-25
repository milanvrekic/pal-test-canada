// Cross-promotion to the other 10ten Studio apps, following the Moment Engine's site cross-promotion
// (10ten-command: netlify/lib/promo.mts, public/siblings.js):
//
// - The app reads https://command.10tenstudio.com/xp/paltest.json once per session. It is data only (both stores forbid
//   downloading code). `enabled: false` there hides every card without an app release; its lines and in-season flags win.
// - Every tap goes through /xp/go/paltest/<app>?placement=<spot>, which counts the click and sends phones to the store
//   with ct=pal-test-app (Apple, the campaign set up in App Store Connect; the engine's HOSTS.paltest.appleCampaign) or
//   utm_source=10ten-crosspromo&utm_content=<spot> (Play), desktops to the website, and pre-launch apps (Shootable) to
//   their waitlist site. Taps and iPhone installs then sit on one row under Growth → Installs by campaign.
// - Until the Moment Engine knows the paltest site (or when the request fails), the built-in copy below is used and taps
//   go straight to the store with the same campaign tags, so installs are still attributed.
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type AppId = 'huntable' | 'shootable' | 'fishable' | 'campable';

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
    ios: 'https://apps.apple.com/app/apple-store/id6827829619',
    android: 'https://play.google.com/store/apps/details?id=app.gethuntable',
    web: 'https://gethuntable.app',
  },
  fishable: {
    name: 'Fishable',
    line: 'Can I fish here, right now? BC freshwater rules by lake and river.',
    color: '#1F5F8B',
    months: [4, 5, 6, 7, 8, 9, 10],
    soon: false,
    ios: 'https://apps.apple.com/app/apple-store/id6828685801',
    android: 'https://play.google.com/store/apps/details?id=app.getfishable',
    web: 'https://getfishable.app',
  },
  campable: {
    name: 'Campable',
    line: 'Can I camp here, and can I have a campfire? BC rec sites and fire bans.',
    color: '#2F5D3A',
    months: [5, 6, 7, 8, 9],
    soon: false,
    ios: 'https://apps.apple.com/app/apple-store/id6831671747',
    android: 'https://play.google.com/store/apps/details?id=app.campable',
    web: 'https://getcampable.app',
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
  fishable: require('../../assets/images/apps/fishable.png'),
  campable: require('../../assets/images/apps/campable.png'),
};

/**
 * Apple's provider token (App Store Connect → Analytics → Campaigns). It is public: it appears in every campaign link.
 * Without it Apple still opens the store, but App Analytics can't attribute installs to a campaign. Play needs no token.
 */
export const APPLE_PROVIDER_TOKEN = '129676545';
/** The App Store Connect campaign for every link from this app (set up by Milan). Placement detail is in Play's utm_content and our own handoff_click events. */
export const APPLE_CAMPAIGN = 'pal-test-app';

/** Which store to send this person to. On the website this reads the browser, so phones skip the landing page. */
export function deviceOs(os: string = Platform.OS): 'ios' | 'android' | 'other' {
  if (os === 'ios' || os === 'android') return os;
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent.toLowerCase();
  // iPadOS reports a Mac user agent; touch support tells them apart.
  if (/iphone|ipad|ipod/.test(ua) || (/macintosh/.test(ua) && (navigator as { maxTouchPoints?: number }).maxTouchPoints! > 1)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'other';
}

/**
 * Store link with campaign tags, matching the Moment Engine's /xp/go redirect (storeUrlFor in netlify/lib/apps.mts), plus
 * the placement so each spot can be compared on Play (`utm_content=<placement>`). Apple uses the single pal-test-app campaign.
 */
export function directLink(id: AppId, placement?: string, os: string = Platform.OS): string {
  const a = BUILTIN[id];
  const where = deviceOs(os);
  const spot = placement ? placement.replace(/[^a-z0-9_]/gi, '').slice(0, 28) : '';
  if (!a.soon && where === 'ios' && a.ios) {
    return `${a.ios}?pt=${APPLE_PROVIDER_TOKEN}&ct=${APPLE_CAMPAIGN}&mt=8`;
  }
  const utm = `utm_source=10ten-crosspromo&utm_medium=${Platform.OS === 'web' ? 'web' : 'app'}&utm_campaign=${CAMPAIGN}${spot ? `&utm_content=${spot}` : ''}`;
  if (!a.soon && where === 'android' && a.android) return `${a.android}&referrer=${encodeURIComponent(utm)}`;
  return `${a.web}/?${utm}`;
}

/** The link for one tap: the remote redirect when the feed supplies one (it tags and counts), else a tagged direct link. */
export function hrefFor(item: PromoItem, placement: string): string {
  // Every platform goes through the redirect so the Moment Engine counts the tap; it keeps ct=pal-test-app for iPhones.
  if (item.href.includes('/xp/go/')) return `${item.href}${item.href.includes('?') ? '&' : '?'}placement=${encodeURIComponent(placement)}`;
  return directLink(item.id, placement);
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
      // Only the apps known here are shown; anything the feed doesn't list keeps the built-in copy.
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
