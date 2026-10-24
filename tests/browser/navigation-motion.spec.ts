import { expect, test, type Page } from '@playwright/test'

async function enter(page: Page, url = '/invite/demo') {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url)
  await page.getByRole('button', { name: "Let's Open", exact: true }).click()
  await expect(page.locator('.opening-cover')).toHaveCount(0)
}
async function seek(page: Page, time: number) {
  await page.locator('#wedding-navigation').evaluate(async (root, value) => {
    for (const animation of root.getAnimations({ subtree: true })) { animation.pause(); animation.currentTime = value }
    await new Promise(requestAnimationFrame)
  }, time)
}
async function holdTracks(page: Page) {
  await page.addInitScript(() => {
    const original = Element.prototype.animate
    Element.prototype.animate = function (...args) {
      const animation = original.apply(this, args)
      if (this.closest('#wedding-navigation')) animation.pause()
      return animation
    }
  })
}
async function finish(page: Page) {
  await page.locator('#wedding-navigation').evaluate(root => { for (const animation of root.getAnimations({ subtree: true })) animation.finish() })
}
async function metrics(page: Page) {
  return page.locator('.navigation-layout').evaluate(root => ({
    photo: root.querySelector('img')?.getAttribute('src'),
    items: [...root.querySelectorAll('nav button')].map(el => { const style = getComputedStyle(el), rect = el.getBoundingClientRect(); return { text: el.textContent, font: style.fontFamily, size: style.fontSize, line: style.lineHeight, color: style.color, x: rect.x, y: rect.y, width: rect.width, height: rect.height } }),
  }))
}

