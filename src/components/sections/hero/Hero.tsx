'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { animateHeroSection } from '@/components/animations/gsap'
import { scrollSection } from '@/utils'
import './_hero.scss'

export const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      animateHeroSection(heroRef.current!)
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className='hero' ref={heroRef}>
      <div className='overlay' />
      <div className='heroContent'>
        <span className='heroSpan'>Hecho a mano · Con intención</span>
        <h1 className='heroTitle'>So Ham Design</h1>
        <h2 className='heroSubtitle'>Lo que llega a vos no es casualidad.</h2>
        <p className='heroDescription'>Pulseras y collares creados uno a uno con piedras y cristales naturales.</p>
        <div className='buttonsContainer'>
          <button className='primaryButton' onClick={() => scrollSection('viewPieces')}>Ver piezas</button>
          <button className='secondaryButton' onClick={() => scrollSection('createPiece')}>Crear tu pieza</button>
        </div>
      </div>
    </div>
  )
}
