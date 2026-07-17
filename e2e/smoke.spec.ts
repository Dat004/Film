import { test, expect } from '@playwright/test';

test.describe('smoke', () => {
  test('home → xem phim (player hiện)', async ({ page }) => {
    await page.goto('/');

    const filmCard = page.getByTestId('film-card').first();
    await expect(filmCard).toBeVisible({ timeout: 45_000 });

    const slug = await filmCard.getAttribute('data-slug');
    expect(slug).toBeTruthy();

    await filmCard.click();

    await expect(page).toHaveURL(new RegExp(`/phim/${slug}`), { timeout: 30_000 });
    await expect(page.getByTestId('film-detail')).toBeVisible();
    await expect(page.getByTestId('player')).toBeVisible();
  });

  test('vào phòng (watch-party) khi chưa login → về home', async ({ page }) => {
    await page.goto('/watch-party');

    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
    await expect(page.getByTestId('watch-party-lobby')).toHaveCount(0);
  });

  test('deep-link phòng khi chưa login → về home', async ({ page }) => {
    await page.goto('/watch-party/smoke-room-id');

    await expect(page).toHaveURL(/\/$/, { timeout: 30_000 });
  });
});
