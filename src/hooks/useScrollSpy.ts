import { useState, useEffect } from 'react';

export const useScrollSpy = (sectionIds: string[], isEnabled: boolean = true) => {
    const [activeSection, setActiveSection] = useState<string>('hero');

    useEffect(() => {
        if (!isEnabled) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '-80px 0px -20% 0px'
            }
        );

        sectionIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [isEnabled, sectionIds]);

    return activeSection;
};
