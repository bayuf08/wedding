import { defineEventHandler, getRequestURL, setHeader } from 'h3'
export default defineEventHandler(event => {
  if (!/^\/invite\/[a-f0-9]{64}\/?$/.test(getRequestURL(event).pathname)) return
  setHeader(event, 'Cache-Control', 'no-store, private')
  setHeader(event, 'Referrer-Policy', 'no-referrer')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
})
