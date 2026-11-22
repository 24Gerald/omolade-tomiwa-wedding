import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import qrcode from 'qrcode-generator'
import { COUPLE, DATE_ISO, DATE_TEXT, VENUE, ORDER, PHOTOS, GIFTS, PROPOSAL_VIDEO, PROPOSAL_POSTER, ENTRANCE_PHOTO, naira } from './config'
import { scroll, useUI } from './store'
import { register, give, myPass, watch, canEdit } from './data'
import { placeholderPhoto } from './paint'

gsap.registerPlugin(ScrollTrigger)
const Scene = lazy(() => import('./Scene'))
const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
function glOK() { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } }

function SmoothScroll() {
  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ autoRaf: false, lerp: .09 })
    lenis.on('scroll', e => { scroll.velocity = e.velocity; ScrollTrigger.update() })
    const tick = time => lenis.raf(time * 1000)
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0)
    window.__lenis = lenis
    return () => { gsap.ticker.remove(tick); lenis.destroy() }
  }, [])
  useEffect(() => {
    const mv = e => { scroll.pointer.x = e.clientX / innerWidth - .5; scroll.pointer.y = e.clientY / innerHeight - .5 }
    addEventListener('pointermove', mv, { passive: true }); return () => removeEventListener('pointermove', mv)
  }, [])
  return null
}
const goto = id => { const el = document.getElementById(id); if (!el) return; window.__lenis ? window.__lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView() }

function useReveals() {
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray('[data-reveal]').forEach(el => gsap.fromTo(el, { y: 36, opacity: .3 }, { y: 0, opacity: 1, ease: 'power3.out', duration: 1.1, scrollTrigger: { trigger: el, start: 'top 88%' } }))
      gsap.utils.toArray('[data-split]').forEach(el => gsap.fromTo(el.querySelectorAll('.w'), { yPercent: 105 }, { yPercent: 0, stagger: .06, ease: 'expo.out', duration: 1.4, scrollTrigger: { trigger: el, start: 'top 90%' } }))
    })
    return () => ctx.revert()
  }, [])
}
const Split = ({ text, as: T = 'span', className }) => <T className={className} data-split>{text.split(' ').map((w, i) => <span key={i}><span className="wm"><span className="w">{w}</span></span>{' '}</span>)}</T>

function Loader() {
  const ready = useUI(s => s.ready); const [n, setN] = useState(0); const [gone, setGone] = useState(false)
  useEffect(() => { let raf, t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / 1500); setN(Math.round((1 - Math.pow(1 - k, 3)) * 100)); if (k < 1) raf = requestAnimationFrame(f) }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf) }, [])
  useEffect(() => { if (n >= 100 && ready) { const t = setTimeout(() => setGone(true), 250); return () => clearTimeout(t) } }, [n, ready])
  useEffect(() => { const t = setTimeout(() => useUI.getState().setReady(true), 6000); return () => clearTimeout(t) }, [])
  return <div className={'loader' + (gone ? ' gone' : '')} aria-hidden="true"><div className="l-top"><span>{COUPLE.monogram}</span><span>27 &middot; 02 &middot; 2027</span></div><div className="l-num">{String(n).padStart(3, '0')}</div><div className="l-bar"><i style={{ transform: `scaleX(${n / 100})` }} /></div></div>
}

function Countdown() {
  const [now, setNow] = useState(Date.now()); useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  const ms = Math.max(0, new Date(DATE_ISO) - now), d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60
  return <div className="count">{[[d, 'days'], [h, 'hours'], [m, 'min'], [s, 'sec']].map(([v, l]) => <div key={l}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>)}</div>
}

function Typewriter({ text }) {
  const [out, setOut] = useState('')
  useEffect(() => { let i = 0; setOut(''); const t = setInterval(() => { i++; setOut(text.slice(0, i)); if (i >= text.length) clearInterval(t) }, reduced ? 0 : 34); return () => clearInterval(t) }, [text])
  return <p className="type" aria-live="polite">{out}<span className="caret" aria-hidden="true" /></p>
}

