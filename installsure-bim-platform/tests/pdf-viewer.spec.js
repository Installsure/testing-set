const { test, expect } = require('@playwright/test');

test.describe('PDF Viewer Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('PDF viewer renders pixels when plan is opened', async ({ page }) => {
    // Click on the first plan's PDF view button
    await page.getByRole('button', { name: 'View PDF' }).first().click();
    
    // Wait for PDF canvas to be visible
    await page.waitForSelector('#pdfCanvas', { timeout: 10000 });
    
    // Check that canvas has non-white pixels (indicating content is rendered)
    const pixels = await page.evaluate(() => {
      const canvas = document.getElementById('pdfCanvas');
      if (!canvas) return 0;
      
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      
      let nonWhite = 0;
      for (let i = 0; i < data.length; i += 4 * 5000) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (!(r === 255 && g === 255 && b === 255)) {
          nonWhite++;
          if (nonWhite > 5) break;
        }
      }
      return nonWhite;
    });
    
    expect(pixels).toBeGreaterThan(5);
  });

  test('PDF viewer allows adding tags', async ({ page }) => {
    // Click on the first plan's PDF view button
    await page.getByRole('button', { name: 'View PDF' }).first().click();
    
    // Wait for PDF canvas
    await page.waitForSelector('#pdfCanvas');
    
    // Click on the canvas to add a tag
    await page.locator('#pdfCanvas').click({ position: { x: 200, y: 300 } });
    
    // Check that a tag was added (should appear in SVG overlay)
    await page.waitForSelector('#tagLayer circle', { timeout: 5000 });
    
    const tagCount = await page.locator('#tagLayer circle').count();
    expect(tagCount).toBeGreaterThan(0);
  });

  test('PDF viewer controls work', async ({ page }) => {
    // Click on the first plan's PDF view button
    await page.getByRole('button', { name: 'View PDF' }).first().click();
    
    // Wait for PDF canvas
    await page.waitForSelector('#pdfCanvas');
    
    // Test zoom in
    await page.getByTitle('Zoom In').click();
    
    // Test zoom out
    await page.getByTitle('Zoom Out').click();
    
    // Test reset view
    await page.getByTitle('Reset View').click();
    
    // Verify canvas is still visible
    await expect(page.locator('#pdfCanvas')).toBeVisible();
  });
});
