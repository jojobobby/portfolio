import list from './videos.json';

// Every video the site shows, with its YouTube upload date. Oldest first.
export interface Video { id: string; title: string; date: string }
export const videos: Video[] = [...list].sort((a, b) => a.date.localeCompare(b.date));

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2025-06-03" -> "Jun 2025" */
export const stamp = (date: string) => `${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
export const videoDate = (id: string) => {
  const v = videos.find((x) => x.id === id);
  return v ? stamp(v.date) : undefined;
};
