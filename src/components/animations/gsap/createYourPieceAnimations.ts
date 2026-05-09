import { buildSectionTimeline } from './shared';

export const animateCreateYourPieceSection = (section: HTMLElement) => {
  const title = section.querySelector('.titleContainer');
  const description = section.querySelector('.description');
  const selector = section.querySelector('.pieceSelector');
  const stoneList = section.querySelector('.stoneList');
  const order = section.querySelector('.yourOrder');

  return buildSectionTimeline(section, 'top 74%', 'top 50%')
    .fromTo(title, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.74, ease: 'power3.out' })
    .fromTo(description, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.44')
    .fromTo(selector, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.68, ease: 'power2.out' }, '-=0.4')
    .fromTo(stoneList, { autoAlpha: 0, y: 28 }, {
      autoAlpha: 1,
      y: 0,
      duration: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0.52 : 0.7,
      ease: 'power3.out'
    }, '+=0.18')
    .fromTo(order, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.76, ease: 'power3.out' }, '+=0.1');
};