import gsap from 'gsap';

export const animateNavbarEntrance = (navbar: HTMLElement) => {
  const links = navbar.querySelectorAll('.navbarLink');
  const title = navbar.querySelector('.navbarTitle');

  return gsap.timeline()
    .fromTo(
      navbar,
      { autoAlpha: 0, y: -24 },
      { autoAlpha: 0.95, y: 0, duration: 0.7, ease: 'power3.out' }
    )
    .fromTo(
      links,
      { autoAlpha: 0, y: -12 },
      { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.08, ease: 'power2.out' },
      '-=0.38'
    )
    .fromTo(
      title,
      { autoAlpha: 0, letterSpacing: '0.3em' },
      { autoAlpha: 1, letterSpacing: '0.1em', duration: 0.55, ease: 'power2.out' },
      '-=0.28'
    );
};