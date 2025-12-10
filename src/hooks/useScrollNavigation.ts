import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ROUTES = ['/', '/experience', '/skills', '/projects', '/demos'];

// Throttle helper
const throttle = (func: (...args: any[]) => void, limit: number) => {
    let inThrottle: boolean;
    return function (this: any, ...args: any[]) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};

export const useScrollNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const lastScrollTime = useRef(0);
    const THROTTLE_MS = 1000;

    useEffect(() => {
        const handleWheel = throttle((e: WheelEvent) => {
            const now = Date.now();
            if (now - lastScrollTime.current < THROTTLE_MS) return;

            const currentPath = location.pathname;
            const currentIndex = ROUTES.indexOf(currentPath);

            if (currentIndex === -1) return;

            // Check if scrolling down at the bottom of the page
            if (e.deltaY > 0) {
                const scrolledToBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2; // -2 for rounding tolerance
                if (scrolledToBottom) {
                    if (currentIndex < ROUTES.length - 1) {
                        lastScrollTime.current = now;
                        navigate(ROUTES[currentIndex + 1]);
                    }
                }
            }

            // Check if scrolling up at the top of the page
            else if (e.deltaY < 0) {
                const scrolledToTop = window.scrollY <= 0;
                if (scrolledToTop) {
                    if (currentIndex > 0) {
                        lastScrollTime.current = now;
                        navigate(ROUTES[currentIndex - 1]);
                    }
                }
            }
        }, 100);

        window.addEventListener('wheel', handleWheel);

        return () => {
            window.removeEventListener('wheel', handleWheel);
        };
    }, [location.pathname, navigate]);
};
