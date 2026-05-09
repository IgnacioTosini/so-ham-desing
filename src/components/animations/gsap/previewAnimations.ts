import gsap from 'gsap';

export const animatePreviewListPage = (container: HTMLElement) => {
  const title = container.querySelector('.titleContainer');
  const items = container.querySelectorAll('.previewListItem');

  return gsap.timeline()
    .fromTo(title, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power3.out' })
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
  const backLink = container.querySelector('.backLink');
  const canvas = container.querySelector('svg');

  return gsap.timeline()
    .fromTo(backLink, { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power2.out' })
    .fromTo(
      canvas,
      { autoAlpha: 0, scale: 0.94, transformOrigin: 'center center' },
      { autoAlpha: 1, scale: 1, duration: 0.95, ease: 'power3.out' },
      '-=0.08'
    );
};