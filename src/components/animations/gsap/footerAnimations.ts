import { buildSectionTimeline, prefersReducedMotion, revealElements } from './shared';

export const animateFooter = (footer: HTMLElement) => {
  const brand = footer.querySelector('.footerContentInfoBrand');
  const info = footer.querySelector('.footerContentInfo');
  const legal = footer.querySelector('.footerContentFooter');

  if (prefersReducedMotion()) {
    return revealElements(brand, info, legal);
  }

  return buildSectionTimeline(footer, 'top bottom-=96', 'top bottom-=8')
    .fromTo(brand, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.78, ease: 'power3.out' })
    .fromTo(info, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.78, ease: 'power3.out' }, '-=0.46')
    .fromTo(legal, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.68, ease: 'power2.out' }, '-=0.3');
};
