/**
 * Universal Plan Viewer - Fixes ALL plan viewing issues
 * This replaces all broken plan viewing functionality across all applications
 */

class UniversalPlanViewer {
  constructor() {
    this.activeWindows = new Map();
    this.activeModals = new Map();
    this.init();
  }

  init() {
    // Create global container
    this.createGlobalContainer();
    
    // Add global styles
    this.addGlobalStyles();
    
    // Override window.open if blocked
    this.setupWindowOpenFallback();
    
    console.log('UniversalPlanViewer initialized');
  }

  createGlobalContainer() {
    if (!document.getElementById('universal-plan-viewer-container')) {
      const container = document.createElement('div');
      container.id = 'universal-plan-viewer-container';
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 99999;
        pointer-events: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;
      document.body.appendChild(container);
    }
  }

  addGlobalStyles() {
    if (!document.getElementById('universal-plan-viewer-styles')) {
      const style = document.createElement('style');
      style.id = 'universal-plan-viewer-styles';
      style.textContent = `
        .upv-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          pointer-events: auto;
          animation: upv-fade-in 0.3s ease-out;
        }
        
        .upv-modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 90vw;
          height: 90vh;
          max-width: 1200px;
          max-height: 800px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: upv-slide-in 0.3s ease-out;
        }
        
        .upv-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
          flex-shrink: 0;
        }
        
        .upv-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #111827;
        }
        
        .upv-close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        
        .upv-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }
        
        .upv-body {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          background: white;
        }
        
        .upv-plan-section {
          margin-bottom: 24px;
        }
        
        .upv-plan-section h3 {
          color: #374151;
          margin-bottom: 12px;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 8px;
        }
        
        .upv-plan-details {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }
        
        .upv-status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .upv-status-completed { background: #dcfce7; color: #166534; }
        .upv-status-running { background: #fef3c7; color: #92400e; }
        .upv-status-failed { background: #fee2e2; color: #991b1b; }
        .upv-status-pending { background: #e5e7eb; color: #374151; }
        
        .upv-steps-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .upv-steps-list li {
          padding: 8px 12px;
          margin-bottom: 8px;
          background: #f3f4f6;
          border-radius: 6px;
          border-left: 3px solid #3b82f6;
        }
        
        .upv-json-display {
          background: #1f2937;
          color: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        
        @keyframes upv-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes upv-slide-in {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .upv-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }
      `;
      document.head.appendChild(style);
    }
  }

