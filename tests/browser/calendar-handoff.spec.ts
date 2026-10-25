import { expect, test } from '@playwright/test'

for (const platform of ['android', 'desktop', 'ios'] as const) {
  test(`${platform} calendar uses a single explicit handoff and preserves the invitation`, async ({ browser }) => {
    const context = await browser.newContext({
      viewport: platform === 'desktop' ? { width: 1440, height: 900 } : { width: 390, height: 844 },
      userAgent: platform === 'android' ? 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36' : platform === 'ios' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1' : undefined,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    await page.goto('/invite/demo?qa=static')
    await page.getByRole('button', { name: "Let's Open" }).click()
    await expect(page.locator('.opening-cover')).toHaveCount(0)
    const action = page.locator('.calendar-button')
    await action.scrollIntoViewIfNeeded()
    await expect(action).toHaveAttribute('href', platform === 'android' ? /^intent:\/\/calendar.google.com/ : /^https:\/\/calendar.google.com/)
    await page.evaluate(() => {
      const anchor = document.querySelector<HTMLAnchorElement>('.calendar-button')!
      anchor.addEventListener('click', event => { event.preventDefault(); anchor.dataset.activations = String(Number(anchor.dataset.activations || 0) + 1) })
    })
    await action.focus()
    await page.keyboard.press('Enter')
    await expect(action).toHaveAttribute('data-activations', '1')
    await expect(page).toHaveURL(/\/invite\/demo/)
    if (platform === 'android') {
      await page.getByText('Calendar did not open the event?', { exact: true }).click()
      await expect(page.getByRole('button', { name: 'Copy event link' })).toBeVisible()
      await expect(page.locator('.calendar-help')).toContainText('Nothing is saved automatically.')
    } else await expect(page.locator('.calendar-help')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('.celebration-lower').screenshot({ path: `/tmp/wedding-calendar-${platform}.png` })
    await context.close()
  })
}
