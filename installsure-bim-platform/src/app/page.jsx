'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  FileText,
  Calendar,
  Tag,
  MessageSquare,
  CheckSquare,
  Folder,
  Eye,
  Download,
  Filter,
  Search,
  Monitor
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import IFCViewer from '../components/IFCViewer';

// Mock construction plans data
const mockPlans = [
  {
    id: 'plan-1',
    title: 'Whispering Pines Building A - Floor Plans',
    type: 'ARCHITECTURAL',
    status: 'CURRENT',
    version: 'Rev 3.0',
    modified: '10/13/2025',
    tags: ['floor-plans', 'building-a', 'architectural']
  },
  {
    id: 'plan-2',
    title: 'Structural Foundation Layout',
    type: 'STRUCTURAL',
    status: 'CURRENT',
    version: 'Rev 2.1',
    modified: '10/12/2025',
    tags: ['foundation', 'structural', 'layout']
  },
  {
    id: 'plan-3',
    title: 'MEP Systems - HVAC Distribution',
    type: 'MEP',
    status: 'UNDER REVIEW',
    version: 'Rev 1.5',
    modified: '10/11/2025',
    tags: ['hvac', 'mep', 'systems']
  },
  {
    id: 'plan-4',
    title: 'Site Development Plan',
    type: 'SITE',
    status: 'CURRENT',
    version: 'Rev 4.0',
    modified: '10/10/2025',
    tags: ['site', 'development', 'planning']
  },
  {
    id: 'plan-5',
    title: 'Elevation Views - North & South',
    type: 'ARCHITECTURAL',
    status: 'SUPERSEDED',
    version: 'Rev 2.8',
    modified: '10/9/2025',
    tags: ['elevations', 'views', 'architectural']
  }
];

