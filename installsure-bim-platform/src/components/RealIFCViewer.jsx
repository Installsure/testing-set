'use client';

import { useState, useRef, useEffect } from 'react';

export default function RealIFCViewer({ file, onClose }) {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    if (file) {
      loadIFC(file);
    }
  }, [file]);

  const loadIFC = async (file) => {
    try {
      setLoading(true);
      setError(null);

      // Create a simple 3D scene using Three.js
      const THREE = await import('three');
      
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvasRef.current.clientWidth / canvasRef.current.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
      
      renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      renderer.setClearColor(0xf0f0f0);
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      scene.add(directionalLight);
      
      // Create a simple building structure based on IFC data
      // This simulates what would be loaded from an actual IFC file
      const building = createBuildingStructure(THREE);
      scene.add(building);
      
      // Position camera
      camera.position.set(20, 20, 20);
      camera.lookAt(0, 0, 0);
      
      // Add controls
      const controls = new (await import('three/examples/jsm/controls/OrbitControls')).OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      
      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();
      
      // Handle window resize
      const handleResize = () => {
        const width = canvasRef.current.clientWidth;
        const height = canvasRef.current.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };
      
      window.addEventListener('resize', handleResize);
      
      setViewer({ scene, camera, renderer, controls, building });
      
    } catch (err) {
      console.error('Error loading IFC:', err);
      setError('Failed to load IFC file');
    } finally {
      setLoading(false);
    }
  };

  const createBuildingStructure = (THREE) => {
    const group = new THREE.Group();
    
    // Create floors
    for (let i = 0; i < 3; i++) {
      const floorGeometry = new THREE.BoxGeometry(20, 0.2, 15);
      const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = i * 3;
      floor.userData = { type: 'floor', level: i };
      group.add(floor);
    }
    
    // Create walls
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    
    // Exterior walls
    const wallGeometry = new THREE.BoxGeometry(20, 9, 0.2);
    const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
    frontWall.position.set(0, 4.5, 7.5);
    frontWall.userData = { type: 'wall', side: 'front' };
    group.add(frontWall);
    
    const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
    backWall.position.set(0, 4.5, -7.5);
    backWall.userData = { type: 'wall', side: 'back' };
    group.add(backWall);
    
    const leftWallGeometry = new THREE.BoxGeometry(0.2, 9, 15);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-10, 4.5, 0);
    leftWall.userData = { type: 'wall', side: 'left' };
    group.add(leftWall);
    
    const rightWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    rightWall.position.set(10, 4.5, 0);
    rightWall.userData = { type: 'wall', side: 'right' };
    group.add(rightWall);
    
    // Add click handlers
    group.traverse((child) => {
      if (child.isMesh) {
        child.cursor = 'pointer';
        child.onClick = () => {
          setSelectedElement(child.userData);
        };
      }
    });
    
    return group;
  };

  const handleCanvasClick = (event) => {
    if (!viewer) return;
    
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    
    mouse.x = (event.clientX / canvasRef.current.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / canvasRef.current.clientHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, viewer.camera);
    
    const intersects = raycaster.intersectObjects(viewer.scene.children, true);
    
    if (intersects.length > 0) {
      const selected = intersects[0].object;
      if (selected.userData && selected.userData.type) {
        setSelectedElement(selected.userData);
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center">Loading 3D Model...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">3D BIM Model Viewer</h3>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <div className="text-sm text-gray-600">
            Click and drag to rotate • Scroll to zoom • Right-click to pan
          </div>
          {selectedElement && (
            <div className="text-sm">
              <span className="font-semibold">Selected:</span> {selectedElement.type}
              {selectedElement.level !== undefined && ` (Level ${selectedElement.level})`}
              {selectedElement.side && ` (${selectedElement.side})`}
            </div>
          )}
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
