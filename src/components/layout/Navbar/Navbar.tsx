'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import gsap from 'gsap';
import { animateNavbarEntrance } from '@/components/animations/gsap';
import { navigationItems, scrollSection } from "@/utils";
import "./_navbar.scss";

export default function Navbar() {
    const pathname = usePathname()
    const navbarRef = useRef<HTMLElement>(null)
    const [activeSection, setActiveSection] = useState<string>('')
    const [isScrolled, setIsScrolled] = useState(false)
    const [menuState, setMenuState] = useState({ isOpen: false, pathname })
    const currentSection = pathname === '/' ? activeSection : ''
    const isMenuOpen = menuState.pathname === pathname && menuState.isOpen

    const getSectionHref = (sectionId: string) => {
        if (pathname === '/') return `#${sectionId}`
        return `/#${sectionId}`
    }

    useEffect(() => {
        if (!navbarRef.current) return;
        const ctx = gsap.context(() => {
            animateNavbarEntrance(navbarRef.current!);
        }, navbarRef.current);
        return () => ctx.revert();
    }, []);

    const handleSectionNavigation = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        setMenuState({ isOpen: false, pathname })

        if (pathname === '/') {
            event.preventDefault()
            scrollSection(sectionId, { updateUrl: true })
        }
    }

    const handleHomeNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
        setMenuState({ isOpen: false, pathname })

        if (pathname === '/') {
            event.preventDefault()
            scrollSection('top', { updateUrl: false })
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
        }
    }

    useEffect(() => {
        const hashSection = window.location.hash.replace('#', '')
        if (!hashSection) return
        requestAnimationFrame(() => scrollSection(hashSection))
    }, [pathname])

    useEffect(() => {
        if (pathname !== '/') return

        const sectionElements = navigationItems
            .map(({ id }) => document.getElementById(id))
            .filter((section): section is HTMLElement => section !== null)

        if (sectionElements.length === 0) return

        const updateActiveSection = () => {
            const markerRatio = window.innerWidth <= 768 ? 0.2 : 0.35
            const markerViewportY = window.innerHeight * markerRatio
            const markerDocumentY = window.scrollY + markerViewportY
            const sectionTops = sectionElements.map((section) => section.getBoundingClientRect().top + window.scrollY)
            const firstSectionTop = sectionTops[0]

            // While hero is the main visible area, keep every nav label inactive.
            if (markerDocumentY < firstSectionTop) {
                setActiveSection('')
                return
            }

            // Pick the last section whose top is above the marker line.
            const currentIndex = sectionTops.reduce((activeIndex, top, index) => {
                if (markerDocumentY >= top) return index
                return activeIndex
            }, 0)

            const current = sectionElements[currentIndex]

            if (current) {
                setActiveSection(current.id)
                return
            }

            // Fallback for edge cases near section boundaries.
            const nearest = [...sectionElements].sort(
                (a, b) => Math.abs(a.getBoundingClientRect().top - markerViewportY) - Math.abs(b.getBoundingClientRect().top - markerViewportY)
            )[0]

            setActiveSection(nearest?.id ?? '')
        }

        updateActiveSection()
        window.addEventListener('scroll', updateActiveSection, { passive: true })
        window.addEventListener('resize', updateActiveSection)

        return () => {
            window.removeEventListener('scroll', updateActiveSection)
            window.removeEventListener('resize', updateActiveSection)
        }
    }, [pathname])

    useEffect(() => {
        const updateScrolled = () => setIsScrolled(window.scrollY > 16)

        updateScrolled()
        window.addEventListener('scroll', updateScrolled, { passive: true })

        return () => window.removeEventListener('scroll', updateScrolled)
    }, [])

    return (
        <nav ref={navbarRef} className={`navbar ${isScrolled ? 'isScrolled' : ''} ${isMenuOpen ? 'isMenuOpen' : ''}`}>
            <div className="navbarInner">
                <Link href="/" className="navbarBrand" onClick={handleHomeNavigation} aria-label="Ir al inicio">
                    <Image src="/soHamDesignLogo.png" alt="" width={38} height={38} className="navbarLogo" priority />
                    <span className="navbarBrandText">
                        <span className="navbarTitle">So Ham Design</span>
                        <span className="navbarSubtitle">Piedras naturales</span>
                    </span>
                </Link>

                <button
                    type="button"
                    className="navbarMenuButton"
                    aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={isMenuOpen}
                    onClick={() => setMenuState((current) => ({
                        isOpen: current.pathname === pathname ? !current.isOpen : true,
                        pathname,
                    }))}
                >
                    <span />
                    <span />
                </button>

                <div className="navbarPanel">
                    <div className="navbarLinks">
                        {navigationItems.map(({ id, label }) => (
                            <Link
                                key={id}
                                href={getSectionHref(id)}
                                className={`navbarLink ${currentSection === id ? 'active' : ''}`}
                                aria-current={currentSection === id ? 'page' : undefined}
                                onClick={(event) => handleSectionNavigation(event, id)}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                    <Link
                        href={getSectionHref('createPiece')}
                        className="navbarCta"
                        onClick={(event) => handleSectionNavigation(event, 'createPiece')}
                    >
                        Diseñar ahora
                    </Link>
                </div>
            </div>
        </nav>
    )
}
