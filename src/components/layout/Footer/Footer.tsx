"use client";

import { MouseEvent, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io';
import { animateFooter } from '@/components/animations/gsap';
import { IoLogoTiktok } from 'react-icons/io5';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { SmoothRouteLink } from '@/components/ui/SmoothRouteLink';
import { scrollSection } from '@/utils';
import './_footer.scss';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const whatsappHref = `https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')}`;

  const handleSectionNavigation = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (pathname !== '/') return;

    event.preventDefault();
    scrollSection(sectionId, { updateUrl: true });
  };

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      animateFooter(footerRef.current!);
    }, footerRef.current);

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    const resizeObserver = new ResizeObserver(() => ScrollTrigger.refresh());
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(refreshFrame);
      resizeObserver.disconnect();
      ctx.revert();
    };
  }, [pathname]);

  return (
    <footer ref={footerRef} className="footer">
      <div className='footerContent'>
        <div className='footerContentInfoBrand'>
          <div className="footerBrandHeader">
            <Image src="/soHamDesignLogo.png" alt="Logo de So Ham Design" width={56} height={56} className="footerLogo" />
            <div>
              <span className="footerEyebrow">Piedras naturales</span>
              <h2 className="footerTitle">So Ham Design by Pato</h2>
            </div>
          </div>
          <p className="footerBrandText">Joyas artesanales creadas con intención, energía y una historia propia.</p>
        </div>

        <div className='footerContentInfo'>
          <p>Lo que llega a vos no es casualidad. Escribinos y creemos juntas tu pieza.</p>

          <nav className="footerNav" aria-label="Navegación del sitio">
            <SmoothRouteLink href="/#viewPieces" onClick={(event) => handleSectionNavigation(event, 'viewPieces')}>Piezas</SmoothRouteLink>
            <SmoothRouteLink href="/#createPiece" onClick={(event) => handleSectionNavigation(event, 'createPiece')}>Crear</SmoothRouteLink>
            <SmoothRouteLink href="/#simulator" onClick={(event) => handleSectionNavigation(event, 'simulator')}>Simulador</SmoothRouteLink>
            <SmoothRouteLink href="/disenos">Compartidos</SmoothRouteLink>
          </nav>

          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="footerWhatsappCta">
            <IoLogoWhatsapp />
            Encargar una pieza
          </a>

          <div className='footerContentInfoLinks'>
            <a href="https://www.instagram.com/soham_design_bypato/" target="_blank" rel="noopener noreferrer" className='instagramLink instagram' aria-label="Instagram de So Ham Design">
              <IoLogoInstagram />
            </a>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className='whatsappLink whatsapp' aria-label="WhatsApp de So Ham Design">
              <IoLogoWhatsapp />
            </a>
            <a href="https://www.tiktok.com/@soham_desingbypato?lang=es-419" target="_blank" rel="noopener noreferrer" className='tiktokLink tiktok' aria-label="TikTok de So Ham Design">
              <IoLogoTiktok />
            </a>
          </div>
        </div>
      </div>
      <div className='footerContentFooter'>
        <p className='city'>Mar del Plata, Argentina</p>
        <p className="copyright">© <span suppressHydrationWarning>{new Date().getFullYear()}</span> So Ham Design by Pato. Hecho con intención.</p>
        <p className='creator'>Diseñado por Ignacio Tosini</p>
      </div>
    </footer>
  )
}
