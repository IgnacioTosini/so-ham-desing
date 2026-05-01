interface ScrollSectionOptions {
    mobileBreakpoint?: number;
    desktopBlock?: ScrollLogicalPosition;
    mobileBlock?: ScrollLogicalPosition;
    blockOverrides?: Partial<Record<string, ScrollLogicalPosition>>;
    urlBasePath?: string;
    updateUrl?: boolean;
}

export const scrollSection = (sectionId: string, options: ScrollSectionOptions = {}) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false;

    const section = document.getElementById(sectionId);
    if (!section) return false;

    const {
        mobileBreakpoint = 768,
        desktopBlock = 'start',
        mobileBlock = 'start',
        blockOverrides = { projects: 'start' },
        urlBasePath = '/',
        updateUrl = true,
    } = options;

    const isMobileViewport = window.innerWidth <= mobileBreakpoint;
    const block = blockOverrides[sectionId] ?? (isMobileViewport ? mobileBlock : desktopBlock);

    section.scrollIntoView({ behavior: 'smooth', block });
    if (updateUrl) {
        window.history.replaceState(null, '', `${urlBasePath}#${sectionId}`);
    }

    return true;
};
