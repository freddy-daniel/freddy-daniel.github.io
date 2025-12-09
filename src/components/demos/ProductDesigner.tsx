import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric'; // Fabric 6 import
import { FaFont, FaSquare, FaCircle, FaTrash } from 'react-icons/fa';

export const ProductDesigner = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const [selectedColor, setSelectedColor] = useState('#3b82f6');

    useEffect(() => {
        if (canvasRef.current && !canvas) {
            const newCanvas = new fabric.Canvas(canvasRef.current, {
                height: 500,
                width: 800,
                backgroundColor: '#ffffff'
            });
            setCanvas(newCanvas);

            // T-Shirt SVG Path (Simple Manual Construction)
            // M150,50 Q300,120 450,50 (Neck) -> Sleeves -> Body
            const tshirtPathData = 'M150,50 Q300,120 450,50 L550,150 L500,250 L450,200 L450,550 L150,550 L150,200 L100,250 L50,150 Z';

            const shirtGroup = new fabric.Path(tshirtPathData, {
                fill: '#f3f4f6',
                stroke: '#e5e7eb',
                strokeWidth: 5,
                selectable: false,
                evented: false,
                scaleX: 0.7,
                scaleY: 0.7,
                originX: 'center',
                originY: 'center',
            });

            newCanvas.add(shirtGroup);
            newCanvas.renderAll();

            // Handle resizing
            const handleResize = () => {
                const parent = canvasRef.current?.parentElement;
                if (parent && newCanvas) {
                    newCanvas.setDimensions({
                        width: parent.clientWidth,
                        height: 500
                    });

                    // Center the "shirt"
                    shirtGroup.set({
                        left: parent.clientWidth / 2,
                        top: 250 // Center vertically in 500px height
                    });
                    shirtGroup.setCoords();
                    newCanvas.renderAll();
                }
            };

            window.addEventListener('resize', handleResize);
            handleResize(); // Initial size

            return () => {
                newCanvas.dispose();
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Your Text', {
            left: 100,
            top: 100,
            fontFamily: 'Inter',
            fill: selectedColor,
            fontSize: 24
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addRectangle = () => {
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: selectedColor,
            width: 100,
            height: 100
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
    };

    const addCircle = () => {
        if (!canvas) return;
        const circle = new fabric.Circle({
            left: 150,
            top: 150,
            fill: selectedColor,
            radius: 50
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
    };

    const deleteSelected = () => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();
        if (activeObject) {
            canvas.remove(activeObject);
            canvas.discardActiveObject();
            canvas.renderAll();
        }
    };

    // Update color of selected object
    useEffect(() => {
        if (!canvas) return;

        const handleSelection = () => {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                if (activeObject.type === 'i-text' || activeObject.type === 'text') {
                    // For text, fill is color
                    if (activeObject.fill !== selectedColor) {
                        // Optional: update color when selection changes? 
                        // No, usually we want to update object when color picker changes.
                    }
                }
            }
        };

        canvas.on('selection:created', handleSelection);
        canvas.on('selection:updated', handleSelection);

        return () => {
            canvas.off('selection:created', handleSelection);
            canvas.off('selection:updated', handleSelection);
        }
    }, [canvas]);

    // Apply color change to selected object
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setSelectedColor(color);
        if (canvas) {
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', color);
                canvas.renderAll();
            }
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <button
                    onClick={addText}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <FaFont /> Add Text
                </button>
                <button
                    onClick={addRectangle}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <FaSquare /> Add Rect
                </button>
                <button
                    onClick={addCircle}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                    <FaCircle /> Add Circle
                </button>

                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

                <label className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
                    <input
                        type="color"
                        value={selectedColor}
                        onChange={handleColorChange}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                </label>

                <div className="flex-grow" />

                <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                    <FaTrash /> Delete
                </button>
            </div>

            {/* Canvas Container */}
            <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-inner">
                <canvas ref={canvasRef} />
            </div>
            <p className="text-sm text-center text-gray-500">
                Select an object to resize, move, or change its color.
            </p>
        </div>
    );
};
