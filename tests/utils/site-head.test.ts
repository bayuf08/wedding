import { describe, expect, it } from 'vitest'

import { invitationSiteHead } from '../../app/utils/site-head'

describe('invitationSiteHead', () => {
  it('declares English content at the document root', () => {
    expect(invitationSiteHead.htmlAttrs).toEqual({ lang: 'en' })
  })
})
