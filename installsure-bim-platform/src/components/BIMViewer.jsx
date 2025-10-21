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
  Building2
} from 'lucide-react';

export default function BIMViewer({ planId, planData }) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRenderRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [visibleLayers, setVisibleLayers] = useState({
    architectural: true,
    structural: true,
    mep: true,
    site: false
  });
  const [measurementMode, setMeasurementMode] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize Three.js scene (mock implementation)
    const scene = {
      background: '#f0f0f0',
      children: []
    };
    sceneRef.current = scene;

    // Mock camera
    const camera = {
      position: { x: 10, y: 10, z: 10 },
      lookAt: { x: 0, y: 0, z: 0 }
    };
    cameraRef.current = camera;

    // Mock renderer
    const renderer = {
      domElement: document.createElement('div'),
      setSize: () => {},
      render: () => {}
    };
    rendererRef.current = renderer;

    // Create mock 3D content based on plan data
    createMockBIMContent(scene, planData);
    
    setIsLoading(false);

    // Mock render loop
    const animate = () => {
      frameRenderRef.current = requestAnimationFrame(animate);
      // Mock rendering
    };
    animate();

    // Cleanup
    return () => {
      if (frameRenderRef.current) {
        cancelAnimationFrame(frameRenderRef.current);
      }
    };
  }, [planId, planData]);

  const createMockBIMContent = (scene, planData) => {
    if (!planData) return;

    // Create mock BIM elements based on plan type
    const mockElements = [];
    
    if (planData.type === 'ARCHITECTURAL') {
      mockElements.push(
        { type: 'wall', position: [0, 0, 0], size: [10, 3, 0.2], color: '#8B4513' },
        { type: 'wall', position: [0, 0, 10], size: [10, 3, 0.2], color: '#8B4513' },
        { type: 'wall', position: [0, 0, 0], size: [0.2, 3, 10], color: '#8B4513' },
        { type: 'wall', position: [10, 0, 0], size: [0.2, 3, 10], color: '#8B4513' },
        { type: 'floor', position: [0, 0, 0], size: [10, 0.1, 10], color: '#D2B48C' },
        { type: 'roof', position: [0, 3, 0], size: [10, 0.1, 10], color: '#A0522D' }
      );
    } else if (planData.type === 'STRUCTURAL') {
      mockElements.push(
        { type: 'beam', position: [0, 2, 0], size: [10, 0.3, 0.3], color: '#708090' },
        { type: 'beam', position: [0, 2, 10], size: [10, 0.3, 0.3], color: '#708090' },
        { type: 'column', position: [0, 0, 0], size: [0.3, 3, 0.3], color: '#708090' },
        { type: 'column', position: [10, 0, 0], size: [0.3, 3, 0.3], color: '#708090' },
        { type: 'column', position: [0, 0, 10], size: [0.3, 3, 0.3], color: '#708090' },
        { type: 'column', position: [10, 0, 10], size: [0.3, 3, 0.3], color: '#708090' }
      );
    } else if (planData.type === 'MEP') {
      mockElements.push(
        { type: 'duct', position: [1, 2.5, 1], size: [0.5, 0.3, 8], color: '#FFD700' },
        { type: 'pipe', position: [8, 1, 1], size: [0.2, 0.2, 8], color: '#4169E1' },
        { type: 'electrical', position: [2, 2.8, 2], size: [0.1, 0.1, 6], color: '#FF4500' }
      );
    } else if (planData.type === 'SITE') {
      mockElements.push(
        { type: 'building', position: [0, 0, 0], size: [10, 3, 10], color: '#8B4513' },
        { type: 'parking', position: [-5, 0, -5], size: [5, 0.1, 5], color: '#708090' },
        { type: 'landscape', position: [0, 0, -10], size: [20, 0.1, 10], color: '#228B22' }
      );
    }

    scene.elements = mockElements;
  };

  const resetView = () => {
    if (cameraRef.current) {
      cameraRef.current.position = { x: 10, y: 10, z: 10 };
      cameraRef.current.lookAt = { x: 0, y: 0, z: 0 };
    }
  };

  const zoomIn = () => {
    if (cameraRef.current) {
      cameraRef.current.position.x *= 0.8;
      cameraRef.current.position.y *= 0.8;
      cameraRef.current.position.z *= 0.8;
    }
  };

  const zoomOut = () => {
    if (cameraRef.current) {
      cameraRef.current.position.x *= 1.25;
      cameraRef.current.position.y *= 1.25;
      cameraRef.current.position.z *= 1.25;
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
      {/* 3D Viewport */}
      <div ref={mountRef} className="w-full h-full relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-gray-600">Loading BIM model...</p>
            </div>
          </div>
        )}
        
        {/* Mock 3D Content */}
        {!isLoading && sceneRef.current && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-200 rounded-lg mb-4 mx-auto flex items-center justify-center">
                <Building2 className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {planData?.title || 'BIM Model'}
              </h3>
              <p className="text-gray-600 mb-2">
                Type: {planData?.type || 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">
                {sceneRef.current.elements?.length || 0} elements loaded
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4">
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
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-48">
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

      {/* Element Info Panel */}
      {sceneRef.current?.elements && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="font-semibold mb-2 text-sm">Elements ({sceneRef.current.elements.length})</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {sceneRef.current.elements.map((element, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="capitalize">{element.type}</span>
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: element.color }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
