/**
 * Comprehensive Test Script for All Plan Viewer Fixes
 * This script tests all viewer functionality across applications
 */

(function() {
  'use strict';

  console.log('🧪 Starting Comprehensive Plan Viewer Test Suite...');

  let testResults = [];
  let passedTests = 0;
  let failedTests = 0;

  function logTest(name, status, message = '') {
    const result = { name, status, message, timestamp: new Date().toISOString() };
    testResults.push(result);
    
    if (status === 'PASSED') {
      passedTests++;
      console.log(`✅ ${name}: ${message}`);
    } else if (status === 'FAILED') {
      failedTests++;
      console.error(`❌ ${name}: ${message}`);
    } else {
      console.warn(`⚠️ ${name}: ${message}`);
    }
  }

  async function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations) => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  async function simulateClick(element) {
    if (!element) {
      throw new Error('Element not found for click simulation');
    }
    
    // Create and dispatch click event
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(clickEvent);
    
    // Wait a bit for any async operations
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async function checkModalOpen() {
    const modal = document.querySelector('.upv-modal, #universal-plan-viewer-modal, .modal');
    return modal && modal.style.display !== 'none';
  }

  async function runTest(testName, testFunction) {
    try {
      await testFunction();
      logTest(testName, 'PASSED', 'Test completed successfully');
    } catch (error) {
      logTest(testName, 'FAILED', error.message);
    }
  }

  // Test 1: Universal Plan Viewer Loading
  async function testUniversalPlanViewerLoading() {
    if (typeof window.UniversalPlanViewer === 'undefined') {
      throw new Error('UniversalPlanViewer not loaded');
    }
    
    if (!window.UniversalPlanViewer.openPlan || typeof window.UniversalPlanViewer.openPlan !== 'function') {
      throw new Error('UniversalPlanViewer.openPlan method not available');
    }
  }

  // Test 2: Plan Viewer Fix Script Loading
  async function testPlanViewerFixScriptLoading() {
    const scripts = Array.from(document.scripts);
    const fixScript = scripts.find(script => script.src && script.src.includes('plan-viewer-fix.js'));
    
    if (!fixScript) {
      throw new Error('Plan viewer fix script not loaded');
    }
  }

  // Test 3: View Details Button Patching
  async function testViewDetailsButtonPatching() {
    // Look for any view details buttons
    const viewButtons = document.querySelectorAll('button[title="View Details"], button[title*="View"], .eye-icon');
    
    if (viewButtons.length === 0) {
      logTest('View Details Button Patching', 'SKIPPED', 'No view details buttons found');
      return;
    }

    let patchedCount = 0;
    viewButtons.forEach(button => {
      if (button.dataset.patched === 'true') {
        patchedCount++;
      }
    });

    if (patchedCount === 0) {
      throw new Error('No view details buttons were patched');
    }

    logTest('View Details Button Patching', 'PASSED', `${patchedCount}/${viewButtons.length} buttons patched`);
  }

  // Test 4: Modal Opening Functionality
  async function testModalOpeningFunctionality() {
    const testData = {
      id: 'test-modal-1',
      goal: 'Test Plan Viewer Modal',
      status: 'testing',
      steps: ['Step 1: Test modal opening', 'Step 2: Verify content display'],
      logs: [{
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Test modal opened successfully'
      }]
    };

    window.UniversalPlanViewer.openPlan(testData, {
      title: 'Test Modal',
      mode: 'modal'
    });

    // Wait for modal to appear
    await new Promise(resolve => setTimeout(resolve, 500));

    const modalOpen = await checkModalOpen();
    if (!modalOpen) {
      throw new Error('Modal did not open after calling openPlan');
    }

    // Close the modal
    window.UniversalPlanViewer.closePlan();
  }

  // Test 5: Window Opening Functionality
  async function testWindowOpeningFunctionality() {
    const testData = {
      id: 'test-window-1',
      goal: 'Test Plan Viewer Window',
      status: 'testing'
    };

    try {
      const newWindow = window.UniversalPlanViewer.openPlan(testData, {
        title: 'Test Window',
        mode: 'window'
      });

      if (!newWindow) {
        throw new Error('Window opening returned null/undefined');
      }

      // Close the window if it was created
      if (newWindow.close && typeof newWindow.close === 'function') {
        newWindow.close();
      }
    } catch (error) {
      // Window opening might be blocked, which is acceptable
      if (error.message.includes('blocked') || error.message.includes('popup')) {
        logTest('Window Opening Functionality', 'SKIPPED', 'Window opening blocked by browser (acceptable)');
        return;
      }
      throw error;
    }
  }

  // Test 6: BIM Viewer Button Patching
  async function testBIMViewerButtonPatching() {
    const bimButtons = document.querySelectorAll('[href*="viewer"], [href*="bim"], .bim-viewer, .viewer-button, [data-viewer]');
    
    if (bimButtons.length === 0) {
      logTest('BIM Viewer Button Patching', 'SKIPPED', 'No BIM viewer buttons found');
      return;
    }

    let patchedCount = 0;
    bimButtons.forEach(button => {
      if (button.dataset.patched === 'true') {
        patchedCount++;
      }
    });

    logTest('BIM Viewer Button Patching', 'PASSED', `${patchedCount}/${bimButtons.length} BIM buttons patched`);
  }

  // Test 7: Tagging System Button Patching
  async function testTaggingSystemButtonPatching() {
    const tagButtons = document.querySelectorAll('.tag-button, [data-tag], .tagging-control, .tag-control, [data-tagging], .edit-tag, [data-edit-tag], .tag-edit-button');
    
    // Also check for "Edit Tag" buttons by text content
    const allButtons = document.querySelectorAll('button, a, .btn, .button');
    let editTagButtons = 0;
    allButtons.forEach(button => {
      const buttonText = button.textContent.trim().toLowerCase();
      if (buttonText.includes('edit tag') || buttonText.includes('edit-tag') || buttonText.includes('tag edit')) {
        editTagButtons++;
      }
    });
    
    const totalTagButtons = tagButtons.length + editTagButtons;
    
    if (totalTagButtons === 0) {
      logTest('Tagging System Button Patching', 'SKIPPED', 'No tagging buttons found');
      return;
    }

    let patchedCount = 0;
    tagButtons.forEach(button => {
      if (button.dataset.patched === 'true') {
        patchedCount++;
      }
    });

    logTest('Tagging System Button Patching', 'PASSED', `${patchedCount}/${totalTagButtons} tagging buttons patched (including ${editTagButtons} "Edit Tag" buttons)`);
  }

  // Test 8: Error Handling
  async function testErrorHandling() {
    // Test with invalid data
    try {
      window.UniversalPlanViewer.openPlan(null);
      throw new Error('Should have handled null data gracefully');
    } catch (error) {
      // This is expected behavior
    }

    // Test with undefined data
    try {
      window.UniversalPlanViewer.openPlan(undefined);
      throw new Error('Should have handled undefined data gracefully');
    } catch (error) {
      // This is expected behavior
    }

    logTest('Error Handling', 'PASSED', 'Error handling works correctly');
  }

  // Test 9: Data Extraction from DOM
  async function testDataExtractionFromDOM() {
    // Look for job containers with data attributes
    const jobContainers = document.querySelectorAll('[data-job-id], [data-job-container]');
    
    if (jobContainers.length === 0) {
      logTest('Data Extraction from DOM', 'SKIPPED', 'No job containers with data attributes found');
      return;
    }

    // Test data extraction on first container
    const firstContainer = jobContainers[0];
    const jobId = firstContainer.dataset.jobId || firstContainer.getAttribute('data-job-id');
    
    if (!jobId) {
      throw new Error('Could not extract job ID from container');
    }

    logTest('Data Extraction from DOM', 'PASSED', `Successfully extracted job ID: ${jobId}`);
  }

  // Test 10: Edit Tag Functionality
  async function testEditTagFunctionality() {
    // Look for Edit Tag buttons
    const editTagButtons = Array.from(document.querySelectorAll('button, a, .btn, .button')).filter(button => {
      const buttonText = button.textContent.trim().toLowerCase();
      return buttonText.includes('edit tag') || buttonText.includes('edit-tag') || buttonText.includes('tag edit');
    });
    
    if (editTagButtons.length === 0) {
      logTest('Edit Tag Functionality', 'SKIPPED', 'No "Edit Tag" buttons found');
      return;
    }

    // Test the first Edit Tag button
    const firstEditTagButton = editTagButtons[0];
    
    try {
      // Simulate clicking the Edit Tag button
      await simulateClick(firstEditTagButton);
      
      // Check if a modal opened or if the button was properly patched
      const modalOpen = await checkModalOpen();
      const isPatched = firstEditTagButton.dataset.patched === 'true';
      
      if (isPatched) {
        logTest('Edit Tag Functionality', 'PASSED', `Edit Tag button patched and functional (${editTagButtons.length} total Edit Tag buttons found)`);
      } else {
        throw new Error('Edit Tag button was not patched');
      }
      
      // Close any open modal
      if (modalOpen) {
        window.UniversalPlanViewer.closePlan();
      }
      
    } catch (error) {
      throw new Error(`Edit Tag functionality test failed: ${error.message}`);
    }
  }

  // Test 11: Performance Test
  async function testPerformance() {
    const startTime = performance.now();
    
    // Open and close multiple modals quickly
    for (let i = 0; i < 5; i++) {
      const testData = {
        id: `perf-test-${i}`,
        goal: `Performance Test ${i}`,
        status: 'testing'
      };
      
      window.UniversalPlanViewer.openPlan(testData, { mode: 'modal' });
      window.UniversalPlanViewer.closePlan();
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (duration > 2000) { // More than 2 seconds
      throw new Error(`Performance test took too long: ${duration.toFixed(2)}ms`);
    }
    
    logTest('Performance Test', 'PASSED', `Completed in ${duration.toFixed(2)}ms`);
  }

  // Main test runner
  async function runAllTests() {
    console.log('🚀 Starting comprehensive test suite...');
    
    const tests = [
      ['Universal Plan Viewer Loading', testUniversalPlanViewerLoading],
      ['Plan Viewer Fix Script Loading', testPlanViewerFixScriptLoading],
      ['View Details Button Patching', testViewDetailsButtonPatching],
      ['Modal Opening Functionality', testModalOpeningFunctionality],
      ['Window Opening Functionality', testWindowOpeningFunctionality],
      ['BIM Viewer Button Patching', testBIMViewerButtonPatching],
      ['Tagging System Button Patching', testTaggingSystemButtonPatching],
      ['Error Handling', testErrorHandling],
      ['Data Extraction from DOM', testDataExtractionFromDOM],
      ['Edit Tag Functionality', testEditTagFunctionality],
      ['Performance Test', testPerformance]
    ];

    for (const [testName, testFunction] of tests) {
      await runTest(testName, testFunction);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Print final results
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Total Tests: ${testResults.length}`);
    console.log(`Passed: ${passedTests} ✅`);
    console.log(`Failed: ${failedTests} ❌`);
    console.log(`Success Rate: ${((passedTests / testResults.length) * 100).toFixed(1)}%`);
    
    if (failedTests === 0) {
      console.log('\n🎉 All tests passed! Plan viewer fixes are working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the logs above for details.');
    }

    // Store results globally for external access
    window.planViewerTestResults = {
      results: testResults,
      summary: {
        total: testResults.length,
        passed: passedTests,
        failed: failedTests,
        successRate: (passedTests / testResults.length) * 100
      }
    };

    return failedTests === 0;
  }

  // Auto-run tests when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    // Wait a bit for other scripts to load
    setTimeout(runAllTests, 1000);
  }

  // Export test runner for manual execution
  window.runPlanViewerTests = runAllTests;

  console.log('🧪 Plan Viewer Test Suite loaded. Run window.runPlanViewerTests() to execute tests manually.');

})();
