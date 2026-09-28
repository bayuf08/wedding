import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { expect, test } from '@playwright/test'
import { referenceCheckpoints } from '../fixtures/reference-states'

test.use({ viewport: { width: 1680, height: 939 }, deviceScaleFactor: 2 })

test('captures calibrated opening and scene checkpoints', async ({ page }) => {
  test.setTimeout(180_000)
  const directory = path.resolve('tests/visual/candidates')
  await mkdir(directory, { recursive: true })
  await page.goto('/invite/demo?to=Guest+Name')
  await expect(page.getByRole('button', { name: "Let's Open" })).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: path.join(directory, 'cover.png') })

  await page.getByRole('button', { name: "Let's Open" }).click()
  await expect(page.locator('.opening-cover')).toHaveCount(0)
  await expect(page.locator('.hero-scripture')).toHaveCSS('opacity', '1')
  await page.screenshot({ path: path.join(directory, 'hero.png') })

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('button', { name: 'RSVP', exact: true }).click()
  await expect(page.locator('#rsvp')).toBeFocused()
  await expect.poll(() => page.locator('#rsvp').evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(2)
  await page.evaluate(offset => window.scrollBy({ top: offset, behavior: 'instant' }), referenceCheckpoints[2].relativeScroll)
  await expect(page.locator('.rsvp-image')).toHaveCSS('opacity', '1')
  await page.screenshot({ path: path.join(directory, 'rsvp.png') })

  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('button', { name: 'Gallery', exact: true }).click()
  await expect(page.locator('#gallery')).toBeFocused()
  await expect.poll(() => page.locator('#gallery').evaluate(element => Math.abs(element.getBoundingClientRect().top))).toBeLessThan(2)
  await page.evaluate(offset => window.scrollBy({ top: offset, behavior: 'instant' }), referenceCheckpoints[3].relativeScroll)
  await expect(page.locator('.gallery-title')).toHaveCSS('opacity', '1')
  await page.screenshot({ path: path.join(directory, 'gallery.png') })
})

test('captures a desktop survey of every major scene', async ({ page }) => {
  test.setTimeout(180_000)
  const directory = path.resolve('tests/visual/candidates/survey')
  await mkdir(directory, { recursive: true })
  await page.goto('/invite/demo?to=Guest+Name')
  await page.getByRole('button', { name: "Let's Open" }).click()
  await expect(page.locator('.opening-cover')).toHaveCount(0)
  await page.evaluate(() => document.fonts.ready)
  const scenes = [
    ['quote', '.quote-passage', 250],
    ['bride', '.profiles-section', 240],
    ['groom', '.profile-scene:nth-child(2)', 240],
    ['story', '.story-introduction', 170],
    ['chapters', '.story-chapters', 0],
    ['celebration', '.celebration-section', 0],
    ['details', '.event-details', 0],
    ['gift', '.gift-introduction', 0],
    ['wishes', '.wishes-section', 0],
    ['film', '.video-feature', 0],
    ['closing', '.closing-section', 0],
  ] as const
  const selectedScenes = scenes.filter(([name]) => !process.env.SURVEY_SCENE || process.env.SURVEY_SCENE === name)
  expect(selectedScenes.length).toBeGreaterThan(0)
  for (const [name, selector, offset] of selectedScenes) {
    await expect(page.locator(selector)).toHaveCount(1)
    await page.evaluate(({ selector, offset }) => {
      const element = document.querySelector(selector)
      if (element) window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top + offset, behavior: 'instant' })
    }, { selector, offset })
    await page.waitForTimeout(1250)
    await page.screenshot({ path: path.join(directory, `${name}.png`), scale: 'css' })
    if (name === 'bride' || name === 'closing') await page.screenshot({ path: path.join(directory, `${name}-full.png`) })
  }
})
