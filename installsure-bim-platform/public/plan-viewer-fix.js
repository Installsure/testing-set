/**
 * Plan Viewer Fix Script
 * This script fixes all plan viewing issues by injecting the Universal Plan Viewer
 * and patching existing buttons to use it
 */

(function() {
  'use strict';

  console.log('🔧 Plan Viewer Fix Script starting...');

  // Wait for DOM to be ready
  function waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  // Load the Universal Plan Viewer script
  function loadUniversalPlanViewer() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.UniversalPlanViewer) {
        console.log('✅ UniversalPlanViewer already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = '/shared/lib/universal-plan-viewer.js';
      script.onload = () => {
        console.log('✅ UniversalPlanViewer loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('❌ Failed to load UniversalPlanViewer');
        reject(new Error('Failed to load UniversalPlanViewer'));
      };
      document.head.appendChild(script);
    });
  }

  // Patch all "View Details" buttons
  function patchViewDetailsButtons() {
    const buttons = document.querySelectorAll('button[title="View Details"], button[title*="View"], .eye-icon, [data-testid*="view"]');
    
    buttons.forEach((button, index) => {
      if (button.dataset.patched) return; // Skip already patched buttons
      
      console.log(`🔧 Patching button ${index + 1}:`, button);
      
      // Add patch marker
      button.dataset.patched = 'true';
      
      // Store original onclick
      const originalOnclick = button.onclick;
      
      // Create new onclick handler
      button.onclick = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('🎯 View Details button clicked');
        
        // Try to extract job data from the DOM
        const jobData = extractJobDataFromButton(button);
        
        if (jobData) {
          console.log('📊 Job data extracted:', jobData);
          
          if (window.UniversalPlanViewer) {
            window.UniversalPlanViewer.openPlan(jobData, {
              title: `Job Details: ${jobData.plan_goal || jobData.goal || 'Unknown'}`,
              mode: 'modal',
              width: 1000,
              height: 700
            });
          } else {
            console.error('❌ UniversalPlanViewer not available');
            alert('Plan viewer not available. Please refresh the page.');
          }
        } else {
          console.warn('⚠️ Could not extract job data, showing fallback');
          showFallbackViewer(button);
        }
      };
    });
    
    console.log(`✅ Patched ${buttons.length} view buttons`);
  }

  // Extract job data from button's parent elements
  function extractJobDataFromButton(button) {
    // Look for job data in parent elements
    let jobElement = button.closest('.p-6, .job-item, [data-job-id]');
    
    if (!jobElement) {
      // Try to find by walking up the DOM tree
      let current = button.parentElement;
      while (current && !jobElement) {
        if (current.querySelector('.font-medium, .job-title, [data-plan-goal]')) {
          jobElement = current;
          break;
        }
        current = current.parentElement;
      }
    }

    if (!jobElement) {
      return null;
    }

    // Extract job data from the element
    const jobData = {
      id: extractTextContent(jobElement, '.job-id, [data-job-id], .font-medium:contains("#")') || 
          extractTextContent(jobElement, 'span:contains("Job ID:")')?.replace('#', '').trim() ||
          `job-${Date.now()}`,
      goal: extractTextContent(jobElement, '.job-title, .font-medium.text-gray-900, [data-plan-goal]') ||
            extractTextContent(jobElement, 'h3, .font-medium') ||
            'Unknown Plan',
      status: extractTextContent(jobElement, '.status-badge, .px-2.py-1, [data-status]') ||
              extractTextContent(jobElement, '.bg-blue-100, .bg-green-100, .bg-red-100') ||
              'unknown',
      started_at: extractTextContent(jobElement, '.started-at, [data-started]') || null,
      completed_at: extractTextContent(jobElement, '.completed-at, [data-completed]') || null,
      steps: extractStepsFromElement(jobElement),
      logs: extractLogsFromElement(jobElement),
      scorecard: extractScorecardFromElement(jobElement)
    };

    return jobData;
  }

  // Helper function to extract text content from element
  function extractTextContent(parent, selector) {
    try {
      const element = parent.querySelector(selector);
      return element ? element.textContent.trim() : null;
    } catch (e) {
      return null;
    }
  }

  // Extract steps from element
  function extractStepsFromElement(element) {
    const stepsList = element.querySelector('.steps-list, .execution-steps, ul');
    if (stepsList) {
      return Array.from(stepsList.querySelectorAll('li')).map(li => li.textContent.trim());
    }
    return [];
  }

  // Extract logs from element
  function extractLogsFromElement(element) {
    const logsContainer = element.querySelector('.logs-container, .execution-logs');
    if (logsContainer) {
      return Array.from(logsContainer.querySelectorAll('.log-entry')).map(log => ({
        timestamp: log.dataset.timestamp || new Date().toISOString(),
        level: log.dataset.level || 'info',
        message: log.textContent.trim()
      }));
    }
    return [];
  }

  // Extract scorecard from element
  function extractScorecardFromElement(element) {
    const scorecardContainer = element.querySelector('.scorecard, .performance-metrics');
    if (scorecardContainer) {
      const scorecard = {};
      scorecardContainer.querySelectorAll('.metric, .score-item').forEach(metric => {
        const key = metric.dataset.key || metric.querySelector('.metric-name')?.textContent.trim();
        const value = metric.dataset.value || metric.querySelector('.metric-value')?.textContent.trim();
        if (key && value) {
          scorecard[key] = isNaN(value) ? value : parseFloat(value);
        }
      });
      return scorecard;
    }
    return null;
  }

  // Show fallback viewer when data extraction fails
  function showFallbackViewer(button) {
    const fallbackData = {
      id: `fallback-${Date.now()}`,
      goal: 'Plan Details',
      status: 'unknown',
      steps: ['Step 1: Data extraction failed', 'Step 2: Showing fallback viewer'],
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: 'Could not extract complete plan data from DOM'
      }]
    };

    if (window.UniversalPlanViewer) {
      window.UniversalPlanViewer.openPlan(fallbackData, {
        title: 'Plan Details (Fallback)',
        mode: 'modal'
      });
    } else {
      alert('Plan viewer not available. Please refresh the page.');
    }
  }

  // Find the associated plan from a tag button
  function findAssociatedPlanFromTag(tagButton) {
    try {
      // Method 1: Look for data attributes on the tag button
      const planId = tagButton.dataset.planId || tagButton.dataset.planId || tagButton.getAttribute('data-plan-id');
      const planTitle = tagButton.dataset.planTitle || tagButton.getAttribute('data-plan-title');
      
      if (planId) {
        return {
          id: planId,
          goal: planTitle || `Plan ${planId}`,
          status: 'tagged',
          type: 'tagged_plan',
          tagSource: 'data_attribute',
          tagElement: tagButton.textContent.trim()
        };
      }

      // Method 2: Look for parent elements that might contain plan data
      let currentElement = tagButton.parentElement;
      while (currentElement && currentElement !== document.body) {
        // Check for plan data in parent elements
        const parentPlanId = currentElement.dataset.planId || currentElement.getAttribute('data-plan-id');
        const parentPlanTitle = currentElement.dataset.planTitle || currentElement.getAttribute('data-plan-title');
        
        if (parentPlanId) {
          return {
            id: parentPlanId,
            goal: parentPlanTitle || `Plan ${parentPlanId}`,
            status: 'tagged',
            type: 'tagged_plan',
            tagSource: 'parent_element',
            tagElement: tagButton.textContent.trim()
          };
        }

        // Check for plan cards or plan containers
        const planCard = currentElement.querySelector('[data-plan-id], .plan-card, .plan-item, [data-plan-title]');
        if (planCard) {
          const cardPlanId = planCard.dataset.planId || planCard.getAttribute('data-plan-id');
          const cardPlanTitle = planCard.dataset.planTitle || planCard.getAttribute('data-plan-title') || 
                               planCard.querySelector('h3, .title, .plan-title')?.textContent?.trim();
          
          if (cardPlanId || cardPlanTitle) {
            return {
              id: cardPlanId || `plan-${Date.now()}`,
              goal: cardPlanTitle || 'Tagged Plan',
              status: 'tagged',
              type: 'tagged_plan',
              tagSource: 'plan_card',
              tagElement: tagButton.textContent.trim()
            };
          }
        }

        currentElement = currentElement.parentElement;
      }

      // Method 3: Look for nearby plan elements in the same container
      const container = tagButton.closest('.plan-card, .plan-item, .plan-container, .card, .item');
      if (container) {
        const planTitle = container.querySelector('h3, .title, .plan-title, .card-title')?.textContent?.trim();
        const planId = container.dataset.planId || container.getAttribute('data-plan-id');
        
        if (planTitle || planId) {
          return {
            id: planId || `plan-${Date.now()}`,
            goal: planTitle || 'Tagged Plan',
            status: 'tagged',
            type: 'tagged_plan',
            tagSource: 'container',
            tagElement: tagButton.textContent.trim()
          };
        }
      }

      // Method 4: Look for plan data in the same row or grid cell
      const row = tagButton.closest('tr, .row, .grid-item, .card');
      if (row) {
        const planTitle = row.querySelector('h3, .title, .plan-title, .card-title, td:first-child')?.textContent?.trim();
        const planId = row.dataset.planId || row.getAttribute('data-plan-id');
        
        if (planTitle || planId) {
          return {
            id: planId || `plan-${Date.now()}`,
            goal: planTitle || 'Tagged Plan',
            status: 'tagged',
            type: 'tagged_plan',
            tagSource: 'row',
            tagElement: tagButton.textContent.trim()
          };
        }
      }

      // Method 5: Try to extract from URL or page context
      const url = window.location.href;
      const planMatch = url.match(/\/plans\/([^\/]+)/);
      if (planMatch) {
        return {
          id: planMatch[1],
          goal: 'Current Plan',
          status: 'tagged',
          type: 'tagged_plan',
          tagSource: 'url',
          tagElement: tagButton.textContent.trim()
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding associated plan from tag:', error);
      return null;
    }
  }

  // Patch other common viewer buttons
  function patchOtherViewerButtons() {
    // Patch BIM viewer buttons
    const bimButtons = document.querySelectorAll('[href*="viewer"], [href*="bim"], .bim-viewer, .viewer-button, [data-viewer], .viewer-link');
    bimButtons.forEach(button => {
      if (button.dataset.patched) return;
      button.dataset.patched = 'true';
      
      button.addEventListener('click', function(event) {
        event.preventDefault();
        console.log('🎯 BIM Viewer button clicked');
        
        // Try to open BIM viewer
        const url = button.href || button.dataset.url || button.dataset.viewer;
        if (url) {
          if (window.UniversalPlanViewer) {
            window.UniversalPlanViewer.openPlan({
              id: `bim-${Date.now()}`,
              goal: 'BIM 3D Viewer',
              status: 'loading',
              type: 'bim_viewer',
              url: url
            }, {
              title: 'BIM 3D Viewer',
              mode: 'window'
            });
          } else {
            window.open(url, '_blank');
          }
        }
      });
    });

    // Patch tagging system buttons
    const tagButtons = document.querySelectorAll('.tag-button, [data-tag], .tagging-control, .tag-control, [data-tagging], .edit-tag, [data-edit-tag], .tag-edit-button');
    
    // Also find buttons by text content (for "Edit Tag" buttons)
    const allButtons = document.querySelectorAll('button, a, .btn, .button');
    allButtons.forEach(button => {
      const buttonText = button.textContent.trim().toLowerCase();
      if (buttonText.includes('edit tag') || buttonText.includes('edit-tag') || buttonText.includes('tag edit')) {
        if (!Array.from(tagButtons).includes(button)) {
          tagButtons.push(button);
        }
      }
    });
    
    tagButtons.forEach(button => {
      if (button.dataset.patched) return;
      button.dataset.patched = 'true';
      
      button.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('🎯 Tagging button clicked:', button.textContent.trim());
        
        // Try to find the associated plan from the tag
        const associatedPlan = findAssociatedPlanFromTag(button);
        
        if (associatedPlan) {
          console.log('📋 Found associated plan:', associatedPlan);
          
          if (window.UniversalPlanViewer) {
            window.UniversalPlanViewer.openPlan(associatedPlan, {
              title: `Plan: ${associatedPlan.goal || associatedPlan.title || 'Tagged Plan'}`,
              mode: 'modal',
              width: 1000,
              height: 700
            });
          }
        } else {
          // Fallback to generic tagging data
          const tagData = {
            id: `tag-${Date.now()}`,
            goal: 'Tagging System',
            status: 'active',
            type: 'tagging_system',
            tagType: button.dataset.tag || button.dataset.tagging || 'unknown',
            element: button.textContent.trim(),
            message: 'Associated plan not found. This tag may need to be linked to a plan.',
            steps: [
              'This tag button was clicked but no associated plan was found.',
              'The tag may need to be properly linked to a plan in the system.',
              'Check if the tag has proper data attributes or is within a plan container.'
            ]
          };
          
          if (window.UniversalPlanViewer) {
            window.UniversalPlanViewer.openPlan(tagData, {
              title: `Tagging: ${tagData.element}`,
              mode: 'modal'
            });
          }
        }
      });
    });

    // Patch 3D viewer controls
    const viewerControls = document.querySelectorAll('.viewer-control, .three-viewer, .bim-controls, [data-viewer-control]');
    viewerControls.forEach(control => {
      if (control.dataset.patched) return;
      control.dataset.patched = 'true';
      
      control.addEventListener('click', function(event) {
        console.log('🎯 3D Viewer control clicked');
        
        const viewerData = {
          id: `viewer-${Date.now()}`,
          goal: '3D Viewer Control',
          status: 'active',
          type: 'viewer_control',
          control: control.textContent.trim(),
          action: control.dataset.action || 'unknown'
        };
        
        if (window.UniversalPlanViewer) {
          window.UniversalPlanViewer.openPlan(viewerData, {
            title: `Viewer Control: ${viewerData.control}`,
            mode: 'modal'
          });
        }
      });
    });
  }

  // Initialize everything
  async function initialize() {
    try {
      console.log('🚀 Initializing Plan Viewer Fix...');
      
      // Wait for DOM
      await waitForDOM();
      console.log('✅ DOM ready');
      
      // Load Universal Plan Viewer
      await loadUniversalPlanViewer();
      
      // Patch buttons
      patchViewDetailsButtons();
      patchOtherViewerButtons();
      
      console.log('✅ Plan Viewer Fix completed successfully!');
      
      // Set up observer to patch new buttons as they're added
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // Patch new buttons in added nodes
              const newButtons = node.querySelectorAll ? 
                node.querySelectorAll('button[title="View Details"], button[title*="View"], .eye-icon') : [];
              newButtons.forEach(button => {
                if (!button.dataset.patched) {
                  patchViewDetailsButtons();
                  patchOtherViewerButtons();
                }
              });
            }
          });
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
    } catch (error) {
      console.error('❌ Plan Viewer Fix failed:', error);
    }
  }

  // Start initialization
  initialize();

})();
