import { feedBatches } from './sources/rss';
import type { Job } from './types';

export const CRON_FREQUENT = '*/30 * * * *';
export const CRON_DAILY = '20 5 * * *';

/** Svetové kanály World Monitor sa zbierajú každé 2 hodiny (v párnu hodinu, minúta 0). */
export function worldFeedsDue(at: Date): boolean {
  return at.getUTCMinutes() < 30 && at.getUTCHours() % 2 === 0;
}

function rssJobs(set: string): Job[] {
  return feedBatches(set).map((_, batch) => ({ source: 'rss', channel: set, batch }));
}

/** Ktoré úlohy zaradiť do fronty pre daný cron a čas. */
export function plan(cron: string, at: Date): Job[] {
  if (cron === CRON_DAILY) {
    return [{ source: 'crz' }, { source: 'ted' }, { source: 'statistika' }, { source: 'kataster' }, { source: 'worldmonitor' }];
  }
  if (cron === CRON_FREQUENT) {
    return [...rssJobs('media'), ...(worldFeedsDue(at) ? rssJobs('worldmonitor') : [])];
  }
  return [];
}

/** Všetky úlohy naraz — na ručný prvý zber po nasadení. */
export function planAll(): Job[] {
  return [...plan(CRON_DAILY, new Date(0)), ...rssJobs('media'), ...rssJobs('worldmonitor')];
}
