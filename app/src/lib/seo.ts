import type { Metadata } from 'expo-router/server';

import { SITE_NAME, SITE_URL } from './content';

/** Page metadata with a canonical URL, Open Graph and a Twitter card, so shared links and search results look right. */
export function page(path: string, m: { title: string; description: string; noindex?: boolean }): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url },
    openGraph: { title: m.title, description: m.description, url, siteName: SITE_NAME, locale: 'en_CA', type: 'website' },
    twitter: { card: 'summary', title: m.title, description: m.description },
    ...(m.noindex ? { robots: 'noindex, follow' } : {}),
  };
}