export default function InstallSureBIMPlatform() {
  const [activeFilter, setActiveFilter] = useState('All Plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'pdf', or '3d'
  const [tags, setTags] = useState([]);

  const { data: plans = mockPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 100));
      return mockPlans;
    }
  });

  // Ensure scripts load after component mounts
  useEffect(() => {
    const loadScripts = () => {
      // Load Universal Plan Viewer if not already loaded
      if (!window.UniversalPlanViewer) {
        const script = document.createElement('script');
        script.src = '/shared/lib/universal-plan-viewer.js';
        script.onload = () => {
          console.log('✅ Universal Plan Viewer loaded');
          // Trigger the plan viewer fix script
          if (window.patchAllPlanButtons) {
            window.patchAllPlanButtons();
          }
        };
        document.head.appendChild(script);
      } else {
        console.log('✅ Universal Plan Viewer already loaded');
        // Trigger the plan viewer fix script
        if (window.patchAllPlanButtons) {
          window.patchAllPlanButtons();
        }
      }
    };

    // Load scripts after a short delay to ensure DOM is ready
    const timer = setTimeout(loadScripts, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredPlans = plans.filter(plan => {
    const matchesFilter = activeFilter === 'All Plans' || plan.type === activeFilter;
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'CURRENT': return 'bg-green-100 text-green-800';
      case 'UNDER REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'SUPERSEDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ARCHITECTURAL': return 'bg-blue-100 text-blue-800';
      case 'STRUCTURAL': return 'bg-purple-100 text-purple-800';
      case 'MEP': return 'bg-orange-100 text-orange-800';
      case 'SITE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewPlan = (plan) => {
    console.log('Viewing plan:', plan);
    // This will be handled by the Universal Plan Viewer
    if (window.UniversalPlanViewer) {
      window.UniversalPlanViewer.openPlan({
        id: plan.id,
        goal: plan.title,
        status: plan.status.toLowerCase(),
        type: plan.type,
        version: plan.version,
        modified: plan.modified,
        tags: plan.tags,
        steps: [
          `Plan Type: ${plan.type}`,
          `Version: ${plan.version}`,
          `Status: ${plan.status}`,
          `Last Modified: ${plan.modified}`
        ]
      }, {
        title: `Plan: ${plan.title}`,
        mode: 'modal',
        width: 1000,
        height: 700
      });
    } else {
      alert('Plan viewer not available. Please refresh the page.');
    }
  };

  const handleViewIn3D = (plan) => {
    setSelectedPlan(plan);
    setViewMode('3d');
  };

  const handleViewPDF = (plan) => {
    setSelectedPlan(plan);
    setViewMode('pdf');
  };

  const handleTagAdd = (tag) => {
    setTags(prev => [...prev, { ...tag, planId: selectedPlan?.id }]);
    console.log('Tag added:', tag);
  };

  const handleElementSelect = (element) => {
    console.log('Element selected:', element);
    // Add tag for selected element
    const tag = {
      id: `element-tag-${Date.now()}`,
      elementId: element.id,
      elementType: element.type,
      elementName: element.name,
      planId: selectedPlan?.id
    };
    setTags(prev => [...prev, tag]);
  };

  const handleDownload = (plan) => {
    console.log('Downloading plan:', plan);
    // Simulate download
    alert(`Downloading ${plan.title}`);
  };

  const handleEditTag = (plan) => {
    console.log('🎯 Edit Tag clicked for plan:', plan);
    console.log('UniversalPlanViewer available:', !!window.UniversalPlanViewer);
    
    // Create a simple modal for tag editing
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-lg font-semibold mb-4">Edit Tags: ${plan.title}</h3>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Current Tags:</label>
          <div class="flex flex-wrap gap-2 mb-3">
            ${plan.tags.map(tag => `
              <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">${tag}</span>
            `).join('')}
          </div>
          <input 
            type="text" 
            placeholder="Add new tag..." 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            id="newTagInput"
          />
        </div>
        <div class="flex space-x-3">
          <button 
            onclick="this.closest('.fixed').remove()" 
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button 
            onclick="this.closest('.fixed').remove()" 
            class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on the input
    setTimeout(() => {
      const input = modal.querySelector('#newTagInput');
      if (input) input.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8" />
              <h1 className="text-xl font-bold">IS InstallSure v3.0 BIM Integration Platform</h1>
            </div>
            <div className="flex items-center space-x-6">
              <nav className="hidden md:flex space-x-4">
                <a href="/dashboard" className="hover:text-blue-200">Dashboard</a>
                <a href="/plans" className="text-blue-200 font-medium">Plans</a>
                <a href="/demo" className="hover:text-blue-200">Demo</a>
                <a href="/calendar" className="hover:text-blue-200">Calendar</a>
                <a href="/tagging" className="hover:text-blue-200">Tagging</a>
                <a href="/rfis" className="hover:text-blue-200">RFIs</a>
                <a href="/tasks" className="hover:text-blue-200">Tasks</a>
                <a href="/files" className="hover:text-blue-200">Files</a>
              </nav>
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>System Online</span>
                <span className="text-blue-200">Build: v3.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Construction Plans</h2>
          <p className="text-gray-600">View and manage project drawings and specifications</p>
          
          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Debug Status</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div>Universal Plan Viewer: {typeof window !== 'undefined' && window.UniversalPlanViewer ? '✅ Loaded' : '❌ Not loaded'}</div>
              <div>Plan Viewer Fix: {typeof window !== 'undefined' && window.patchAllPlanButtons ? '✅ Available' : '❌ Not available'}</div>
              <div>Plans Count: {plans.length}</div>
            </div>
            <button
              onClick={() => {
                console.log('Testing Edit Tag functionality...');
                if (plans.length > 0) {
                  handleEditTag(plans[0]);
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Test Edit Tag
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            {['All Plans', 'ARCHITECTURAL', 'STRUCTURAL', 'MEP', 'SITE'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('pdf')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'pdf'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              PDF View
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === '3d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Monitor className="w-4 h-4 inline mr-1" />
              3D View
            </button>
          </div>
        </div>

        {/* Content Area */}
        {viewMode === 'grid' ? (
          /* Plans Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Plan Preview */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Plan Preview</p>
                </div>
              </div>

              {/* Plan Details */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.title}</h3>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(plan.type)}`}>
                    {plan.type}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(plan.status)}`}>
                    {plan.status}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Version: {plan.version}</p>
                  <p>Modified: {plan.modified}</p>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {plan.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={() => handleEditTag(plan)}
                        title="Click to edit tags"
                      >
                        {tag}
                      </span>
                    ))}
                    <button
                      onClick={() => handleEditTag(plan)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors font-medium"
                      title="Edit all tags for this plan"
                    >
                      + Edit Tag
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPlan(plan)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Plan</span>
                  </button>
                  <button
                    onClick={() => handleViewPDF(plan)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                    title="View PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewIn3D(plan)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    title="View in 3D"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(plan)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
                    title="Download plan"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        ) : viewMode === 'pdf' ? (
          /* PDF Viewer */
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {selectedPlan ? (
              <PDFViewer planData={selectedPlan} onTagAdd={handleTagAdd} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a plan to view as PDF</h3>
                  <p className="text-gray-600 mb-4">Choose a plan from the grid view to see its PDF representation</p>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Grid View
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 3D Viewer */
          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            {selectedPlan ? (
              <IFCViewer planData={selectedPlan} onElementSelect={handleElementSelect} />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a plan to view in 3D</h3>
                  <p className="text-gray-600 mb-4">Choose a plan from the grid view to see its 3D representation</p>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Grid View
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State for Grid View */}
        {viewMode === 'grid' && filteredPlans.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms.' : 'No plans match the selected filter.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
