import { useEffect, useState } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

export const ThemeToggle = () => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle Dark Mode"
        >
            {theme === 'light' ? (
                <FaMoon className="text-gray-800 text-xl" />
            ) : (
                <FaSun className="text-yellow-400 text-xl" />
            )}
        </button>
    );
};
