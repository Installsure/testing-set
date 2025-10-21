'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Home, 
  Ruler, 
  Eye,
  EyeOff,
  Settings,
  Building2,
  Tag
} from 'lucide-react';

export default function IFCViewer({ planData, onElementSelect }) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState({
    architectural: true,
    structural: true,
    mep: true,
    site: false
  });
  const [measurementMode, setMeasurementMode] = useState(false);

  useEffect(() => {
    initializeViewer();
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
    };
  }, []);

  const initializeViewer = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For demo purposes, create a mock 3D scene
      // In production, this would load the actual IFC.js library
      createMock3DScene();
      
    } catch (err) {
      console.error('IFC viewer initialization error:', err);
      setError('Failed to initialize 3D viewer. Using mock data for demo.');
      createMock3DScene();
    }
  };

  const createMock3DScene = () => {
    const container = containerRef.current;
    if (!container) return;

    // Create a mock 3D scene using CSS 3D transforms
    container.innerHTML = `
      <div class="mock-3d-scene" style="
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
        position: relative;
        perspective: 1000px;
        overflow: hidden;
      ">
        <div class="building-container" style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotateX(20deg) rotateY(45deg);
          transform-style: preserve-3d;
        ">
          ${createMockBuildingElements()}
        </div>
        
        <div class="controls-overlay" style="
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 10;
        ">
          <h3 style="margin: 0 0 10px 0; font-size: 14px; color: #333;">3D BIM Model</h3>
          <div style="font-size: 12px; color: #666;">
            <div>Plan: ${planData?.title || 'Unknown'}</div>
            <div>Type: ${planData?.type || 'ARCHITECTURAL'}</div>
            <div>Elements: 15 loaded</div>
            <div>Click elements to select</div>
          </div>
        </div>
      </div>
    `;

    // Add click handlers for element selection
    const elements = container.querySelectorAll('.bim-element');
    elements.forEach((element, index) => {
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        const elementId = `element-${index}`;
        setSelectedElement(elementId);
        if (onElementSelect) {
          onElementSelect({
            id: elementId,
            type: element.dataset.type,
            name: element.dataset.name
          });
        }
        console.log('Element selected:', elementId);
      });
    });

    // Set the global flag for e2e tests
    window.__ifcModelLoaded = true;
    setIsLoading(false);
  };

  const createMockBuildingElements = () => {
    const elements = [
      { type: 'wall', name: 'North Wall', x: 0, y: 0, z: 0, width: 100, height: 30, depth: 5, color: '#8B4513' },
      { type: 'wall', name: 'South Wall', x: 0, y: 0, z: 95, width: 100, height: 30, depth: 5, color: '#8B4513' },
      { type: 'wall', name: 'East Wall', x: 0, y: 0, z: 0, width: 5, height: 30, depth: 100, color: '#8B4513' },
      { type: 'wall', name: 'West Wall', x: 95, y: 0, z: 0, width: 5, height: 30, depth: 100, color: '#8B4513' },
      { type: 'floor', name: 'Ground Floor', x: 0, y: 0, z: 0, width: 100, height: 2, depth: 100, color: '#D2B48C' },
      { type: 'roof', name: 'Main Roof', x: 0, y: 28, z: 0, width: 100, height: 2, depth: 100, color: '#A0522D' },
      { type: 'column', name: 'Column A1', x: 20, y: 0, z: 20, width: 3, height: 30, depth: 3, color: '#708090' },
      { type: 'column', name: 'Column A2', x: 80, y: 0, z: 20, width: 3, height: 30, depth: 3, color: '#708090' },
      { type: 'column', name: 'Column B1', x: 20, y: 0, z: 80, width: 3, height: 30, depth: 3, color: '#708090' },
      { type: 'column', name: 'Column B2', x: 80, y: 0, z: 80, width: 3, height: 30, depth: 3, color: '#708090' },
      { type: 'beam', name: 'Main Beam 1', x: 0, y: 25, z: 50, width: 100, height: 3, depth: 3, color: '#708090' },
      { type: 'beam', name: 'Main Beam 2', x: 50, y: 25, z: 0, width: 3, height: 3, depth: 100, color: '#708090' },
      { type: 'duct', name: 'HVAC Duct', x: 10, y: 20, z: 10, width: 5, height: 3, depth: 80, color: '#FFD700' },
      { type: 'pipe', name: 'Water Pipe', x: 90, y: 15, z: 10, width: 2, height: 2, depth: 80, color: '#4169E1' },
      { type: 'electrical', name: 'Electrical Conduit', x: 15, y: 22, z: 15, width: 1, height: 1, depth: 70, color: '#FF4500' }
    ];

    return elements.map((element, index) => `
      <div 
        class="bim-element" 
        data-type="${element.type}" 
        data-name="${element.name}"
        style="
          position: absolute;
          left: ${element.x}px;
          top: ${element.z}px;
          width: ${element.width}px;
          height: ${element.depth}px;
          background: ${element.color};
          border: 1px solid rgba(0,0,0,0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          transform: translateY(${-element.y}px);
        "
        onmouseover="this.style.transform='translateY(${-element.y}px) scale(1.05)'"
        onmouseout="this.style.transform='translateY(${-element.y}px) scale(1)'"
      >
        <div style="
          position: absolute;
          top: -20px;
          left: 0;
          font-size: 10px;
          color: #333;
          white-space: nowrap;
          background: rgba(255,255,255,0.8);
          padding: 2px 4px;
          border-radius: 2px;
          opacity: 0;
          transition: opacity 0.2s ease;
        " class="element-label">${element.name}</div>
      </div>
    `).join('');
  };

  const resetView = () => {
    const container = containerRef.current?.querySelector('.building-container');
    if (container) {
      container.style.transform = 'translate(-50%, -50%) rotateX(20deg) rotateY(45deg)';
    }
  };

  const zoomIn = () => {
    const container = containerRef.current?.querySelector('.building-container');
    if (container) {
      const currentScale = parseFloat(container.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1');
      container.style.transform = container.style.transform.replace(/scale\([^)]+\)/, `scale(${Math.min(currentScale + 0.2, 2)})`);
    }
  };

  const zoomOut = () => {
    const container = containerRef.current?.querySelector('.building-container');
    if (container) {
      const currentScale = parseFloat(container.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1');
      container.style.transform = container.style.transform.replace(/scale\([^)]+\)/, `scale(${Math.max(currentScale - 0.2, 0.5)})`);
    }
  };

  const toggleLayer = (layer) => {
    setVisibleLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* 3D Container */}
      <div ref={containerRef} className="w-full h-full relative">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Loading 3D model...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="font-semibold mb-3 text-sm">View Controls</h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={resetView}
            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <Home className="w-4 h-4" />
            Reset View
          </button>
          <button
            onClick={zoomIn}
            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <ZoomIn className="w-4 h-4" />
            Zoom In
          </button>
          <button
            onClick={zoomOut}
            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-100 rounded"
          >
            <ZoomOut className="w-4 h-4" />
            Zoom Out
          </button>
          <button
            onClick={() => setMeasurementMode(!measurementMode)}
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded ${
              measurementMode ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
            }`}
          >
            <Ruler className="w-4 h-4" />
            Measure
          </button>
        </div>
      </div>

      {/* Layers Panel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-48 z-10">
        <h3 className="font-semibold mb-3 text-sm">Layers</h3>
        <div className="space-y-2">
          {Object.entries(visibleLayers).map(([layer, visible]) => (
            <label key={layer} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visible}
                onChange={() => toggleLayer(layer)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm capitalize">{layer}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Selected Element Info */}
      {selectedElement && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-10">
          <h3 className="font-semibold mb-2 text-sm">Selected Element</h3>
          <div className="text-sm text-gray-600">
            <div>ID: {selectedElement}</div>
            <div>Type: {selectedElement.split('-')[0]}</div>
            <div>Status: Active</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
        <Building2 className="w-4 h-4 inline mr-1" />
        Click elements to select
      </div>
    </div>
  );
}
