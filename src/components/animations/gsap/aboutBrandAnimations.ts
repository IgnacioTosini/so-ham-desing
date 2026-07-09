import { buildSectionTimeline, prefersReducedMotion, revealElements } from './shared';

export const animateAboutBrandSection = (section: HTMLElement) => {
  const title = section.querySelector('.titleContainer');
  const paragraphs = section.querySelectorAll('.aboutBrandText');

  if (prefersReducedMotion()) {
    return revealElements(title, paragraphs);
  }

  return buildSectionTimeline(section, 'top 70%', 'top 50%')
    .fromTo(title, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power3.out' })
    .fromTo(
      paragraphs,
      { autoAlpha: 0, y: 32 },
      { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.16, ease: 'power2.out' },
      '-=0.18'
    );
};
