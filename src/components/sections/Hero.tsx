import { motion } from 'framer-motion';
import { resumeData } from '../../data/resumeData';
import { FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export const Hero = () => {
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
    <div className="flex flex-col gap-12">
      {/* Hero Banner */}
      <motion.section
        className="flex flex-col md:flex-row items-center justify-between gap-8 py-12 md:py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex-1 space-y-6 text-center md:text-left">
          <motion.div variants={itemVariants}>
            <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
              Available for new opportunities
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {resumeData.personalInfo.name}
              </span>
            </h1>
          </motion.div>

          <motion.h2
            className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 font-medium"
            variants={itemVariants}
          >
            {resumeData.personalInfo.title}
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0 leading-relaxed"
            variants={itemVariants}
          >
            {resumeData.summary[0]}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 justify-center md:justify-start pt-4"
            variants={itemVariants}
          >
            <Link
              to="/demos"
              className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors shadow-lg shadow-blue-500/30"
            >
              View Interactive Demos
            </Link>
            <a
              href={`mailto:${resumeData.personalInfo.email} `}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition-colors flex items-center gap-2"
            >
              <FaEnvelope /> Contact Me
            </a>
          </motion.div>
        </div>

        {/* Profile Image / Abstract Shape */}
        <motion.div
          className="flex-1 flex justify-center md:justify-end"
          variants={itemVariants}
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full rounded-full border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {/* Placeholder for profile image, using initials for now */}
              <span className="text-6xl font-bold text-gray-400 dark:text-gray-600">
                {resumeData.personalInfo.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            {/* Float cards */}
            <motion.div
              className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 hidden md:block"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <span className="font-bold">9+</span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Years Experience</p>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">Tech Lead</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Profile Summary Detail */}
      <motion.section
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4">
          Profile Summary
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {resumeData.summary.slice(1).map((point, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-500/30 transition-colors"
            >
              <div className="flex gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {point}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Education */}
      <motion.section
        className="py-8"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-l-4 border-cyan-500 pl-4">
          Education
        </h3>
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800">
          {resumeData.education.map((edu, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">{edu.degree}</h4>
                <p className="text-gray-600 dark:text-gray-400">{edu.institution}</p>
              </div>
              <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {edu.year}
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