function Life({ gl }) {
  const idx = useUI(s => s.lifeIndex)
  if (!gl) return (
    <section id="life" className="sec dark static-life"><div className="wrap"><span className="eyebrow">A peep into our life</span><h2 className="h2">Little moments, in order.</h2>
      <div className="stills">{PHOTOS.map((p, i) => <figure key={i}><img alt="" src={p.src || placeholderPhoto(i, 600, 750, `Photo ${i + 1}`).toDataURL('image/jpeg', .8)} /><figcaption>{p.caption}</figcaption></figure>)}</div></div></section>)
  return (
    <section id="life" className="sec dark tall" style={{ height: `${PHOTOS.length * 90}svh` }}>
      <div className="sticky">
        <div className="life-head"><span className="eyebrow">A peep into our life</span><span className="eyebrow num">{String(idx + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}</span></div>
        <div className="life-cap"><Typewriter text={PHOTOS[idx]?.caption || ''} /></div>
      </div>
    </section>)
}

function Film() {
  return (
    <section id="film" className="sec dark"><div className="wrap">
      <span className="eyebrow" data-reveal>The proposal</span>
      <Split as="h2" className="h2" text="The night we said yes." />
      <div className="film" data-reveal>{PROPOSAL_VIDEO ? <video src={PROPOSAL_VIDEO} poster={PROPOSAL_POSTER} controls playsInline preload="none" /> :
        <div className="film-ph"><div className="play" aria-hidden="true" /><p>Our proposal film is on its way. It will play right here.</p></div>}</div>
    </div></section>)
}

function Day() {
  return (
    <section id="day" className="sec"><div className="wrap">
      <span className="eyebrow" data-reveal>The day</span>
      <Split as="h2" className="h2 big" text={DATE_TEXT} />
      <p className="lede" data-reveal>{VENUE.name}, {VENUE.area}. <span className="muted">{VENUE.note}</span></p>
      <Countdown />
      <ol className="order">{ORDER.map((o, i) => <li key={i} data-reveal><time>{o.time}</time><div><h3>{o.title}</h3><p className="muted">{o.note}</p></div></li>)}</ol>
    </div></section>)
}

function useRaised() {
  const [rows, setRows] = useState([]); useEffect(() => watch('contribs', setRows), [])
  return id => rows.filter(r => r.giftId === id).reduce((a, r) => a + (Number(r.amount) || 0), 0)
}

function GiftRoom({ gl, raised }) {
  const idx = useUI(s => s.giftIndex), setOpen = useUI(s => s.setGiftOpen)
  const [giving, setGiving] = useState(null)
  const g = GIFTS[idx] || GIFTS[0], r = raised(g.id), pct = Math.min(100, r / g.price * 100)
  if (!gl) return (
    <section id="gifts" className="sec wine"><div className="wrap"><span className="eyebrow">The gift room</span><h2 className="h2 big">Help us start our new life.</h2>
      <GiftList raised={raised} onGive={setGiving} /></div>{giving && <Give gift={giving} onClose={() => setGiving(null)} />}</section>)
  return (
    <section id="gifts" className="sec wine tall" style={{ height: `${GIFTS.length * 85 + 40}svh` }}>
      <div className="sticky gift-stage">
        <header className="gift-head"><span className="eyebrow">The gift room &middot; {String(idx + 1).padStart(2, '0')} / {String(GIFTS.length).padStart(2, '0')}</span><h2 className="h2">Help us start our new life.</h2></header>
        <div className="gift-card" key={g.id}>
          <h3>{g.name}</h3><div className="price">{naira(g.price)}</div><p>{g.note}</p>
          <div className="bar"><i style={{ width: pct + '%' }} /></div><div className="small">{naira(r)} of {naira(g.price)} given</div>
          <div className="row"><button className="btn light" onClick={() => setGiving(g)}>{r >= g.price ? 'Fully given' : 'Give this gift'}</button><button className="btn line" onClick={() => setOpen(true)}>See all gifts</button></div>
        </div>
        <div className="dots" aria-hidden="true">{GIFTS.map((x, i) => <i key={x.id} className={i === idx ? 'on' : ''} />)}</div>
      </div>
      {giving && <Give gift={giving} onClose={() => setGiving(null)} />}
    </section>)
}

function GiftList({ raised, onGive }) {
  return <div className="glist">{GIFTS.map((g, i) => { const r = raised(g.id), done = r >= g.price; return (
    <article key={g.id} className="gl-item"><span className="num">{String(i + 1).padStart(2, '0')}</span><div><h3>{g.name}</h3><p>{g.note}</p><div className="bar"><i style={{ width: Math.min(100, r / g.price * 100) + '%' }} /></div></div><div className="gl-right"><b>{naira(g.price)}</b><button className="btn light small" disabled={done} onClick={() => onGive(g)}>{done ? 'Given' : 'Give'}</button></div></article>) })}</div>
}

function Give({ gift, onClose }) {
  const pass = myPass(); const [amt, setAmt] = useState(gift.price); const [name, setName] = useState(pass?.name || ''); const [msg, setMsg] = useState(''); const [method, setMethod] = useState('Card'); const [state, setState] = useState('form')
  async function pay(e) { e.preventDefault(); if (amt < 1000) return; setState('paying'); await new Promise(r => setTimeout(r, 1200)); try { await give(gift.id, Math.round(amt), name.trim(), msg.trim()); setState('done'); confetti() } catch { setState('error') } }
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && onClose()}><div className="sheet" role="dialog" aria-label={'Give ' + gift.name}>
      {state === 'done' ? <><span className="eyebrow">Thank you</span><h3 className="h3">{naira(amt)} towards the {gift.name.toLowerCase()}</h3><p className="muted">This means the world to us. (Test payment, no money moved.)</p><button className="btn" onClick={onClose}>Close</button></> :
      <form onSubmit={pay} className="form">
        <span className="eyebrow">Give a gift</span><h3 className="h3">{gift.name}</h3>
        <label>Amount (&#8358;)<input type="number" min="1000" step="500" value={amt} onChange={e => setAmt(Number(e.target.value))} /></label>
        <div className="chips">{[gift.price, Math.round(gift.price / 2), Math.round(gift.price / 4), Math.round(gift.price / 10)].map(v => <button type="button" key={v} className={'chip' + (amt === v ? ' on' : '')} onClick={() => setAmt(v)}>{v === gift.price ? 'Whole gift' : naira(v)}</button>)}</div>
        <label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="So we can thank you" /></label>
        <label>A note (optional)<input value={msg} maxLength={160} onChange={e => setMsg(e.target.value)} /></label>
        <div className="chips">{['Card', 'Bank transfer', 'USSD'].map(mm => <button type="button" key={mm} className={'chip' + (method === mm ? ' on' : '')} onClick={() => setMethod(mm)}>{mm}</button>)}</div>
        <p className="note">Test mode: Pay simulates a Paystack payment. No card details are asked for and no money moves.</p>
        {state === 'error' && <p className="note err">That didn't go through. Check your connection and try again.</p>}
        <div className="row"><button type="button" className="btn line dark" onClick={onClose}>Not now</button><button className="btn" disabled={state === 'paying'}>{state === 'paying' ? 'Processing…' : `Pay ${naira(amt)}`}</button></div>
      </form>}
    </div></div>)
}

function GiftSheet({ raised }) {
  const open = useUI(s => s.giftOpen), setOpen = useUI(s => s.setGiftOpen); const [giving, setGiving] = useState(null)
  if (!open) return null
  const pass = myPass()
  return (
    <div className="modal" onClick={e => e.target === e.currentTarget && setOpen(false)}><div className="sheet wide wine-sheet" role="dialog" aria-label="Our gift list">
      <span className="eyebrow">{pass ? `Thank you for registering, ${pass.name.split(' ')[0]}` : 'Our gift list'}</span>
      <h3 className="h3">Would you like to bless our new home?</h3>
      <GiftList raised={raised} onGive={setGiving} />
      <button className="btn line" onClick={() => setOpen(false)}>Maybe later</button>
      {giving && <Give gift={giving} onClose={() => setGiving(null)} />}
    </div></div>)
}

function Register() {
  const [pass, setPass] = useState(myPass()); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [busy, setBusy] = useState(false); const [err, setErr] = useState('')
  const setOpen = useUI(s => s.setGiftOpen)
  async function submit(e) {
    e.preventDefault(); setErr('')
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email)) { setErr('Enter your full name and a valid email address.'); return }
    setBusy(true)
    try { const p = await register(name.trim(), email.trim().toLowerCase()); setPass(p); if (!p.gifted) setTimeout(() => setOpen(true), 1400) }
    catch { setErr("We couldn't register you just now. Check your connection and try again.") }
    setBusy(false)
  }
  const qr = pass ? (() => { const q = qrcode(0, 'M'); q.addData('OT1:' + pass.id); q.make(); return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }) })() : ''
  return (
    <section id="register" className="sec reg-sec"><div className="reg-bg" aria-hidden="true" /><div className="wrap reg">
      <div><span className="eyebrow" data-reveal>Register to attend</span><Split as="h2" className="h2 big" text={pass ? 'Your seat is saved.' : 'Will you be there?'} />
        <p className="lede" data-reveal>{pass ? 'Show this pass at the entrance. It opens the door once, so keep it to yourself.' : 'Add your name and email. We’ll send your personal entry pass, a QR code that works once at the door.'}</p></div>
      {pass ? <div className="pass"><div className="qr" dangerouslySetInnerHTML={{ __html: qr }} /><div><span className="eyebrow">Admit one</span><h3 className="h3">{pass.name}</h3><p>{DATE_TEXT} &middot; 1:00 PM</p><p className="mono">{pass.id.toUpperCase()}</p>
        <p className="note">Preview: email delivery switches on when the site goes live, so for now the pass shows here.</p>
        {!pass.gifted && <button className="btn" onClick={() => setOpen(true)}>Give a gift</button>}</div></div> :
      <form className="form reg-form" onSubmit={submit}>
        <label>Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>
        <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required /></label>
        {err && <p className="note err">{err}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Registering…' : 'Register and get my pass'}</button>
      </form>}
    </div></section>)
}

