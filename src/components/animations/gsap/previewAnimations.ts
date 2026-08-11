import gsap from 'gsap';
import { prefersReducedMotion, revealElements } from './shared';

export const animatePreviewListPage = (container: HTMLElement) => {
  const headers = container.querySelectorAll('.sharedDesignsIntroContent, .sharedDesignsHeader');
  const items = container.querySelectorAll('.sharedDesignCard');

  if (prefersReducedMotion()) {
    return revealElements(headers, items);
  }

  return gsap.timeline()
    .fromTo(headers, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' })
    .fromTo(
      items,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.46 : 0.58,
        stagger: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.05 : 0.08,
        ease: 'power2.out',
      },
      '-=0.3'
    );
};

export const animatePreviewDetailPage = (container: HTMLElement) => {
  const header = container.querySelector('.previewDetailHeader');
  const canvas = container.querySelector('.previewCanvasFrame');
  const info = container.querySelector('.previewDetailInfo');

  if (prefersReducedMotion()) {
    return revealElements(header, canvas, info);
  }

  return gsap.timeline()
    .fromTo(header, { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power2.out' })
    .fromTo(
      canvas,
      { autoAlpha: 0, y: 24, scale: 0.96, transformOrigin: 'center center' },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' },
      '-=0.2'
    )
    .fromTo(info, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out' }, '-=0.5');
};
