/**
 * React Hook for Plan Viewer Integration
 * Provides easy integration with React components
 */

import { useCallback, useEffect, useRef } from 'react';

export const usePlanViewer = () => {
  const planViewerRef = useRef(null);

  useEffect(() => {
    // Initialize plan viewer if not already done
    if (!window.PlanViewer) {
      // Load the plan viewer script if not already loaded
      if (!document.querySelector('script[src*="plan-viewer.js"]')) {
        const script = document.createElement('script');
        script.src = '/shared/lib/plan-viewer.js';
        script.async = true;
        document.head.appendChild(script);
      }
    }
    planViewerRef.current = window.PlanViewer;
  }, []);

  const openPlan = useCallback((plan, options = {}) => {
    if (!planViewerRef.current) {
      console.error('PlanViewer not initialized');
      return null;
    }

    try {
      return planViewerRef.current.openPlan(plan, options);
    } catch (error) {
      console.error('Failed to open plan:', error);
      return null;
    }
  }, []);

  const openPlanInWindow = useCallback((plan, options = {}) => {
    return openPlan(plan, { ...options, mode: 'window' });
  }, [openPlan]);

  const openPlanInModal = useCallback((plan, options = {}) => {
    return openPlan(plan, { ...options, mode: 'modal' });
  }, [openPlan]);

  const closePlan = useCallback((planId) => {
    if (!planViewerRef.current) return;
    
    // Close window if it exists
    if (planViewerRef.current.activeWindows.has(planId)) {
      const window = planViewerRef.current.activeWindows.get(planId);
      if (!window.closed) {
        window.close();
      }
    }

    // Close modal if it exists
    planViewerRef.current.closeModal(`plan-modal-${planId}`);
  }, []);

  const closeAllPlans = useCallback(() => {
    if (!planViewerRef.current) return;
    
    planViewerRef.current.closeAllModals();
    planViewerRef.current.closeAllWindows();
  }, []);

  return {
    openPlan,
    openPlanInWindow,
    openPlanInModal,
    closePlan,
    closeAllPlans,
    isReady: !!planViewerRef.current
  };
};

export default usePlanViewer;
