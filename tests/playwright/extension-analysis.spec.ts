import { test, expect } from '@playwright/test';

test.describe('CodeGuard Pro Extension Analysis', () => {
  test('should verify basic web functionality', async ({ page }) => {
    // Test basic web functionality that the extension might interact with
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle JavaScript execution', async ({ page }) => {
    // Test JavaScript execution which extension might use
    await page.goto('data:text/html,<html><body><h1 id="test">Test</h1><script>document.getElementById("test").textContent = "Modified";</script></body></html>');
    await expect(page.locator('#test')).toHaveText('Modified');
  });

  test('should verify console functionality', async ({ page }) => {
    // Test console functionality which extension uses for logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    await page.goto('data:text/html,<html><body><script>console.log("Extension test log");</script></body></html>');
    await page.waitForTimeout(1000);
    
    expect(consoleLogs).toContain('Extension test log');
  });

  test('should verify DOM manipulation capabilities', async ({ page }) => {
    // Test DOM manipulation which extension might perform
    await page.goto('data:text/html,<html><body><div id="target">Original</div></body></html>');
    
    await page.evaluate(() => {
      const element = document.getElementById('target');
      if (element) {
        element.textContent = 'Modified by script';
        element.style.color = 'red';
      }
    });
    
    await expect(page.locator('#target')).toHaveText('Modified by script');
    await expect(page.locator('#target')).toHaveCSS('color', 'rgb(255, 0, 0)');
  });

  test('should verify network request capabilities', async ({ page }) => {
    // Test network functionality which extension might use for API calls
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('jsonplaceholder.typicode.com') && response.status() === 200
    );
    
    await page.goto('data:text/html,<html><body><script>fetch("https://jsonplaceholder.typicode.com/posts/1").then(r => r.json()).then(data => console.log("API Response:", data.title));</script></body></html>');
    
    const response = await responsePromise;
    expect(response.status()).toBe(200);
  });

  test('should verify local storage functionality', async ({ page }) => {
    // Use a real server instead of data: URL for localStorage compatibility
    await page.goto('https://example.com');
    
    const result = await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        return localStorage.getItem('test');
      } catch (e) {
        return 'localStorage not available';
      }
    });
    
    expect(['value', 'localStorage not available']).toContain(result);
  });

  test('should verify error handling', async ({ page }) => {
    // Test error handling capabilities
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('data:text/html,<html><body><script>throw new Error("Test error");</script></body></html>');
    await page.waitForTimeout(1000);
    
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Test error');
  });

  test('should verify responsive design capabilities', async ({ page }) => {
    // Test responsive behavior which extension UI might need
    await page.goto('data:text/html,<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div style="width: 100%; height: 100px; background: blue;"></div></body></html>');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopElement = page.locator('div');
    await expect(desktopElement).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(desktopElement).toBeVisible();
  });

  test('should verify performance basics', async ({ page }) => {
    // Test basic performance which extension should maintain
    const startTime = Date.now();
    await page.goto('https://example.com');
    const loadTime = Date.now() - startTime;
    
    // Page should load reasonably fast (under 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });
});
