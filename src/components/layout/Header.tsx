import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { resumeData } from '../../data/resumeData';

export const Header = ({ activeSection = 'hero', onNavigate }: { activeSection?: string; onNavigate?: (id: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'About', path: '/', id: 'hero' },
        { name: 'Experience', path: '/experience', id: 'experience' },
        { name: 'Skills', path: '/skills', id: 'skills' },
        { name: 'Projects', path: '/projects', id: 'projects' },
        { name: 'Demos', path: '/demos', id: 'demos' },
    ];

    const isLinkActive = (itemPath: string, itemId: string) => {
        if (itemPath === '/' && activeSection === 'hero') return true;
        return activeSection === itemId;
    };

    const handleLinkClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        setIsOpen(false);
        if (onNavigate) {
            onNavigate(id);
        }
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <NavLink to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                            {resumeData.personalInfo.name.split(' ')[0]}
                        </NavLink>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <nav className="flex space-x-6">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.path}
                                    onClick={(e) => handleLinkClick(e, item.id)}
                                    className={`cursor-pointer text-sm font-medium transition-colors duration-200 ${isLinkActive(item.path, item.id)
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`
                                    }
                                >
                                    {item.name}
                                </a>
                            ))}
                        </nav>
                        <div className="flex items-center space-x-4">
                            <a href={resumeData.personalInfo.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                <FaGithub className="w-5 h-5" />
                            </a>
                            <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors">
                                <FaLinkedin className="w-5 h-5" />
                            </a>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 focus:outline-none"
                        >
                            {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.path}
                                onClick={(e) => handleLinkClick(e, item.id)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isLinkActive(item.path, item.id)
                                    ? 'bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`
                                }
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};
