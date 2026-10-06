import content from './content.json'

export const slugify = (s) =>
  s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

// Accepts vimeo.com/123, vimeo.com/123/abcdef (unlisted), player.vimeo.com/video/123?h=abc, or a bare id.
export function vimeoEmbed(url, params = {}) {
  const str = String(url)
  const id = str.match(/(\d{6,})/)?.[1]
  const hash = str.match(/vimeo\.com\/\d+\/([a-z0-9]+)/i)?.[1] || str.match(/[?&]h=([a-z0-9]+)/i)?.[1]
  const q = new URLSearchParams({ ...(hash ? { h: hash } : {}), dnt: 1, ...params })
  return `https://player.vimeo.com/video/${id}?${q}`
}

// Poster frame straight from Vimeo, used when no thumbnail is set and behind the showreel while it loads.
const thumbs = new Map()
export function vimeoThumb(url) {
  if (!thumbs.has(url)) {
    thumbs.set(url, fetch(`https://vimeo.com/api/oembed.json?width=1920&url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d) => d.thumbnail_url?.replace(/\?.*$/, ''))
      .catch(() => null))
  }
  return thumbs.get(url)
}

// Local files in /public are referenced relative to the site root.
export const asset = (p) => (!p || /^https?:\/\//.test(p) ? p : import.meta.env.BASE_URL + p.replace(/^\//, ''))

export const projects = content.projects.map((p) => ({
  ...p,
  slug: slugify(p.title),
  videos: p.videos || [],
}))

export const showreel = content.showreel
export const contact = content.contact
