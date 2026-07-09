import { buildSectionTimeline, prefersReducedMotion, revealElements } from './shared';

export const animateCreateYourPieceSection = (section: HTMLElement) => {
  const title = section.querySelector('.titleContainer');
  const description = section.querySelector('.description');
  const selector = section.querySelector('.pieceSelector');
  const stoneList = section.querySelector('.stoneList');
  const stones = section.querySelectorAll('.stoneItem');
  const order = section.querySelector('.yourOrder');

  if (prefersReducedMotion()) {
    return revealElements(title, description, selector, stoneList, stones, order);
  }

  return buildSectionTimeline(section, 'top 74%', 'top 50%')
    .fromTo(title, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.74, ease: 'power3.out' })
    .fromTo(description, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.44')
    .fromTo(selector, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.68, ease: 'power2.out' }, '-=0.4')
    .fromTo(stoneList, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' }, '-=0.08')
    .fromTo(
      stones,
      { autoAlpha: 0, y: 28, scale: 0.9, rotateX: 12, transformOrigin: 'center top' },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.52 : 0.74,
        stagger: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.045 : 0.07,
        ease: 'back.out(1.6)'
      },
      '-=0.16'
    )
    .fromTo(order, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: 0.78, ease: 'power3.out' }, '-=0.08');
};
