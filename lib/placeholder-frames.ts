import { HERO_CHAPTERS } from '@/lib/config';

export type PlaceholderFrame = {
  url: string;
  w: number;
  h: number;
};

const CAKE_FRAMES = [
  'https://images.pexels.com/photos/2144112/pexels-photo-2144112.jpeg?auto=compress&cs=tinysrgb&w=1280',
  'https://images.pexels.com/photos/18622430/pexels-photo-18622430.jpeg?auto=compress&cs=tinysrgb&w=1280',
  'https://images.pexels.com/photos/8211309/pexels-photo-8211309.jpeg?auto=compress&cs=tinysrgb&w=1280',
  'https://images.pexels.com/photos/6990073/pexels-photo-6990073.jpeg?auto=compress&cs=tinysrgb&w=1280',
  'https://images.pexels.com/photos/31336126/pexels-photo-31336126.jpeg?auto=compress&cs=tinysrgb&w=1280',
];

export function getPlaceholderFrames(isMobile: boolean): PlaceholderFrame[] {
  const w = isMobile ? 720 : 1280;
  const h = isMobile ? 1280 : 720;
  return HERO_CHAPTERS.map((_, i) => ({
    url: CAKE_FRAMES[i % CAKE_FRAMES.length],
    w,
    h,
  }));
}
