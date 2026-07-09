import { buildSectionTimeline, prefersReducedMotion, revealElements } from './shared';

export const animateViewPiecesSection = (section: HTMLElement) => {
  const title = section.querySelector('.titleContainer');
  const cards = section.querySelectorAll('.viewPiecesItem');

  if (prefersReducedMotion()) {
    return revealElements(title, cards);
  }

  return buildSectionTimeline(section, 'top 72%', 'top 50%')
    .fromTo(title, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.74, ease: 'power3.out' })
    .fromTo(
      cards,
      { autoAlpha: 0, y: 52 },
      {
        autoAlpha: 1,
        y: 0,
        duration: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.58 : 0.82,
        stagger: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.08 : 0.14,
        ease: 'power3.out'
      },
      '-=0.22'
    );
};
