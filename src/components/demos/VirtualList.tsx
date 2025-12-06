import { useState } from 'react';
import { List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FaUserCircle } from 'react-icons/fa';

export const VirtualList = () => {
    const [itemCount] = useState(10000);

    // Generate fake data
    const items = Array.from({ length: itemCount }, (_, index) => ({
        id: index,
        // ... (this part is same, but I can't leave it out easily in replace_file_content)
        name: `User ${index + 1}`,
        role: index % 3 === 0 ? 'Developer' : index % 3 === 1 ? 'Designer' : 'Manager',
        email: `user${index + 1}@example.com`,
        status: index % 2 === 0 ? 'Active' : 'Offline'
    }));

    const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
        const item = items[index];
        return (
            <div style={style} className="px-4">
                <div className="h-[90%] flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FaUserCircle className="text-2xl" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{item.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.role === 'Developer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            item.role === 'Designer' ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            }`}>
                            {item.role}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${item.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[600px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">High Performance List</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rendering {itemCount.toLocaleString()} items efficiently</p>
                </div>
                <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                    react-window
                </div>
            </div>

            <div className="flex-grow">
                <AutoSizer>
                    {({ height, width }: { height: number; width: number }) => (
                        <List<{}>
                            style={{ height, width }}
                            rowCount={items.length}
                            rowHeight={80}
                            rowComponent={Row}
                            rowProps={{}}
                            className="scrollbar-hide"
                        />
                    )}
                </AutoSizer>
            </div>
        </div>
    );
};
