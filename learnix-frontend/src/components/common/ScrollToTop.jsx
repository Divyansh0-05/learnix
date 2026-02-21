import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        try {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        } catch (e) {
            window.scrollTo(0, 0);
        }
    }, [pathname]);

    return null;
}
