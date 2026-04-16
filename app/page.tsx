'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import Image from 'next/image'

type Photo = { src: string | null; country: string }

const PHOTOS: Photo[] = [
  { src: '/pics/br/1.jpg', country: 'Brasil'    },
  { src: '/pics/br/2.jpg', country: 'Brasil'    },
  { src: '/pics/br/3.jpg', country: 'Brasil'    },
  { src: '/pics/br/4.jpg', country: 'Brasil'    },
  { src: '/pics/ar/1.jpg', country: 'Argentina' },
  { src: '/pics/ar/2.jpg', country: 'Argentina' },
  { src: '/pics/co/1.jpg', country: 'Colombia'  },
  { src: '/pics/co/2.jpg', country: 'Colombia'  },
  { src: '/pics/mx/1.jpg', country: 'México'    },
  { src: '/pics/mx/2.jpg', country: 'México'    },
  { src: '/pics/mx/3.jpg', country: 'México'    },
  { src: null,             country: 'fin'       }, // end card
]

// Phrases shown below the card — one per country
// They make clear: she was there, I wasn't.
const PHRASES: Record<string, string> = {
  Brasil:    'Nunca fui a Brasil — pero vos sí.',
  Argentina: 'Ni a Argentina llegué.',
  Colombia:  'Colombia tampoco me vio pasar.',
  México:    'A México llegué cerca.',
  fin:       '',
}

