// Placeholder photographs, painted in code until the real ones arrive.
const TONES = [['#3b2a24', '#c9a46a'], ['#1d2b2a', '#a9b8a6'], ['#4a1d24', '#e3c1a8'], ['#22252e', '#b9a68c'], ['#2f2219', '#d9b98a'], ['#3a1f2b', '#cfa7a0']]
function grain(x, w, h, a) { const img = x.getImageData(0, 0, w, h), d = img.data; for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * a; d[i] += n; d[i + 1] += n; d[i + 2] += n } x.putImageData(img, 0, 0) }
export function placeholderPhoto(i, w = 800, h = 1000, label = '') {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d')
  const [dark, light] = TONES[i % TONES.length]
  const g = x.createLinearGradient(0, 0, w * .4, h); g.addColorStop(0, light); g.addColorStop(1, dark); x.fillStyle = g; x.fillRect(0, 0, w, h)
  const r = x.createRadialGradient(w * .62, h * .38, 10, w * .62, h * .38, w * .9); r.addColorStop(0, 'rgba(255,240,220,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h)
  // two soft silhouettes, out of focus
  x.filter = 'blur(18px)'; x.fillStyle = 'rgba(20,14,12,.55)'
  const cx = w * .5, cy = h * .62
  ;[[-.13, 0], [.12, .02]].forEach(([dx, dy]) => { x.beginPath(); x.ellipse(cx + dx * w, cy - h * .2 + dy * h, w * .08, h * .07, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(cx + dx * w, cy + h * .12 + dy * h, w * .16, h * .2, 0, 0, Math.PI * 2); x.fill() })
  x.filter = 'none'
  grain(x, w, h, 22)
  if (label) { x.fillStyle = 'rgba(255,250,240,.85)'; x.font = `500 ${Math.round(w * .028)}px "JetBrains Mono", monospace`; x.fillText(label.toUpperCase(), w * .06, h - w * .06) }
  return c
}
