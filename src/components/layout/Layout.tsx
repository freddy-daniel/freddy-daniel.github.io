import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-black transition-colors duration-300 font-sans">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    );
};