for (const width of [390, 1680]) test(`curtain intermediate frames and unchanged settled design at ${width}px`, async ({ page, context }) => {
  await page.setViewportSize({ width, height: 939 })
  const baseline = await context.newPage()
  await baseline.setViewportSize({ width, height: 939 })
  await enter(baseline, 'http://127.0.0.1:4189/invite/demo')
  await baseline.getByRole('button', { name: 'Open navigation', exact: true }).click()
  const expected = await metrics(baseline)
  await baseline.screenshot({ path: `/tmp/wedding-menu-motion-evidence/baseline-${width}.png` })
  await baseline.close()

  await holdTracks(page)
  await enter(page)
  await page.evaluate(() => scrollTo(0, 650))
  const position = await page.evaluate(() => ({ y: scrollY, styles: document.body.style.cssText }))
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const trigger = page.locator('.menu-toggle')
  await trigger.click()
  const menu = page.locator('#wedding-navigation')
  await expect(menu).toHaveAttribute('data-phase', 'opening')
  await seek(page, 150)
  await page.screenshot({ path: `/tmp/wedding-menu-motion-evidence/opening-150-${width}.png` })
  await seek(page, 300)
  await expect(menu).toHaveAttribute('open')
  await expect(trigger).toHaveCSS('opacity', '0')
  expect(await page.evaluate(() => document.body.style.position)).toBe('fixed')
  const transforms = await menu.locator('[data-menu-curtain]').evaluateAll(elements => elements.filter(el => getComputedStyle(el).display !== 'none').map(el => getComputedStyle(el).transform))
  expect(transforms.length).toBe(width < 768 ? 5 : 10)
  expect(new Set(transforms).size).toBeGreaterThan(1)
  expect(transforms.some(value => !value.startsWith('matrix(1, 0, 0, 1,'))).toBe(true)
  await page.screenshot({ path: `/tmp/wedding-menu-motion-evidence/opening-300-${width}.png` })
  await seek(page, 600)
  await page.screenshot({ path: `/tmp/wedding-menu-motion-evidence/opening-600-${width}.png` })
  await finish(page)
  await expect(menu).toHaveAttribute('data-phase', 'open')
  const actual = await metrics(page)
  expect(actual.photo).toBe(expected.photo)
  actual.items.forEach((item, index) => {
    const old = expected.items[index]!
    expect({ text: item.text, font: item.font, size: item.size, line: item.line, color: item.color }).toEqual({ text: old.text, font: old.font, size: old.size, line: old.line, color: old.color })
    for (const key of ['x','y','width','height'] as const) expect(Math.abs(item[key] - old[key])).toBeLessThan(.6)
  })
  await page.screenshot({ path: `/tmp/wedding-menu-motion-evidence/open-${width}.png` })
  await menu.locator('[data-menu-toggle]').click()
  await expect(menu).toHaveAttribute('data-phase', 'closing')
  await seek(page, 150)
  expect(await page.evaluate(() => document.body.style.position)).toBe('fixed')
  await expect(menu).toHaveAttribute('open')
  await page.screenshot({ path: `/tmp/wedding-menu-motion-evidence/closing-150-${width}.png` })
  await finish(page)
  await expect(menu).not.toHaveAttribute('open')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveCSS('opacity', '1')
  expect(await page.evaluate(() => ({ y: scrollY, styles: document.body.style.cssText }))).toEqual(position)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('rapid reversal and latest navigation intent cannot be overwritten by stale completion', async ({ page }) => {
  await holdTracks(page)
  await enter(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('.menu-toggle').click()
  const menu = page.locator('#wedding-navigation'), toggle = menu.locator('[data-menu-toggle]')
  await seek(page, 250)
  await toggle.click()
  await seek(page, 100)
  await toggle.click()
  await expect(menu).toHaveAttribute('data-phase', 'opening')
  await finish(page)
  await expect(menu).toHaveAttribute('data-phase', 'open')
  await menu.getByRole('button', { name: 'RSVP', exact: true }).click()
  await expect(menu).toHaveAttribute('data-phase', 'closing')
  await menu.getByRole('button', { name: 'Gallery', exact: true }).click()
  await finish(page)
  await expect(page.locator('#gallery')).toBeFocused()
  await expect(menu).not.toHaveAttribute('open')
  await page.locator('.menu-toggle').click()
  await seek(page, 200)
  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await finish(page)
  await expect(menu).not.toHaveAttribute('open')
})

test('native focus containment, keyboard entry and guarded outside dismissal', async ({ page }) => {
  await enter(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('.menu-toggle').press('Enter')
  const menu = page.locator('#wedding-navigation')
  await expect(menu.locator('[data-menu-toggle]')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(menu).toHaveAttribute('data-phase', 'open')
  for (let index = 0; index < 12; index++) {
    await page.keyboard.press(index % 3 ? 'Tab' : 'Shift+Tab')
    expect(await menu.evaluate(root => root.contains(document.activeElement))).toBe(true)
  }
  const link = menu.getByRole('button', { name: 'Home', exact: true })
  const box = (await link.boundingBox())!
  await page.mouse.move(box.x + 15, box.y + 15); await page.mouse.down()
  await page.mouse.move(5, 100); await page.mouse.up()
  await expect(menu).toHaveAttribute('data-phase', 'open')
  await page.mouse.click(5, 100)
  await expect(menu).toHaveAttribute('data-phase', 'closing')
  await finish(page)
  await expect(page.locator('.menu-toggle')).toBeFocused()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [label, id] of [['Home','welcome'],['Profile','profile'],['Love Story','story'],['Wedding Event','details'],['RSVP','rsvp'],['Wedding Gift','gift'],['Gallery','gallery']]) {
    await page.locator('.menu-toggle').click()
    await menu.getByRole('button', { name: label!, exact: true }).click()
    await expect(page.locator(`#${id}`)).toBeFocused()
    await expect(menu).not.toHaveAttribute('open')
  }
})

test('breakpoint crossings and motion preference changes settle safely', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await enter(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.locator('.menu-toggle').click(); await seek(page, 300)
  const menu = page.locator('#wedding-navigation')
  for (const width of [768, 1680, 390]) {
    await page.setViewportSize({ width, height: 844 })
    expect(await menu.locator('[data-menu-curtain]').evaluateAll(elements => elements.filter(el => getComputedStyle(el).display !== 'none').length)).toBe(width < 768 ? 5 : 10)
    await expect(menu).toHaveAttribute('open')
    expect(await page.evaluate(() => document.body.style.position)).toBe('fixed')
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(menu).toHaveAttribute('data-phase', 'open')
  expect(await menu.evaluate(root => root.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0)
  await menu.locator('[data-menu-toggle]').click()
  await expect(menu).not.toHaveAttribute('open')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.getByRole('button', { name: 'Pause decorative motion', exact: true }).click()
  await page.locator('.menu-toggle').click()
  await expect(menu).toHaveAttribute('data-phase', 'open')
  expect(await menu.evaluate(root => root.getAnimations({ subtree: true }).filter(a => a.playState === 'running').length)).toBe(0)
  await page.keyboard.press('Escape')
  await expect(menu).not.toHaveAttribute('open')
})

test.describe('touch and short screens', () => {
  test.use({ hasTouch: true })
  test('opens, scrolls and dismisses the same menu at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 480 })
    await enter(page)
    await page.locator('.menu-toggle').tap()
    const menu = page.locator('#wedding-navigation')
    await expect(menu).toHaveAttribute('data-phase', 'open')
    expect(await menu.evaluate(root => root.scrollHeight > root.clientHeight)).toBe(true)
    await menu.getByRole('button', { name: 'Gallery', exact: true }).tap()
    await expect(page.locator('#gallery')).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
})
