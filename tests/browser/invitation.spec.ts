import { expect, test } from '@playwright/test'
import { invitationFixture } from '../../app/data/invitation.fixture'
const galleryCount = invitationFixture.content.gallery.imageIds.length

test('opens the invitation with the supplied static hero image', async ({ page }) => {
  await page.goto('/invite/demo?to=Guest+Name')
  await expect(page.getByRole('button', { name: "Let's Open" })).toBeVisible({ timeout: 10_000 })
  await expect(page.getByText('Guest Name', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: "Let's Open" }).click()
  await expect(page.locator('.opening-cover')).toHaveCount(0)
  await expect(page.locator('main')).not.toHaveAttribute('inert')
  await expect(page.locator('.hero-video')).toHaveCount(0)
  await expect(page.locator('.hero-media--base img')).toHaveAttribute('src', '/images/kv.png')
  await expect(page.locator('.hero-media--foreground img')).toHaveAttribute('src', '/images/kv-transparent.png')
})

test('keeps RSVP, gift, wishes, and gallery interactions local', async ({ page }) => {
  await page.route('https://www.youtube.com/**', route => route.abort())
  await page.goto('/invite/demo?to=Guest+Name')
  await expect(page.locator('.invitation-experience')).toHaveAttribute('data-enhanced', 'true')
  await page.getByRole('button', { name: "Let's Open" }).click()
  await expect(page.locator('.opening-cover')).toHaveCount(0)
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await page.getByRole('button', { name: 'RSVP', exact: true }).click()
  await expect(page.locator('#rsvp')).toBeFocused()
  await page.getByRole('button', { name: 'Review RSVP' }).click()
  await expect(page.locator('#rsvp-attendanceCount-error')).toBeVisible()
  await page.locator('#rsvp-attendanceCount').fill('2')
  await page.getByRole('button', { name: 'Review RSVP' }).click()
  await expect(page.locator('.rsvp-form .form-status')).toContainText('Nothing has been sent or saved')

  await page.getByRole('button', { name: 'Next »' }).click()
  await expect(page.locator('#wishes-title').locator('..')).toContainText('Page 2 of 2')

  await expect(page.locator('#gift .bank-number')).toHaveCount(3)
  await expect(page.locator('#gift .bank-number').first()).toBeVisible()
  await page.getByRole('button', { name: 'Confirm Gift', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Wedding gift' })).toBeVisible()
  await page.getByRole('button', { name: 'Review Gift Confirmation', exact: true }).click()
  await expect(page.locator('.gift-form-panel .field-error')).toHaveCount(3)
  await page.locator('#gift-name').fill('Alex')
  await page.locator('#gift-bank').check()
  await page.locator('#gift-amount').fill('50000')
  await page.getByRole('button', { name: 'Review Gift Confirmation', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Wedding gift' })).toContainText('Gift details checked on this page')
  await page.getByRole('button', { name: 'Close gift panel' }).click()

  const firstPhoto = page.getByRole('button', { name: new RegExp(`Open photo 1 of ${galleryCount}:`) })
  await firstPhoto.click()
  await expect(page.getByRole('dialog', { name: 'Photo gallery' })).toContainText(`1 / ${galleryCount}`)
  await page.getByRole('button', { name: 'Next photo' }).click()
  await expect(page.getByRole('dialog', { name: 'Photo gallery' })).toContainText(`2 / ${galleryCount}`)
  await page.keyboard.press('Escape')
  await expect(firstPhoto).toBeFocused()

  const calendarDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Add to Calendar' }).click()
  expect((await calendarDownload).suggestedFilename()).toBe('bayu-hilwa-wedding.ics')
  await page.locator('.video-frame').hover({ position: { x: 110, y: 110 } })
  await expect(page.locator('.video-pointer')).toHaveClass(/is-visible/)
  await page.getByRole('button', { name: 'PLAY', exact: true }).click()
  await expect(page.locator('.video-feature iframe')).toHaveAttribute('src', /youtube\.com\/embed\/BNQj5Muhss4/)
})

test('preserves route boundaries and responsive width', async ({ page }) => {
  await page.goto('/?to=Guest+Name')
  expect(new URL(page.url()).searchParams.get('to')).toBe('Guest Name')
  await expect(page).toHaveURL(/\/invite\/demo/)
  await page.goto('/invite/protected')
  await expect(page.locator('body')).not.toContainText('Jl. Taman Palem Lestari Barat')
  await page.goto('/invite/unavailable')
  await expect(page.locator('body')).not.toContainText('Jl. Taman Palem Lestari Barat')
  await page.goto('/invite/demo?qa=static')
  for (const [width, height] of [[320, 720], [390, 844], [767, 900], [768, 1024], [1024, 768], [1025, 768], [1680, 939]] as const) {
    await page.setViewportSize({ width, height })
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `overflow at ${width}px`).toBeLessThanOrEqual(width)
  }
})

test('reverses the portrait aperture and settles it for reduced motion', async ({ page }) => {
  await page.goto('/invite/demo?to=Guest+Name')
  await page.getByRole('button', { name: "Let's Open" }).click()
  await expect(page.locator('.opening-cover')).toHaveCount(0)
  const portrait = page.locator('.profile-portrait').first()
  await portrait.evaluate(element => window.scrollTo({ top: window.scrollY + element.getBoundingClientRect().top - 417, behavior: 'instant' }))
  const inset = () => portrait.evaluate(element => Number(element.style.clipPath.match(/inset\(([\d.]+)%/)?.[1] || 0))
  await expect.poll(inset).toBeGreaterThan(4)
  await expect.poll(inset).toBeLessThan(4.5)
  await expect(portrait.locator('img')).toHaveAttribute('style', /translateY\(-7[56]/)

  await page.evaluate(() => window.scrollBy({ top: -188, behavior: 'instant' }))
  await expect.poll(inset).toBeGreaterThan(10)
  await expect.poll(inset).toBeLessThan(10.5)

  const story = page.locator('.story-intro-frame')
  await story.evaluate(element => element.scrollIntoView({ behavior: 'instant', block: 'center' }))
  const initialStoryImage = await story.locator('.story-slide img').last().getAttribute('src')
  await expect.poll(() => story.locator('.story-slide img').last().getAttribute('src'), { timeout: 9_000 }).not.toBe(initialStoryImage)
  await expect(story.locator('.story-slide img').last()).toBeVisible()

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect.poll(() => portrait.evaluate(element => element.style.clipPath)).toBe('none')
  await expect.poll(() => portrait.locator('img').evaluate(element => (element as HTMLElement).style.transform)).toBe('')
  await page.goto('/invite/demo?to=Guest+Name')
  await expect(page.getByRole('button', { name: "Let's Open" })).toBeVisible({ timeout: 1_500 })
})

test('shows gift accounts immediately and supports copying on desktop and mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async (value: string) => { (window as any).__copiedGiftAccount = value },
    } })
  })
  for (const width of [1680, 390, 320]) {
    await page.setViewportSize({ width, height: 939 })
    await page.goto('/invite/demo?to=Guest+Name')
    await page.getByRole('button', { name: "Let's Open" }).click()
    await expect(page.locator('.opening-cover')).toHaveCount(0)
    await expect(page.locator('main')).not.toHaveAttribute('inert')
    const gift = page.locator('#gift')
    await gift.scrollIntoViewIfNeeded()
    await expect(gift.locator('.bank-number')).toHaveCount(3)
    await expect(page.getByRole('dialog', { name: 'Wedding gift' })).toHaveCount(0)
    const copyButton = gift.getByRole('button', { name: /Copy .* account number/ }).first()
    await copyButton.focus()
    await page.keyboard.press('Enter')
    await expect(gift.getByRole('status')).toHaveText('Copied')
    expect(await page.evaluate(() => (window as any).__copiedGiftAccount === document.querySelector('#gift .bank-number')?.textContent)).toBe(true)
    expect(await gift.evaluate(element => [...element.querySelectorAll('.bank-row')].every(row => {
      const bounds = row.getBoundingClientRect()
      return bounds.left >= 0 && bounds.right <= window.innerWidth && row.scrollWidth <= row.clientWidth
    }))).toBe(true)
    await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Unavailable') } })
    await copyButton.click()
    await expect(gift.getByRole('status')).toContainText('Select the account number')
    await gift.getByRole('button', { name: 'Confirm Gift', exact: true }).click()
    await expect(page.getByRole('dialog', { name: 'Wedding gift' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(gift.getByRole('button', { name: 'Confirm Gift', exact: true })).toBeFocused()
    if (width !== 320) {
      await gift.screenshot({ path: `/tmp/wedding-gift-${width}.png`, mask: [gift.locator('.bank-number')] })
    }
  }
})