export default function Home() {
  const [photoIndex, setPhotoIndex] = useState(0)

  const cardRef     = useRef<HTMLDivElement>(null)
  const back1Ref    = useRef<HTMLDivElement>(null)
  const back2Ref    = useRef<HTMLDivElement>(null)
  const phraseRef   = useRef<HTMLParagraphElement>(null)
  const labelRef    = useRef<HTMLDivElement>(null)
  const page1Ref    = useRef<HTMLDivElement>(null)
  const page2Ref    = useRef<HTMLDivElement>(null)
  const isAnimating = useRef(false)

  const current   = PHOTOS[photoIndex]
  const isEndCard = current.country === 'fin'

  // ── card advance ────────────────────────────────────────────
  const advance = useCallback(() => {
    // stop at end card — user must press continuar
    if (isAnimating.current || !cardRef.current || PHOTOS[photoIndex].country === 'fin') return
    isAnimating.current = true

    const next      = (photoIndex + 1) % PHOTOS.length
    const isCC      = PHOTOS[next].country !== PHOTOS[photoIndex].country
    const nextIsEnd = PHOTOS[next].country === 'fin'

    const tl = gsap.timeline({ onComplete: () => { isAnimating.current = false } })

    // Back cards: brief shuffle on every advance
    tl.to([back1Ref.current, back2Ref.current], {
      rotation: '+=3', x: '+=4',
      duration: 0.2, ease: 'power1.inOut', yoyo: true, repeat: 1,
    }, 0)

    // Card: slight lift → throw left
    tl.to(cardRef.current, { y: -12, duration: 0.1, ease: 'power1.out' }, 0)
    tl.to(cardRef.current, {
      x: -420, y: 30, rotation: -18, opacity: 0,
      duration: 0.33, ease: 'power3.in',
    }, 0.1)

    // Country change: phrase + label exit leftward
    if (isCC) {
      tl.to(phraseRef.current, { x: -32, opacity: 0, duration: 0.22, ease: 'power2.in' }, 0.07)
      tl.to(labelRef.current,  { y: -8,  opacity: 0, duration: 0.18, ease: 'power2.in' }, 0.09)
    }

    // While card is invisible: swap state + reset positions
    tl.call(() => {
      flushSync(() => setPhotoIndex(next))
      gsap.set(cardRef.current!, { x: 420, y: 30, rotation: 18, opacity: 0 })
      if (isCC) {
        gsap.set(phraseRef.current!, { x: 32, opacity: 0 })
        gsap.set(labelRef.current!,  { y: 8,  opacity: 0 })
      }
    }, undefined, 0.44)

    // Card enters from right with spring
    tl.to(cardRef.current, {
      x: 0, y: 0, rotation: 0, opacity: 1,
      duration: 0.6, ease: 'back.out(1.2)',
    }, 0.45)

    // Phrase + label enter — only if country changed and it's NOT the end card
    if (isCC && !nextIsEnd) {
      tl.to(phraseRef.current, { x: 0, opacity: 1, duration: 0.38, ease: 'power2.out' }, 0.63)
      tl.to(labelRef.current,  { y: 0, opacity: 1, duration: 0.32, ease: 'power2.out' }, 0.61)
    }
  }, [photoIndex])

  // ── auto-advance (pauses at end card) ───────────────────────
  useEffect(() => {
    if (isEndCard) return
    const id = setInterval(advance, 3200)
    return () => clearInterval(id)
  }, [advance, isEndCard])

  // ── page transitions ─────────────────────────────────────────
  const goToFinal = useCallback(() => {
    if (!page1Ref.current || !page2Ref.current) return
    gsap.set('.final-line', { opacity: 0, y: 24 })
    const tl = gsap.timeline()
    tl.to(page1Ref.current,  { yPercent: -100, duration: 0.72, ease: 'power2.inOut' })
    tl.fromTo(page2Ref.current,
      { yPercent: 100 },
      { yPercent: 0,   duration: 0.72, ease: 'power2.inOut' }, 0)
    tl.to('.final-line', { y: 0, opacity: 1, stagger: 0.22, duration: 0.65, ease: 'power2.out' }, 0.48)
  }, [])

  const goBack = useCallback(() => {
    if (!page1Ref.current || !page2Ref.current) return
    const tl = gsap.timeline()
    tl.to(page2Ref.current, { yPercent: 100, duration: 0.65, ease: 'power2.inOut' })
    tl.to(page1Ref.current, { yPercent: 0,   duration: 0.65, ease: 'power2.inOut' }, 0)
  }, [])

  // ── mount animations ─────────────────────────────────────────
  useEffect(() => {
    gsap.set(page2Ref.current, { yPercent: 100 })
    const ctx = gsap.context(() => {
      gsap.fromTo([back2Ref.current, back1Ref.current],
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.88, ease: 'power2.out', delay: 0.2, stagger: 0.07 })
      gsap.fromTo(cardRef.current,
        { y: 50, opacity: 0, scale: 0.93, rotation: -3 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1.05, ease: 'back.out(1.3)', delay: 0.3 })
      gsap.fromTo(labelRef.current,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', delay: 0.9 })
      gsap.fromTo(phraseRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out', delay: 1.05 })
    })
    return () => ctx.revert()
  }, [])

  // Derived styles
  const continueColor = isEndCard ? '#6B6460' : '#B8B0A8'

  return (
    <div style={{ height: '100dvh', overflow: 'hidden', position: 'relative', background: '#FAF7F2' }}>

      {/* ─────── PAGE 1: Gallery ─────── */}
      <div
        ref={page1Ref}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >

        {/* Country label — hidden on end card */}
        <div ref={labelRef} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 52, marginBottom: 18 }}>
          <span style={{ display: 'block', width: 20, height: 1, background: '#C8C0B8' }} />
          <span style={{ color: '#A09890', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}>
            {isEndCard ? '\u00a0' : current.country}
          </span>
          <span style={{ display: 'block', width: 20, height: 1, background: '#C8C0B8' }} />
        </div>

        {/* Card stack */}
        <div
          style={{
            position: 'relative', cursor: 'pointer',
            width: 'clamp(210px, calc(100vw - 80px), 268px)',
            aspectRatio: '268 / 362',
          }}
          onClick={() => isEndCard ? goToFinal() : advance()}
          role="button"
          aria-label={isEndCard ? 'continuar' : 'siguiente foto'}
        >
          {/* Decorative back cards */}
          <div ref={back2Ref} style={{ position: 'absolute', inset: 0, borderRadius: 16, background: '#fff', transform: 'rotate(7deg) translate(6px, 5px)', zIndex: 0, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', opacity: 0.72 }} />
          <div ref={back1Ref} style={{ position: 'absolute', inset: 0, borderRadius: 16, background: '#fff', transform: 'rotate(3.5deg) translate(3px, 2px)', zIndex: 1, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', opacity: 0.88 }} />

          {/* Active polaroid card */}
          <div
            ref={cardRef}
            style={{
              position: 'absolute', inset: 0, borderRadius: 16, background: '#fff',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              zIndex: 2, boxShadow: '0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
              padding: '10px 10px 0',
            }}
          >
            {current.src ? (
              // Regular photo
              <div style={{ position: 'relative', flex: 1, borderRadius: 10, overflow: 'hidden' }}>
                <Image
                  src={current.src}
                  alt={current.country}
                  fill
                  className="object-cover"
                  sizes="268px"
                  priority
                />
              </div>
            ) : (
              // End card — soft invitation to press continuar
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, background: '#FDFAF5', gap: 0,
              }}>
                <div style={{ width: 32, height: 1, background: '#DDD6CE', marginBottom: 30 }} />
                <p style={{
                  fontFamily: 'var(--font-lora)', fontSize: 23,
                  fontStyle: 'italic', color: '#3A3530',
                  textAlign: 'center', lineHeight: 1.65, margin: 0,
                }}>
                  ¿vamos<br />por ese<br />café?
                </p>
                <div style={{ width: 32, height: 1, background: '#DDD6CE', marginTop: 30, marginBottom: 22 }} />
                {/* Arrow pointing toward continuar button */}
                <svg width="11" height="18" viewBox="0 0 11 18" fill="none">
                  <line x1="5.5" y1="0" x2="5.5" y2="14" stroke="#C8C0B8" strokeWidth="1.3" strokeLinecap="round" />
                  <path d="M1 9.5l4.5 6.5 4.5-6.5" stroke="#C8C0B8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            )}

            {/* Polaroid base */}
            <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#D4CEC8', fontSize: 9, letterSpacing: '0.35em', fontFamily: 'system-ui' }}>✦ ✦ ✦</span>
            </div>
          </div>
        </div>

        {/* Phrase — changes with country */}
        <p
          ref={phraseRef}
          style={{
            marginTop: 22, textAlign: 'center', padding: '0 24px',
            fontSize: 18, fontWeight: 400, color: '#4A4540', lineHeight: 1.5,
            fontFamily: 'var(--font-lora)', minHeight: '1.8em',
          }}
        >
          {PHRASES[current.country]}
        </p>

        {/* Progress dots — 11 photo dots + 1 end dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 14 }}>
          {PHOTOS.slice(0, -1).map((_, i) => (
            <div key={i} style={{
              height: 5, borderRadius: 9999,
              background: i === photoIndex ? '#8C8480' : '#D9D4CF',
              width: i === photoIndex ? 20 : 5,
              transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
          {/* End card indicator — darker when active */}
          <div style={{
            height: 5, borderRadius: 9999,
            background: isEndCard ? '#3A3530' : '#EAE5DF',
            width: isEndCard ? 20 : 5,
            transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Continue button — brightens when end card is active */}
        <button
          onClick={goToFinal}
          style={{
            marginBottom: 36,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            color: continueColor,
            transition: 'color 0.5s ease',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            WebkitTapHighlightColor: 'transparent',
            padding: '8px 20px',
          }}
        >
          <span>continuar</span>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

      </div>

      {/* ─────── PAGE 2: Final message ─────── */}
      <div
        ref={page2Ref}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '0 40px', background: '#FAF7F2',
        }}
      >
        <button
          onClick={goBack}
          style={{
            position: 'absolute', top: 30, left: 24,
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#C4BDB8', fontFamily: 'system-ui, sans-serif',
            fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          volver
        </button>

        <div style={{ maxWidth: 290, textAlign: 'center' }}>
          <div className="final-line" style={{ width: 28, height: 1, background: '#D4CEC8', margin: '0 auto 32px', opacity: 0 }} />

          <p className="final-line" style={{
            fontSize: 21, fontWeight: 400, color: '#3A3530',
            fontFamily: 'var(--font-lora)', lineHeight: 1.72,
            fontStyle: 'italic', opacity: 0,
          }}>
            Pero si vamos por un café, me encantaría que me cuentes cada sitio.
          </p>

          <p className="final-line" style={{
            marginTop: 22, fontSize: 15, fontWeight: 400,
            color: '#A09890', fontFamily: 'var(--font-lora)',
            lineHeight: 1.6, fontStyle: 'italic', opacity: 0,
          }}>
            Seguro hay buenas historias.
          </p>

          <div className="final-line" style={{ width: 28, height: 1, background: '#D4CEC8', margin: '32px auto 0', opacity: 0 }} />
        </div>
      </div>

    </div>
  )
}
