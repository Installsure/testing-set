const { test, expect } = require('@playwright/test');

test.describe('IFC 3D Viewer Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('IFC viewer loads a 3D scene', async ({ page }) => {
    // Click on the first plan's 3D view button
    await page.getByRole('button', { name: 'View in 3D' }).first().click();
    
    // Wait for 3D container to be visible
    await page.waitForSelector('.mock-3d-scene', { timeout: 10000 });
    
    // Check that the global flag is set (indicating model loaded)
    const loaded = await page.evaluate(() => window.__ifcModelLoaded === true);
    expect(loaded).toBeTruthy();
    
    // Verify 3D elements are present
    const elementCount = await page.locator('.bim-element').count();
    expect(elementCount).toBeGreaterThan(0);
  });

  test('IFC viewer allows element selection', async ({ page }) => {
    // Click on the first plan's 3D view button
    await page.getByRole('button', { name: 'View in 3D' }).first().click();
    
    // Wait for 3D container
    await page.waitForSelector('.mock-3d-scene');
    
    // Click on a 3D element
    await page.locator('.bim-element').first().click();
    
    // Check that element selection info appears
    await page.waitForSelector('text=Selected Element', { timeout: 5000 });
    
    // Verify selection details are shown
    await expect(page.locator('text=ID: element-0')).toBeVisible();
  });

  test('IFC viewer controls work', async ({ page }) => {
    // Click on the first plan's 3D view button
    await page.getByRole('button', { name: 'View in 3D' }).first().click();
    
    // Wait for 3D container
    await page.waitForSelector('.mock-3d-scene');
    
    // Test zoom in
    await page.getByTitle('Zoom In').click();
    
    // Test zoom out
    await page.getByTitle('Zoom Out').click();
    
    // Test reset view
    await page.getByTitle('Reset View').click();
    
    // Test measurement mode
    await page.getByTitle('Measure').click();
    
    // Verify 3D scene is still visible
    await expect(page.locator('.mock-3d-scene')).toBeVisible();
  });

  test('IFC viewer layer controls work', async ({ page }) => {
    // Click on the first plan's 3D view button
    await page.getByRole('button', { name: 'View in 3D' }).first().click();
    
    // Wait for 3D container
    await page.waitForSelector('.mock-3d-scene');
    
    // Test layer toggles
    await page.locator('input[type="checkbox"]').first().click();
    
    // Verify layer controls are present
    await expect(page.locator('text=architectural')).toBeVisible();
    await expect(page.locator('text=structural')).toBeVisible();
    await expect(page.locator('text=mep')).toBeVisible();
    await expect(page.locator('text=site')).toBeVisible();
  });
});