function Dashboard({ raised }) {
  const [rows, setRows] = useState([]); const [cs, setCs] = useState([])
  useEffect(() => watch('guests', setRows), []); useEffect(() => watch('contribs', setCs), [])
  const total = cs.reduce((a, c) => a + (Number(c.amount) || 0), 0)
  return (
    <div className="dash"><div className="wrap">
      <a href="#" className="btn line dark small">Back to the site</a>
      <h2 className="h2">Registrations and gifts</h2>
      <div className="stats"><div><b>{rows.length}</b><span>registered</span></div><div><b>{rows.filter(r => r.gifted).length}</b><span>have given</span></div><div><b>{naira(total)}</b><span>gifts (test)</span></div></div>
      <div className="tablewrap"><table><thead><tr><th>Name</th><th>Email</th><th>Registered</th><th>Gave</th></tr></thead><tbody>{rows.slice().sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).map(r => <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{r.createdAt ? new Date(r.createdAt).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</td><td>{r.gifted ? 'Yes' : ''}</td></tr>)}</tbody></table></div>
      <div className="tablewrap"><table><thead><tr><th>From</th><th>Gift</th><th>Amount</th><th>Note</th></tr></thead><tbody>{cs.slice().reverse().map(c => <tr key={c.id}><td>{c.name || 'Anonymous'}</td><td>{GIFTS.find(g => g.id === c.giftId)?.name || c.giftId}</td><td>{naira(c.amount)}</td><td>{c.message}</td></tr>)}</tbody></table></div>
    </div></div>)
}

