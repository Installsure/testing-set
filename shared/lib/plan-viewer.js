/**
 * Universal Plan Viewer Component
 * Handles opening plans in windows/modals across all InstallSure applications
 */

class PlanViewer {
  constructor() {
    this.activeWindows = new Map();
    this.modalContainer = null;
    this.init();
  }

  init() {
    // Create modal container if it doesn't exist
    if (!document.getElementById('plan-viewer-container')) {
      this.createModalContainer();
    }
  }

  createModalContainer() {
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'plan-viewer-container';
    this.modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.modalContainer);
  }

  /**
   * Open a plan in a new window or modal
   * @param {Object} plan - Plan data to display
   * @param {Object} options - Display options
   */
  openPlan(plan, options = {}) {
    const {
      mode = 'modal', // 'modal' or 'window'
      width = 800,
      height = 600,
      title = 'Plan Viewer'
    } = options;

    if (mode === 'window') {
      return this.openInNewWindow(plan, { width, height, title });
    } else {
      return this.openInModal(plan, { width, height, title });
    }
  }

  /**
   * Open plan in a new browser window
   */
  openInNewWindow(plan, options) {
    const { width, height, title } = options;
    
    try {
      // Create window features
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

      // Open new window
      const newWindow = window.open('', `plan-${plan.id}`, features);
      
      if (!newWindow) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }

      // Write content to new window
      newWindow.document.write(this.generateWindowContent(plan, title));
      newWindow.document.close();
      
      // Focus the new window
      newWindow.focus();
      
      // Store reference
      this.activeWindows.set(plan.id, newWindow);
      
      // Clean up when window is closed
      newWindow.addEventListener('beforeunload', () => {
        this.activeWindows.delete(plan.id);
      });

      return newWindow;
    } catch (error) {
      console.error('Failed to open window:', error);
      // Fallback to modal
      return this.openInModal(plan, options);
    }
  }

  /**
   * Open plan in a modal overlay
   */
  openInModal(plan, options) {
    const { width, height, title } = options;
    const modalId = `plan-modal-${plan.id}`;
    
    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal element
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      pointer-events: auto;
    `;

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      width: ${width}px;
      height: ${height}px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    // Create modal header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f9fafb;
    `;

    const headerTitle = document.createElement('h2');
    headerTitle.textContent = title;
    headerTitle.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #6b7280;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    closeButton.addEventListener('click', () => {
      this.closeModal(modalId);
    });

    header.appendChild(headerTitle);
    header.appendChild(closeButton);

    // Create modal body
    const body = document.createElement('div');
    body.style.cssText = `
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    `;
    body.innerHTML = this.generatePlanContent(plan);

    // Assemble modal
    modalContent.appendChild(header);
    modalContent.appendChild(body);
    modal.appendChild(modalContent);

    // Add click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modalId);
      }
    });

    // Add escape key to close
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(modalId);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // Add to DOM
    this.modalContainer.appendChild(modal);

    return modal;
  }

  /**
   * Generate content for new window
   */
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
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: #f3f4f6;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          .content {
            padding: 20px;
          }
          .plan-section {
            margin-bottom: 24px;
          }
          .plan-section h3 {
            color: #374151;
            margin-bottom: 12px;
            font-size: 16px;
            font-weight: 600;
          }
          .plan-details {
            background: #f9fafb;
            padding: 16px;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
          }
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }
          .status-completed { background: #dcfce7; color: #166534; }
          .status-running { background: #fef3c7; color: #92400e; }
          .status-failed { background: #fee2e2; color: #991b1b; }
          .status-pending { background: #e5e7eb; color: #374151; }
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

  /**
   * Generate plan content HTML
   */
  generatePlanContent(plan) {
    if (!plan) {
      return '<p>No plan data available.</p>';
    }

    return `
      <div class="plan-section">
        <h3>Plan Details</h3>
        <div class="plan-details">
          <p><strong>ID:</strong> ${plan.id || 'N/A'}</p>
          <p><strong>Goal:</strong> ${plan.goal || plan.plan_goal || 'N/A'}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${(plan.status || 'pending').toLowerCase()}">${plan.status || 'Pending'}</span></p>
          ${plan.created_at ? `<p><strong>Created:</strong> ${new Date(plan.created_at).toLocaleString()}</p>` : ''}
          ${plan.updated_at ? `<p><strong>Updated:</strong> ${new Date(plan.updated_at).toLocaleString()}</p>` : ''}
        </div>
      </div>

      ${plan.steps && plan.steps.length > 0 ? `
        <div class="plan-section">
          <h3>Execution Steps</h3>
          <div class="plan-details">
            <ol>
              ${plan.steps.map(step => `<li>${step}</li>`).join('')}
            </ol>
          </div>
        </div>
      ` : ''}

      ${plan.requires_approval !== undefined ? `
        <div class="plan-section">
          <h3>Approval</h3>
          <div class="plan-details">
            <p><strong>Requires Approval:</strong> ${plan.requires_approval ? 'Yes' : 'No'}</p>
          </div>
        </div>
      ` : ''}

      ${plan.results ? `
        <div class="plan-section">
          <h3>Results</h3>
          <div class="plan-details">
            <pre style="white-space: pre-wrap; font-family: monospace; background: #f3f4f6; padding: 12px; border-radius: 4px;">${JSON.stringify(plan.results, null, 2)}</pre>
          </div>
        </div>
      ` : ''}

      ${plan.error ? `
        <div class="plan-section">
          <h3>Error</h3>
          <div class="plan-details" style="border-left-color: #ef4444;">
            <p style="color: #dc2626;">${plan.error}</p>
          </div>
        </div>
      ` : ''}
    `;
  }

  /**
   * Close modal by ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Close all open modals
   */
  closeAllModals() {
    const modals = this.modalContainer.querySelectorAll('[id^="plan-modal-"]');
    modals.forEach(modal => modal.remove());
  }

  /**
   * Close all open windows
   */
  closeAllWindows() {
    this.activeWindows.forEach(window => {
      if (!window.closed) {
        window.close();
      }
    });
    this.activeWindows.clear();
  }

  /**
   * Clean up all resources
   */
  destroy() {
    this.closeAllModals();
    this.closeAllWindows();
    if (this.modalContainer && this.modalContainer.parentNode) {
      this.modalContainer.parentNode.removeChild(this.modalContainer);
    }
  }
}

// Global instance
window.PlanViewer = new PlanViewer();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PlanViewer;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.PlanViewer = new PlanViewer();
  });
}
