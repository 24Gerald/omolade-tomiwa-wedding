// Shared data through the artifact's database capability. Works without it (preview mode).
let dbP = null
export function getDB() {
  if (!dbP) dbP = (async () => { try { return window.claude && window.claude.use ? await window.claude.use('db') : null } catch { return null } })()
  return dbP
}
export async function canEdit() { try { const u = window.claude && await window.claude.use('user'); return u ? await u.canEdit() : false } catch { return false } }
export function token(n = 12) { const a = 'abcdefghjkmnpqrstuvwxyz23456789'; const b = new Uint8Array(n); crypto.getRandomValues(b); return [...b].map(x => a[x % a.length]).join('') }
const LS = 'our-wedding-pass'
export function myPass() { try { return JSON.parse(localStorage.getItem(LS) || 'null') } catch { return null } }
export function savePass(p) { try { localStorage.setItem(LS, JSON.stringify(p)) } catch {} }
async function myId() { try { const u = await window.claude.use('user'); return u ? await u.id() : null } catch { return null } }
// One registration per signed-in person: guests/<their id>, readable only by them and the couple.
export async function register(name, email) {
  const db = await getDB(); const uid = await myId()
  if (!window.claude) { const p = { id: token(), uid: null, name, email, gifted: false, local: true }; savePass(p); return p } // test hosting (GitHub Pages): no shared database yet
  if (!db || !uid) throw new Error('offline')
  const id = token()
  await db.doc('guests/' + uid).set({ name, email, token: id, createdAt: new Date().toISOString(), entries: [], gifted: false })
  const p = { id, uid, name, email, gifted: false }; savePass(p); return p
}
export async function give(giftId, amount, name, message) {
  const db = await getDB()
  if (!db && !window.claude) { const p = myPass(); if (p) { p.gifted = true; savePass(p) } return }
  if (!db) throw new Error('offline')
  await db.collection('contribs').doc(token(14)).set({ giftId, amount, name, message, test: true, at: new Date().toISOString() })
  const p = myPass(); if (p) { p.gifted = true; savePass(p); try { await db.doc('guests/' + (p.uid || p.id)).update({ gifted: true }) } catch {} }
}
export function watch(col, cb) {
  let off = () => {}
  getDB().then(db => { if (db) off = db.collection(col).onSnapshot(s => cb(s.docs.map(d => ({ id: d.id, ...d.data() }))), () => {}) })
  return () => off()
}
