import gsap from 'gsap';

export const animateHeroSection = (section: HTMLElement) => {
  const overlay = section.querySelector('.overlay');
  const eyebrow = section.querySelector('.heroSpan');
  const title = section.querySelector('.heroTitle');
  const subtitle = section.querySelector('.heroSubtitle');
  const description = section.querySelector('.heroDescription');
  const actions = section.querySelector('.buttonsContainer');

  return gsap.timeline()
    .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, ease: 'power2.out' })
    .fromTo(eyebrow, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.72')
    .fromTo(title, { autoAlpha: 0, y: 64, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'power4.out' }, '-=0.4')
    .fromTo(subtitle, { autoAlpha: 0, y: 34 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.58')
    .fromTo(description, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.78, ease: 'power2.out' }, '-=0.45')
    .fromTo(actions, { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.72, ease: 'power2.out' }, '-=0.42');
};