function confetti() {
  if (reduced) return
  const c = document.createElement('canvas'); c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90'; document.body.appendChild(c)
  const x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight; const cols = ['#c9a46a', '#e7b49a', '#f3efe7', '#6b1e28']
  const P = Array.from({ length: 120 }, () => ({ x: c.width / 2, y: c.height * .6, vx: (Math.random() - .5) * 13, vy: -Math.random() * 15 - 4, r: Math.random() * 7 + 3, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6 }))
  let t = 0; (function f() { x.clearRect(0, 0, c.width, c.height); P.forEach(p => { p.vy += .42; p.x += p.vx; p.y += p.vy; p.a += .15; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r / 2, -p.r / 6, p.r, p.r / 3); x.restore() }); if (++t < 140) requestAnimationFrame(f); else c.remove() })()
}

export default function App() {
  const [gl] = useState(() => !reduced && glOK())
  const [hash, setHash] = useState(location.hash); const [owner, setOwner] = useState(false)
  useEffect(() => { const f = () => setHash(location.hash); addEventListener('hashchange', f); canEdit().then(setOwner); if (!gl) useUI.getState().setReady(true); return () => removeEventListener('hashchange', f) }, [gl])
  const raised = useRaised(); const setOpen = useUI(s => s.setGiftOpen)
  useReveals()
  if (hash === '#dashboard' && owner) return <Dashboard raised={raised} />
  return (
    <>
      <SmoothScroll />
      {!reduced && <Loader />}
      {gl && <div className="canvas"><Suspense fallback={null}><Scene /></Suspense></div>}
      <header className="nav"><button className="mark" onClick={() => goto('hero')}>{COUPLE.monogram}</button><nav><button onClick={() => goto('day')}>The day</button><button onClick={() => goto('register')}>Register</button>{owner && <a href="#dashboard">Dashboard</a>}</nav></header>
      <button className="gift-fab" onClick={() => setOpen(true)}>Gift list</button>
      <main className={gl ? 'has-gl' : 'no-gl'}>
        <section id="hero" className="sec hero">
          <div className="hero-top"><span className="eyebrow">Together with their families</span></div>
          <h1 className="names"><Split text={COUPLE.bride} className="n1" /><span className="amp">&amp;</span><Split text={COUPLE.groom} className="n2" /></h1>
          <div className="hero-foot"><span>{DATE_TEXT}</span><span>{VENUE.area}</span><button className="cue" onClick={() => goto('entrance')}>Scroll to come in</button></div>
        </section>
        <section id="entrance" className="sec entrance">
          {!gl && <img className="entrance-img" alt="" src={ENTRANCE_PHOTO || placeholderPhoto(2, 1200, 800, 'Entrance photo').toDataURL('image/jpeg', .85)} />}
          <div className="entrance-copy"><Split as="h2" className="h2 big" text="Welcome in." /><p className="lede" data-reveal>You are part of our story. Here is a little of it.</p></div>
        </section>
        <Life gl={gl} />
        <Film />
        <Day />
        <GiftRoom gl={gl} raised={raised} />
        <Register />
        <footer className="foot"><span>{COUPLE.monogram}</span><span>{DATE_TEXT}</span></footer>
      </main>
      <GiftSheet raised={raised} />
    </>)
}
