import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useScrollSpy } from '../../hooks/useScrollSpy';

export const Layout = () => {
    const location = useLocation();
    const [isManualScrolling, setIsManualScrolling] = useState(false);
    const sections = ['hero', 'experience', 'skills', 'projects', 'demos'];

    // Use custom hook, disabled during manual scrolling
    // We pass !isManualScrolling as isEnabled
    const spyActiveSection = useScrollSpy(sections, !isManualScrolling);

    // effectiveActiveSection is stateful to allow immediate override during click
    const [activeSection, setActiveSection] = useState('hero');

    // Sync spy result to activeSection when enabled
    useEffect(() => {
        if (!isManualScrolling) {
            setActiveSection(spyActiveSection);
        }
    }, [spyActiveSection, isManualScrolling]);

    // Update URL when activeSection changes (only if observing)
    useEffect(() => {
        if (!isManualScrolling) {
            const newPath = activeSection === 'hero' ? '/' : `/${activeSection}`;
            if (window.location.pathname !== newPath) {
                window.history.replaceState(null, '', newPath);
            }
        }
    }, [activeSection, isManualScrolling]);

    // Handle initial load or external navigation (e.g. back button)
    // This is separate from the "click" handler which is internal
    useEffect(() => {
        if (isManualScrolling) return;

        // Initial load or popstate
        const path = location.pathname.substring(1);
        const elementId = path || 'hero';

        // Only scroll if we are mostly sure this isn't a spy update
        // (The spy update sets replaceState, which doesn't trigger this usually, but just in case)
        if (elementId !== activeSection) {
            const element = document.getElementById(elementId);
            if (element) {
                // Determine if we need to scroll. 
                // For simplified logic: just let CSS handle smooth scroll if needed.
                // We trust the browser to restore scroll on back/forward usually? 
                // Using 'auto' behavior here to snap or 'smooth' if desired.
                // But for initial load, snap is better.
                // element.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        }
    }, [location.pathname]);


    const handleNavigate = (id: string) => {
        setIsManualScrolling(true);
        setActiveSection(id); // Immediate UI feedback

        const newPath = id === 'hero' ? '/' : `/${id}`;
        window.history.pushState(null, '', newPath);

        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' }); // CSS smooth might double up, check behavior
            // Since we have CSS scroll-behavior: smooth, JS 'smooth' might not be needed OR 'auto' might key off CSS. 
            // 'auto' uses CSS scroll-behavior.
            // element.scrollIntoView({ behavior: 'auto', block: 'start' });
        }

        // Re-enable spy after animation
        setTimeout(() => {
            setIsManualScrolling(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors duration-300 font-sans">
            <Header activeSection={activeSection} onNavigate={handleNavigate} />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};
