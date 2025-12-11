import { test, expect } from '@playwright/test';

test('login admin real usando backend NestJS', async ({ page }) => {
  // Ir a login
  await page.goto('http://localhost:5173/login');

  // Completar usuario
  await page.fill('input[type="text"]', 'admin');

  // Completar password
  await page.fill('input[type="password"]', 'adminadmin');

  // Click en login
  await page.click('button[type="submit"]');

  // Esperar navegación real
  await page.waitForURL('http://localhost:5173/dashboard');

  // Validar que la pantalla cargó
  await expect(page.locator('text=Mis proyectos')).toBeVisible();
});

test('login persona voluntaria', async ({ page }) => {
  // Ir a login
  await page.goto('http://localhost:5173/login');

  // Completar usuario
  await page.fill('input[type="text"]', 'test');

  // Completar password
  await page.fill('input[type="password"]', 'test');

  // Click en login
  await page.click('button[type="submit"]');

  // Esperar navegación a la home
  await page.waitForURL('http://localhost:5173/dashboard');

  // Validar que el título de la sección de proyectos está visible
  await expect(page.locator('h2:has-text("Proyectos")')).toBeVisible();
});
