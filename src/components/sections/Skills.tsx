import { motion } from 'framer-motion';
import { resumeData } from '../../data/resumeData';
import { FaCode, FaServer, FaDatabase, FaDesktop, FaToolbox, FaCheckCircle } from 'react-icons/fa';

export const Skills = () => {
    const categories = [
        { key: 'frontend', label: 'Front-end Development', icon: <FaCode /> },
        { key: 'backend', label: 'Back-end Development', icon: <FaServer /> },
        { key: 'database', label: 'Database', icon: <FaDatabase /> },
        { key: 'desktopRealtime', label: 'Desktop & Real-Time', icon: <FaDesktop /> },
        { key: 'tools', label: 'Version Control & Tools', icon: <FaToolbox /> },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Technical Skills</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    A comprehensive overview of my technical expertise and tools I use.
                </p>
            </div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {categories.map((cat) => {
                    const skills = resumeData.skills[cat.key as keyof typeof resumeData.skills];
                    return (
                        <motion.div
                            key={cat.key}
                            variants={itemVariants}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:border-blue-500/30 transition-colors shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 text-xl">
                                    {cat.icon}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{cat.label}</h2>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Certifications and Soft Skills */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Certifications</h2>
                    <div className="space-y-4">
                        {resumeData.certifications.map((cert, index) => (
                            <div key={index} className="flex gap-3 items-start p-4 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                                <FaCheckCircle className="mt-1 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300 text-sm">{cert}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Soft Skills</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {resumeData.softSkills.map((skill, index) => (
                            <div key={index} className="flex items-center justify-center p-4 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-800 border border-blue-100 dark:border-gray-700 text-center font-medium text-gray-800 dark:text-gray-200">
                                {skill}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
