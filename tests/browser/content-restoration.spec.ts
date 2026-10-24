import { expect, test } from '@playwright/test'

test('renders the recovered story and supplied groom/gallery photos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const width of [390, 1680]) {
    await page.setViewportSize({ width, height: 939 })
    await page.goto('/invite/demo?to=Guest+Name')
    await page.getByRole('button', { name: "Let's Open" }).click()
    await expect(page.locator('.opening-cover')).toHaveCount(0)
    const groom = page.locator('.profile-scene').nth(1)
    await groom.scrollIntoViewIfNeeded()
    await expect(groom.locator('img')).toHaveAttribute('src', '/images/the-groom.jpg')
    await expect(groom.locator('img')).toHaveCSS('object-position', '100% 50%')
    await groom.screenshot({ path: `/tmp/wedding-restored-groom-final-${width}.png` })
    await expect.poll(() => groom.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const story = page.locator('.story-chapters')
    await expect(story.locator('.story-chapter')).toHaveCount(2)
    await expect(story).toContainText('The Neighbourhood Jakarta')
    await expect(story).toContainText('Pasuruan to Bekasi')
    await expect(story).not.toContainText('Tokyo')
    await expect(page.getByRole('heading', { name: 'Our Little Adventures.', exact: true })).toHaveCount(1)
    const photos = page.locator('.gallery-photo-list .gallery-photo')
    await expect(photos).toHaveCount(5)
    await photos.first().scrollIntoViewIfNeeded()
    await expect(photos.first().locator('img')).toHaveAttribute('src', '/images/adventures/adventure-1.jpg')
    await expect.poll(() => photos.first().locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  }
})
