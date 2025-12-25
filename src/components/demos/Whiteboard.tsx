import { useRef, useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';

export const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      contextRef.current = ctx;
    }
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = brushSize;
    }
  }, [color, brushSize]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const getTouchPos = (touch: React.Touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawingTouch = (e: React.TouchEvent) => {
    // Prevent scrolling
    // Note: 'touch-action: none' in CSS is better, but preventDefault works for simple cases if event is not passive
    // React's onTouchMove is passive by default in some versions, but let's try relying on CSS class 'touch-none' which is already there.
    const { x, y } = getTouchPos(e.touches[0]);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getTouchPos(e.touches[0]);
    contextRef.current?.lineTo(x, y);
    contextRef.current?.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24 cursor-pointer"
          />
        </label>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2" />

        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <FaTrash /> Clear
        </button>
      </div>

      {/* Canvas Area */}
      <div className="relative h-[600px] border border-gray-200 dark:border-gray-800 rounded-xl bg-white shadow-inner overflow-hidden cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawingTouch}
          onTouchMove={drawTouch}
          onTouchEnd={finishDrawing}
          onTouchCancel={finishDrawing}
          className="w-full h-full block touch-none"
          style={{ width: '100%', height: '100%' }}
        />
        <div className="absolute bottom-4 right-4 pointer-events-none text-xs text-gray-400 select-none">
          Start drawing...
        </div>
      </div>
    </div>
  );
};
