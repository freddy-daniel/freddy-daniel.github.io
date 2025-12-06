import { motion } from 'framer-motion';
import { resumeData } from '../../data/resumeData';
import { FaBriefcase, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

export const Experience = () => {
    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                        <FaBriefcase className="text-2xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Work Experience</h1>
                </div>

                <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-4 md:ml-6 space-y-16">
                    {resumeData.experience.map((exp, expIndex) => (
                        <div key={expIndex} className="relative pl-8 md:pl-12">
                            {/* Company Node */}
                            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900" />

                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{exp.company}</h2>
                                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <FaCalendarAlt /> {exp.period}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <FaMapMarkerAlt /> {exp.location}
                                    </span>
                                </div>
                            </div>

                            {/* Roles */}
                            <div className="space-y-12">
                                {exp.roles.map((role, roleIndex) => (
                                    <motion.div
                                        key={roleIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: roleIndex * 0.1 }}
                                        className="relative bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{role.title}</h3>
                                        <ul className="space-y-3">
                                            {role.responsibilities.map((resp, respIndex) => (
                                                <li key={respIndex} className="flex gap-3 text-gray-600 dark:text-gray-300">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                    <span className="leading-relaxed">{resp}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
