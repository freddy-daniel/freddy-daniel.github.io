
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

export const Charts = () => {
    const barData = {
        labels: ['Vue.js', 'React', 'Node.js', 'WebRTC', 'Electron', 'Spring Boot'],
        datasets: [
            {
                label: 'Proficiency Level (%)',
                data: [95, 85, 90, 88, 85, 80],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(16, 185, 129, 0.7)',
                    'rgba(245, 158, 11, 0.7)',
                    'rgba(236, 72, 153, 0.7)',
                    'rgba(139, 92, 246, 0.7)',
                    'rgba(99, 102, 241, 0.7)',
                ],
                borderRadius: 8,
            },
        ],
    };

    const lineData = {
        labels: ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
        datasets: [
            {
                label: 'Projects Delivered',
                data: [2, 4, 3, 5, 4, 6, 5, 7, 8],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#6b7280'
                }
            },
        },
        scales: {
            y: {
                ticks: { color: '#6b7280' },
                grid: { color: 'rgba(107, 114, 128, 0.1)' }
            },
            x: {
                ticks: { color: '#6b7280' },
                grid: { color: 'rgba(107, 114, 128, 0.1)' }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 h-[400px]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Skill Proficiency</h3>
                <div className="h-[300px]">
                    <Bar options={options} data={barData} />
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 h-[400px]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Project Delivery Timeline</h3>
                <div className="h-[300px]">
                    <Line options={options} data={lineData} />
                </div>
            </div>
        </div>
    );
};
