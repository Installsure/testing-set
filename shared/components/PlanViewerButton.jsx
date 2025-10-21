/**
 * Plan Viewer Button Component
 * Easy-to-use button component for opening plans
 */

import React from 'react';
import { usePlanViewer } from '../lib/usePlanViewer';

const PlanViewerButton = ({ 
  plan, 
  mode = 'modal', 
  children, 
  className = '',
  style = {},
  onClick,
  disabled = false,
  title = 'View Plan',
  ...props 
}) => {
  const { openPlan, isReady } = usePlanViewer();

  const handleClick = (e) => {
    if (disabled || !isReady || !plan) return;

    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }

    // Open plan
    try {
      openPlan(plan, { mode });
    } catch (error) {
      console.error('Failed to open plan:', error);
    }
  };

  const defaultStyle = {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ...style
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !isReady || !plan}
      className={className}
      style={defaultStyle}
      title={title}
      {...props}
    >
      {children || 'View Plan'}
    </button>
  );
};

export default PlanViewerButton;
