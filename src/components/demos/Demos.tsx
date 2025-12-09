import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Whiteboard } from './Whiteboard';
import { ProductDesigner } from './ProductDesigner';
import { Charts } from './Charts';
import { FaPen, FaTshirt, FaChartBar } from 'react-icons/fa';

export const Demos = () => {
    const [activeTab, setActiveTab] = useState('whiteboard');

    const tabs = [
        { id: 'whiteboard', label: 'Whiteboard', icon: <FaPen />, component: <Whiteboard /> },
        { id: 'product', label: 'Product Designer', icon: <FaTshirt />, component: <ProductDesigner /> },
        { id: 'charts', label: 'Analytics', icon: <FaChartBar />, component: <Charts /> },
    ];

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Interactive Demos</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Explore these interactive components showcasing different technologies and libraries.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {tabs.find(t => t.id === activeTab)?.component}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
