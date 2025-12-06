import { resumeData } from '../../data/resumeData';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

export const Footer = () => {
    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            &copy; {new Date().getFullYear()} {resumeData.personalInfo.name}. All rights reserved.
                        </p>
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span className="sr-only">GitHub</span>
                            <FaGithub className="h-6 w-6" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span className="sr-only">LinkedIn</span>
                            <FaLinkedin className="h-6 w-6" />
                        </a>
                        <a href={`mailto:${resumeData.personalInfo.email}`} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <span className="sr-only">Email</span>
                            <FaEnvelope className="h-6 w-6" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
