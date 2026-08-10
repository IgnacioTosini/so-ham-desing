import { buildSectionTimeline, prefersReducedMotion, revealElements } from './shared';

export const animateSimulatorSection = (section: HTMLElement) => {
  const title = section.querySelector('.titleContainer');
  const selectorRow = section.querySelector('.simulatorPieceSelector');
  const circle = section.querySelector('svg');
  const panel = section.querySelector('.stonePanel');
  const button = section.querySelector('.simulatorWhatsappButton');
  const isMobile = window.innerWidth <= 768;

  if (prefersReducedMotion()) {
    return revealElements(title, selectorRow, circle, panel, button);
  }

  return buildSectionTimeline(section, 'top 72%', 'top 48%')
    .fromTo(title, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.74, ease: 'power3.out' })
    .fromTo(selectorRow, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.42')
    .fromTo(circle, { autoAlpha: 0, scale: 0.92, transformOrigin: 'center center' }, { autoAlpha: 1, scale: 1, duration: isMobile ? 0.72 : 1, ease: 'power3.out' }, '-=0.18')
    .fromTo(
      panel,
      { autoAlpha: 0, x: isMobile ? 0 : 34, y: isMobile ? 24 : 0 },
      { autoAlpha: 1, x: 0, y: 0, duration: isMobile ? 0.62 : 0.84, ease: 'power3.out' },
      '-=0.66',
    )
    .fromTo(button, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.68, ease: 'power2.out' }, '-=0.34');
};
