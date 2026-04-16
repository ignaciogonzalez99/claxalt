'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

const ALL_PHOTOS = [
  { src: '/pics/br/1.jpg', country: 'Brasil' },
  { src: '/pics/br/2.jpg', country: 'Brasil' },
  { src: '/pics/br/3.jpg', country: 'Brasil' },
  { src: '/pics/br/4.jpg', country: 'Brasil' },
  { src: '/pics/ar/1.jpg', country: 'Argentina' },
  { src: '/pics/ar/2.jpg', country: 'Argentina' },
  { src: '/pics/co/1.jpg', country: 'Colombia' },
  { src: '/pics/co/2.jpg', country: 'Colombia' },
  { src: '/pics/mx/1.jpg', country: 'México' },
  { src: '/pics/mx/2.jpg', country: 'México' },
  { src: '/pics/mx/3.jpg', country: 'México' },
]

export default function Home() {
  const [photoIndex, setPhotoIndex] = useState(0)
  const cardRef    = useRef<HTMLDivElement>(null)
  const labelRef   = useRef<HTMLDivElement>(null)
  const back1Ref   = useRef<HTMLDivElement>(null)
  const back2Ref   = useRef<HTMLDivElement>(null)
  const isAnimating = useRef(false)

  const current = ALL_PHOTOS[photoIndex]

  // ─── advance ────────────────────────────────────────────────────────────────
  const advance = useCallback(() => {
    if (isAnimating.current || !cardRef.current) return
    isAnimating.current = true

    const next = (photoIndex + 1) % ALL_PHOTOS.length
    const countryChange = ALL_PHOTOS[next].country !== ALL_PHOTOS[photoIndex].country

    const tl = gsap.timeline()

    // Background cards shuffle subtly
    if (back1Ref.current && back2Ref.current) {
      tl.to([back1Ref.current, back2Ref.current], {
        rotation: '-=2',
        duration: 0.3,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
      }, 0)
    }

    // Active card flies out to the left
    tl.to(cardRef.current, {
      x: -360,
      rotation: -14,
      opacity: 0,
      duration: 0.42,
      ease: 'power2.in',
    }, 0)

    // After card is gone: update state + reset position
    tl.call(() => {
      if (!cardRef.current) return

      // Hide label if country changes
      if (countryChange && labelRef.current) {
        gsap.set(labelRef.current, { opacity: 0, y: 8 })
      }

      // Synchronously update React → new image renders while card is invisible
      flushSync(() => setPhotoIndex(next))

      // Snap card to the right (invisible) so it can slide in
      gsap.set(cardRef.current, { x: 360, rotation: 14, opacity: 0 })
    })

    // Card slides in from right
    tl.to(cardRef.current, {
      x: 0,
      rotation: 0,
      opacity: 1,
      duration: 0.52,
      ease: 'back.out(1.15)',
      onComplete: () => { isAnimating.current = false },
    }, '+=0.02')

    // Country label fades in if it changed
    if (countryChange && labelRef.current) {
      tl.to(labelRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.38,
        ease: 'power2.out',
      }, '-=0.3')
    }
  }, [photoIndex])

  // ─── auto-advance ────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(advance, 3200)
    return () => clearInterval(id)
  }, [advance])

  // ─── mount animations ────────────────────────────────────────────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      // Card entrance
      gsap.fromTo(cardRef.current,
        { y: 48, opacity: 0, scale: 0.94, rotation: -3 },
        { y: 0, opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: 'back.out(1.3)', delay: 0.4 }
      )

      // Label entrance
      gsap.fromTo(labelRef.current,
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 1.0 }
      )

      // Background cards entrance
      gsap.fromTo([back1Ref.current, back2Ref.current],
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power2.out', delay: 0.3, stagger: 0.08 }
      )

      // Story text – scroll-triggered stagger
      gsap.utils.toArray<HTMLElement>('.story-line').forEach((el) => {
        gsap.fromTo(el,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
            },
          }
        )
      })

      // Final CTA – special entrance
      const cta = document.querySelector('.cta-block')
      if (cta) {
        gsap.fromTo(cta,
          { y: 40, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cta,
              start: 'top 88%',
            },
          }
        )
      }
    })

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  // ─── tap to advance ──────────────────────────────────────────────────────────
  const handleTap = useCallback(() => advance(), [advance])

  return (
    <main
      className="min-h-screen flex flex-col items-center"
      style={{ background: '#FAF7F2' }}
    >
      {/* ── HERO ── */}
      <section className="w-full flex flex-col items-center justify-center px-6 pt-14 pb-10 min-h-[88dvh]">

        {/* Country label */}
        <div ref={labelRef} className="mb-7 flex items-center gap-3">
          <span className="block w-5 h-px" style={{ background: '#C8C0B8' }} />
          <span
            className="text-xs tracking-[0.22em] uppercase"
            style={{ color: '#A09890', fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}
          >
            {current.country}
          </span>
          <span className="block w-5 h-px" style={{ background: '#C8C0B8' }} />
        </div>

        {/* Card stack */}
        <div
          className="relative cursor-pointer select-none"
          style={{ width: 272, height: 368 }}
          onClick={handleTap}
          role="button"
          aria-label="siguiente foto"
        >
          {/* Decorative back cards */}
          <div
            ref={back2Ref}
            className="absolute inset-0 rounded-2xl bg-white"
            style={{
              transform: 'rotate(7deg) translate(6px, 5px)',
              zIndex: 0,
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              opacity: 0.75,
            }}
          />
          <div
            ref={back1Ref}
            className="absolute inset-0 rounded-2xl bg-white"
            style={{
              transform: 'rotate(3.5deg) translate(3px, 2px)',
              zIndex: 1,
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              opacity: 0.88,
            }}
          />

          {/* Active photo card — polaroid style */}
          <div
            ref={cardRef}
            className="absolute inset-0 rounded-2xl bg-white flex flex-col overflow-hidden"
            style={{
              zIndex: 2,
              boxShadow: '0 10px 36px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)',
              padding: '10px 10px 0 10px',
            }}
          >
            {/* Photo */}
            <div className="relative flex-1 rounded-xl overflow-hidden">
              <Image
                src={current.src}
                alt={current.country}
                fill
                className="object-cover"
                sizes="272px"
                priority
              />
            </div>
            {/* Polaroid base */}
            <div className="h-[44px] flex items-center justify-center">
              <span style={{ color: '#D4CEC8', fontSize: 10, letterSpacing: '0.3em', fontFamily: 'system-ui' }}>
                ✦ ✦ ✦
              </span>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-[5px] mt-7">
          {ALL_PHOTOS.map((_, i) => (
            <div
              key={i}
              style={{
                height: 5,
                borderRadius: 9999,
                background: i === photoIndex ? '#8C8480' : '#D9D4CF',
                width: i === photoIndex ? 20 : 5,
                transition: 'all 0.35s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            />
          ))}
        </div>

        <p
          className="mt-3 text-xs tracking-wide"
          style={{ color: '#C4BDB8', fontFamily: 'system-ui, sans-serif' }}
        >
          toca para avanzar
        </p>

      </section>

      {/* ── STORY TEXT ── */}
      <section
        className="w-full max-w-xs px-7 pb-8"
        style={{ paddingTop: '2rem' }}
      >
        <div className="space-y-[14px]">
          <p className="story-line text-xl font-normal leading-relaxed" style={{ color: '#4A4540' }}>
            Yo no fui a{' '}
            <span style={{ color: '#2C2825', fontWeight: 500 }}>Brasil</span>,
          </p>
          <p className="story-line text-xl font-normal leading-relaxed" style={{ color: '#4A4540' }}>
            no fui a{' '}
            <span style={{ color: '#2C2825', fontWeight: 500 }}>Argentina</span>,
          </p>
          <p className="story-line text-xl font-normal leading-relaxed" style={{ color: '#4A4540' }}>
            tampoco a{' '}
            <span style={{ color: '#2C2825', fontWeight: 500 }}>Colombia</span>,
          </p>
          <p className="story-line text-xl font-normal leading-relaxed" style={{ color: '#4A4540' }}>
            anduve cerca de{' '}
            <span style={{ color: '#2C2825', fontWeight: 500 }}>México</span>.
          </p>
        </div>

        {/* CTA block */}
        <div
          className="cta-block mt-10 pt-8"
          style={{ borderTop: '1px solid #E8E2DC' }}
        >
          <p
            className="text-base leading-relaxed italic"
            style={{ color: '#6B6460', fontWeight: 400 }}
          >
            Pero si vamos por un café, me encantaría que me cuentes cada sitio.
          </p>
          <p
            className="mt-3 text-sm leading-relaxed italic"
            style={{ color: '#A09890', fontWeight: 400 }}
          >
            Seguro hay buenas historias.
          </p>
        </div>

        <div className="h-16" />
      </section>
    </main>
  )
}
