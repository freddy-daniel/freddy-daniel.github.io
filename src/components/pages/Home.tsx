import { Hero } from '../sections/Hero';
import { Experience } from '../sections/Experience';
import { Skills } from '../sections/Skills';
import { Projects } from '../sections/Projects';
import { Demos } from '../demos/Demos';

export const Home = () => {
    return (
        <div className="space-y-0">
            <section id="hero">
                <Hero />
            </section>

            <section id="experience" className="py-20">
                <Experience />
            </section>

            <section id="skills" className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <Skills />
            </section>

            <section id="projects" className="py-20">
                <Projects />
            </section>

            <section id="demos" className="py-20 bg-gray-50 dark:bg-gray-900/50">
                <Demos />
            </section>
        </div>
    );
};
