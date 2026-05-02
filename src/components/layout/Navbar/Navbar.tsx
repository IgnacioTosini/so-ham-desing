'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MouseEvent, useEffect, useRef, useState } from "react";
import gsap from 'gsap';
/* import { animateNavbarEntrance } from '@/components/animations/gsap/navbarAnimations'; */
import { navigationItems, scrollSection } from "@/utils";
import "./_navbar.scss";

export default function Navbar() {
    const pathname = usePathname()
    const navbarRef = useRef<HTMLElement>(null)
    const [activeSection, setActiveSection] = useState<string>('')
    const currentSection = pathname === '/' ? activeSection : ''

    const getSectionHref = (sectionId: string) => {
        if (pathname === '/') return `#${sectionId}`
        if (sectionId === 'top') return '/'
        return `/#${sectionId}`
    }

    useEffect(() => {
        if (!navbarRef.current) return;
        const ctx = gsap.context(() => {
            /* animateNavbarEntrance(navbarRef.current!); */
        }, navbarRef.current);
        return () => ctx.revert();
    }, []);

    const handleSectionNavigation = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
        if (pathname === '/') {
            event.preventDefault()

            if (sectionId === 'top') {
                scrollSection(sectionId, { updateUrl: false })
                window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
                return
            }

            scrollSection(sectionId, { updateUrl: true })
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

    return (
        <nav ref={navbarRef} className="navbar">
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
            <h1 className="navbarTitle">So Ham Design</h1>
        </nav>
    )
}
