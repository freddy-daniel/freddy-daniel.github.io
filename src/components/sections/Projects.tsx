import { motion } from 'framer-motion';
import { resumeData } from '../../data/resumeData';
import { MdMonitorHeart, MdVideoCameraFront, MdSchool } from 'react-icons/md';

export const Projects = () => {
    const projectIcons = [
        MdMonitorHeart,
        MdVideoCameraFront,
        MdSchool
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Projects</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    A selection of projects demonstrating my experience in large-scale application development, real-time systems, and cross-platform solutions.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {resumeData.projects.map((project, index) => {
                    const Icon = projectIcons[index];
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl hover:border-blue-500/30 transition-all duration-300"
                        >
                            <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-600 p-6 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10 transition-colors duration-300" />
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                    <Icon className="text-6xl text-white drop-shadow-md" />
                                </div>
                            </div>

                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {project.name}
                                </h3>

                                <ul className="space-y-2 mb-6 flex-grow">
                                    {project.details.map((detail, idx) => (
                                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed flex gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                            <span>{detail}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button className="w-full mt-auto py-2.5 px-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    View Details
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
