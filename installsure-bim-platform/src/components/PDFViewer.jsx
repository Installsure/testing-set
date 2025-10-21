'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Tag, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

export default function PDFViewer({ planData, onTagAdd }) {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [scale, setScale] = useState(1.5);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    createMockPDF();
  }, [planData]);

  const createMockPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 1000;

    // Draw mock PDF content
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw mock plan content
    ctx.fillStyle = '#000000';
    ctx.font = '24px Arial';
    ctx.fillText(planData?.title || 'Construction Plan', 50, 100);
    
    ctx.font = '16px Arial';
    ctx.fillText(`Type: ${planData?.type || 'ARCHITECTURAL'}`, 50, 150);
    ctx.fillText(`Version: ${planData?.version || 'Rev 1.0'}`, 50, 180);
    ctx.fillText(`Status: ${planData?.status || 'CURRENT'}`, 50, 210);
    ctx.fillText(`Modified: ${planData?.modified || 'Today'}`, 50, 240);

    // Draw mock plan elements
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    
    // Draw some mock walls
    ctx.beginPath();
    ctx.moveTo(100, 300);
    ctx.lineTo(700, 300);
    ctx.moveTo(100, 300);
    ctx.lineTo(100, 800);
    ctx.moveTo(700, 300);
    ctx.lineTo(700, 800);
    ctx.moveTo(100, 800);
    ctx.lineTo(700, 800);
    ctx.stroke();

    // Draw mock rooms
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(150, 350, 200, 150);
    ctx.fillRect(400, 350, 200, 150);
    ctx.fillRect(150, 550, 450, 200);

    // Add room labels
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.fillText('Room A', 200, 430);
    ctx.fillText('Room B', 450, 430);
    ctx.fillText('Main Hall', 300, 650);

    setIsLoading(false);
  };

  const renderPDF = (pdf) => {
    // This would be the actual PDF rendering code
    // For now, we're using the mock
    createMockPDF();
  };

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Add a new tag
    const newTag = {
      id: `tag-${Date.now()}`,
      x: x / canvas.width,
      y: y / canvas.height,
      text: `Tag ${tags.length + 1}`,
      color: '#ff0000'
    };

    setTags(prev => [...prev, newTag]);
    
    if (onTagAdd) {
      onTagAdd(newTag);
    }
  };

  const renderTags = () => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear existing tags
    svg.innerHTML = '';

    // Render all tags
    tags.forEach(tag => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', tag.x * canvasRef.current.width);
      circle.setAttribute('cy', tag.y * canvasRef.current.height);
      circle.setAttribute('r', '8');
      circle.setAttribute('fill', tag.color);
      circle.setAttribute('stroke', '#ffffff');
      circle.setAttribute('stroke-width', '2');
      circle.style.cursor = 'pointer';
      
      // Add click handler for tag
      circle.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Tag clicked:', tag);
      });

      svg.appendChild(circle);

      // Add text label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', tag.x * canvasRef.current.width + 15);
      text.setAttribute('y', tag.y * canvasRef.current.height + 5);
      text.setAttribute('fill', '#000000');
      text.setAttribute('font-size', '12');
      text.setAttribute('font-family', 'Arial');
      text.textContent = tag.text;
      svg.appendChild(text);
    });
  };

  useEffect(() => {
    renderTags();
  }, [tags]);

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const resetView = () => setScale(1.5);

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Controls */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <div className="flex space-x-2">
          <button
            onClick={zoomIn}
            className="p-2 hover:bg-gray-100 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 hover:bg-gray-100 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 hover:bg-gray-100 rounded"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => console.log('Download PDF')}
            className="p-2 hover:bg-gray-100 rounded"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Scale: {scale.toFixed(1)}x | Tags: {tags.length}
        </div>
      </div>

      {/* PDF Container */}
      <div ref={containerRef} className="w-full h-full overflow-auto">
        <div 
          id="plan-wrap" 
          className="relative mx-auto"
          style={{ width: 'fit-content', height: 'fit-content' }}
        >
          <canvas
            ref={canvasRef}
            className="border border-gray-300 shadow-lg cursor-crosshair"
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
            onClick={handleCanvasClick}
          />
          <svg
            ref={svgRef}
            className="absolute left-0 top-0 pointer-events-none"
            style={{ 
              width: canvasRef.current?.width || 0, 
              height: canvasRef.current?.height || 0,
              transform: `scale(${scale})`,
              transformOrigin: 'top left'
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Loading PDF...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
        <Tag className="w-4 h-4 inline mr-1" />
        Click on the plan to add tags
      </div>
    </div>
  );
}
