'use client';

import { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js`;

export default function RealPDFViewer({ file, onClose }) {
  const canvasRef = useRef(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tags, setTags] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newTag, setNewTag] = useState({ x: 0, y: 0, text: '', visible: false });

  // Load PDF when file changes
  useEffect(() => {
    if (file) {
      loadPDF(file);
    }
  }, [file]);

  const loadPDF = async (file) => {
    try {
      setLoading(true);
      setError(null);
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render first page
      await renderPage(pdf, 1);
      
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF file');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
    } catch (err) {
      console.error('Error rendering page:', err);
      setError('Failed to render PDF page');
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages && pdfDoc) {
      setCurrentPage(pageNum);
      renderPage(pdfDoc, pageNum);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleCanvasClick = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / canvas.width) * 100;
    const y = ((e.clientY - rect.top) / canvas.height) * 100;
    
    setNewTag({ x, y, text: '', visible: true });
  };

  const addTag = () => {
    if (newTag.text.trim()) {
      setTags(prev => [...prev, { ...newTag, id: Date.now() }]);
      setNewTag({ x: 0, y: 0, text: '', visible: false });
    }
  };

  const removeTag = (id) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-center">Loading PDF...</p>
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
          <h3 className="text-lg font-semibold">Construction Plan Viewer</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDrawing(!isDrawing)}
              className={`px-3 py-1 rounded text-sm ${
                isDrawing ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isDrawing ? 'Drawing Mode ON' : 'Add Tags'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="px-3 py-1 bg-white border rounded">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 bg-blue-600 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="px-3 py-1 bg-gray-600 text-white rounded"
            >
              Zoom Out
            </button>
            <span className="px-3 py-1 bg-white border rounded">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="px-3 py-1 bg-gray-600 text-white rounded"
            >
              Zoom In
            </button>
          </div>
        </div>

        {/* PDF Canvas Container */}
        <div className="flex-1 overflow-auto p-4 relative">
          <div className="relative inline-block">
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              className="border border-gray-300 cursor-crosshair"
            />
            
            {/* Tags Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                >
                  <div className="bg-red-500 text-white px-2 py-1 rounded text-sm relative">
                    {tag.text}
                    <button
                      onClick={() => removeTag(tag.id)}
                      className="ml-1 text-xs hover:bg-red-600 rounded px-1"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Tag Input */}
        {newTag.visible && (
          <div className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <h4 className="font-semibold mb-2">Add Tag</h4>
              <input
                type="text"
                value={newTag.text}
                onChange={(e) => setNewTag(prev => ({ ...prev, text: e.target.value }))}
                placeholder="Enter tag text..."
                className="w-full px-3 py-2 border rounded mb-3"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Tag
                </button>
                <button
                  onClick={() => setNewTag({ x: 0, y: 0, text: '', visible: false })}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
