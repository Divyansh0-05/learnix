import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Forceful scroll-to-top component
 * 
 * Intercepts route changes and resets the scroll position of the window,
 * documentElement, and body to zero immediately.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Disable browser's automatic scroll restoration
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const forceScroll = () => {
            window.scrollTo(0, 0);
            if (document.documentElement) document.documentElement.scrollTop = 0;
            if (document.body) document.body.scrollTop = 0;
        };

        // 1. Immediate scroll
        forceScroll();

        // 2. Scroll in next animation frames to override browser defaults
        const rafId1 = requestAnimationFrame(forceScroll);
        const rafId2 = requestAnimationFrame(() => requestAnimationFrame(forceScroll));

        // 3. Final safety with a small delay
        const timeoutId = setTimeout(forceScroll, 50);

        return () => {
            cancelAnimationFrame(rafId1);
            cancelAnimationFrame(rafId2);
            clearTimeout(timeoutId);
        };
    }, [pathname]);

    return null;
};

export default ScrollToTop;