  setupWindowOpenFallback() {
    // Store original window.open
    this.originalWindowOpen = window.open;
    
    // Override window.open to handle blocked popups
    window.open = (url, name, features) => {
      try {
        const newWindow = this.originalWindowOpen(url, name, features);
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          throw new Error('Popup blocked');
        }
        return newWindow;
      } catch (error) {
        console.warn('Window.open failed, falling back to modal:', error);
        // Fallback to modal
        return this.createFallbackWindow(url, name);
      }
    };
  }

  createFallbackWindow(url, name) {
    // Create a pseudo-window using modal
    const modalId = `fallback-window-${Date.now()}`;
    const modal = this.createModal(modalId, {
      title: name || 'Plan Viewer',
      content: `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`
    });
    return {
      close: () => this.closeModal(modalId),
      closed: false,
      document: {
        write: (content) => {
          const iframe = modal.querySelector('iframe');
          if (iframe && iframe.contentDocument) {
            iframe.contentDocument.write(content);
            iframe.contentDocument.close();
          }
        },
        close: () => {}
      }
    };
  }

  /**
   * Main function to open a plan - handles all cases
   */
  openPlan(plan, options = {}) {
    const {
      mode = 'modal',
      width = 900,
      height = 700,
      title = 'Plan Viewer',
      allowWindow = true
    } = options;

    console.log('Opening plan:', plan, 'with options:', options);

    if (!plan) {
      this.showError('No plan data provided');
      return null;
    }

    try {
      if (mode === 'window' && allowWindow) {
        return this.openInWindow(plan, { width, height, title });
      } else {
        return this.openInModal(plan, { width, height, title });
      }
    } catch (error) {
      console.error('Failed to open plan:', error);
      this.showError(`Failed to open plan: ${error.message}`);
      return null;
    }
  }

  openInWindow(plan, options) {
    const { width, height, title } = options;
    const planId = plan.id || Date.now().toString();
    
    try {
      const features = [
        `width=${width}`,
        `height=${height}`,
        'resizable=yes',
        'scrollbars=yes',
        'toolbar=no',
        'menubar=no',
        'location=no',
        'status=no'
      ].join(',');

      const newWindow = window.open('', `plan-${planId}`, features);
      
      if (!newWindow || newWindow.closed) {
        throw new Error('Window blocked or failed to open');
      }

      // Write content to window
      newWindow.document.write(this.generateWindowContent(plan, title));
      newWindow.document.close();
      
      // Focus window
      newWindow.focus();
      
      // Store reference
      this.activeWindows.set(planId, newWindow);
      
      // Cleanup on close
      newWindow.addEventListener('beforeunload', () => {
        this.activeWindows.delete(planId);
      });

      return newWindow;
    } catch (error) {
      console.warn('Window opening failed, falling back to modal:', error);
      return this.openInModal(plan, options);
    }
  }

  openInModal(plan, options) {
    const { width, height, title } = options;
    const planId = plan.id || Date.now().toString();
    const modalId = `plan-modal-${planId}`;
    
    // Remove existing modal
    this.closeModal(modalId);

    const modal = document.createElement('div');
    modal.className = 'upv-modal';
    modal.id = modalId;
    modal.setAttribute('data-plan-id', planId);

    const modalContent = document.createElement('div');
    modalContent.className = 'upv-modal-content';
    modalContent.style.width = `${width}px`;
    modalContent.style.height = `${height}px`;

    // Header
    const header = document.createElement('div');
    header.className = 'upv-header';
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'upv-title';
    titleEl.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'upv-close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => this.closeModal(modalId);
    
    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    // Body
    const body = document.createElement('div');
    body.className = 'upv-body';
    body.innerHTML = this.generatePlanContent(plan);

    // Assemble
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modal.appendChild(modalContent);

    // Add to DOM
    const container = document.getElementById('universal-plan-viewer-container');
    container.appendChild(modal);

    // Store reference
    this.activeModals.set(modalId, modal);

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modalId);
      }
    });

    // Escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modalId);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    return modal;
  }

  generateWindowContent(plan, title) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f9fafb;
            color: #111827;
            line-height: 1.6;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: #f3f4f6;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #111827;
          }
          .content {
            padding: 24px;
          }
          .plan-section {
            margin-bottom: 24px;
          }
          .plan-section h3 {
            color: #374151;
            margin-bottom: 12px;
            font-size: 18px;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .plan-details {
            background: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-running { background: #fef3c7; color: #92400e; }
          .status-failed { background: #fee2e2; color: #991b1b; }
          .status-pending { background: #e5e7eb; color: #374151; }
          .steps-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          .steps-list li {
            padding: 8px 12px;
            margin-bottom: 8px;
            background: #f3f4f6;
            border-radius: 6px;
            border-left: 3px solid #3b82f6;
          }
          .json-display {
            background: #1f2937;
            color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            overflow-x: auto;
            white-space: pre-wrap;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            ${this.generatePlanContent(plan)}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generatePlanContent(plan) {
    if (!plan) {
      return '<div class="upv-error">No plan data available.</div>';
    }

    const status = (plan.status || 'pending').toLowerCase();
    const statusClass = `upv-status-${status}`;

    return `
      <div class="upv-plan-section">
        <h3>Plan Details</h3>
        <div class="upv-plan-details">
          <p><strong>ID:</strong> ${plan.id || 'N/A'}</p>
          <p><strong>Goal:</strong> ${plan.goal || plan.plan_goal || 'N/A'}</p>
          <p><strong>Status:</strong> <span class="upv-status-badge ${statusClass}">${plan.status || 'Pending'}</span></p>
          ${plan.created_at ? `<p><strong>Created:</strong> ${new Date(plan.created_at).toLocaleString()}</p>` : ''}
          ${plan.updated_at ? `<p><strong>Updated:</strong> ${new Date(plan.updated_at).toLocaleString()}</p>` : ''}
          ${plan.started_at ? `<p><strong>Started:</strong> ${new Date(plan.started_at).toLocaleString()}</p>` : ''}
          ${plan.completed_at ? `<p><strong>Completed:</strong> ${new Date(plan.completed_at).toLocaleString()}</p>` : ''}
        </div>
      </div>

      ${plan.steps && plan.steps.length > 0 ? `
        <div class="upv-plan-section">
          <h3>Execution Steps</h3>
          <div class="upv-plan-details">
            <ul class="upv-steps-list">
              ${plan.steps.map(step => `<li>${step}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}

      ${plan.requires_approval !== undefined ? `
        <div class="upv-plan-section">
          <h3>Approval</h3>
          <div class="upv-plan-details">
            <p><strong>Requires Approval:</strong> ${plan.requires_approval ? 'Yes' : 'No'}</p>
          </div>
        </div>
      ` : ''}

      ${plan.scorecard || plan.results ? `
        <div class="upv-plan-section">
          <h3>Results</h3>
          <div class="upv-plan-details">
            <div class="upv-json-display">${JSON.stringify(plan.scorecard || plan.results, null, 2)}</div>
          </div>
        </div>
      ` : ''}

      ${plan.logs && plan.logs.length > 0 ? `
        <div class="upv-plan-section">
          <h3>Execution Logs</h3>
          <div class="upv-plan-details">
            <div class="upv-json-display">${JSON.stringify(plan.logs, null, 2)}</div>
          </div>
        </div>
      ` : ''}

      ${plan.error ? `
        <div class="upv-plan-section">
          <h3>Error</h3>
          <div class="upv-error">
            <p>${plan.error}</p>
          </div>
        </div>
      ` : ''}
    `;
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
      this.activeModals.delete(modalId);
    }
  }

  closeAllModals() {
    this.activeModals.forEach((modal, id) => {
      this.closeModal(id);
    });
  }

  closeAllWindows() {
    this.activeWindows.forEach((window, id) => {
      if (!window.closed) {
        window.close();
      }
    });
    this.activeWindows.clear();
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'upv-error';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 100001;
      max-width: 400px;
      padding: 16px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  destroy() {
    this.closeAllModals();
    this.closeAllWindows();
    
    // Restore original window.open
    if (this.originalWindowOpen) {
      window.open = this.originalWindowOpen;
    }
    
    // Remove global elements
    const container = document.getElementById('universal-plan-viewer-container');
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    const styles = document.getElementById('universal-plan-viewer-styles');
    if (styles && styles.parentNode) {
      styles.parentNode.removeChild(styles);
    }
  }
}

// Initialize immediately
window.UniversalPlanViewer = new UniversalPlanViewer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UniversalPlanViewer;
}

console.log('Universal Plan Viewer loaded and ready');
