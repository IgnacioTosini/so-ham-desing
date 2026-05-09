import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let scrollTriggerRegistered = false;

export const ensureGsapPlugins = () => {
  if (!scrollTriggerRegistered && typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
};

export const getResponsiveStart = (desktop: string, mobile: string) => {
  if (typeof window === 'undefined') {
    return desktop;
  }

  return window.innerWidth <= 768 ? mobile : desktop;
};

export const buildSectionTimeline = (trigger: Element, desktopStart: string, mobileStart: string) => {
  ensureGsapPlugins();

  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start: getResponsiveStart(desktopStart, mobileStart),
      once: true,
      invalidateOnRefresh: true,
    },
  });
};