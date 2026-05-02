"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { IoLogoInstagram, IoLogoWhatsapp } from 'react-icons/io';
/* import { animateFooter } from '@/components/animations/gsap/footerAnimations';*/
import { IoLogoTiktok } from 'react-icons/io5';
import Image from 'next/image';
import './_footer.scss';

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // animateFooter(footerRef.current!);
    }, footerRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="footer">
      <div className='footerContent'>
        <div className='footerContentInfoBrand'>
          <Image src="/soHamDesign.png" alt="Crear Pieza" width={50} height={50} />
          <h1 className="footerTitle">So Ham Design</h1>
        </div>
        <div className='footerContentInfo'>
          <p>Lo que llega a vos no es casualidad. Escribinos y creemos juntas tu pieza.</p>

          <div className='footerContentInfoLinks'>
            <a href="https://www.instagram.com/soham_desing/" target="_blank" rel="noopener noreferrer" className='instagramLink instagram'>
              <IoLogoInstagram />
            </a>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className='whatsappLink whatsapp'>
              <IoLogoWhatsapp />
            </a>
            <a href="https://www.tiktok.com/@soham_desingbypato?lang=es-419" target="_blank" rel="noopener noreferrer" className='tiktokLink tiktok'>
              <IoLogoTiktok />
            </a>
          </div>
        </div>
      </div>
      <div className='footerContentFooter'>
        <p className='city'>Mar del Plata, Argentina</p>
        <h1>© {new Date().getFullYear()} So Ham Design — Hecho con intención.</h1>
        <p className='creator'>Diseñado por Ignacio Tosini</p>
      </div>
    </footer>
  )
}
