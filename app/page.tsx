"use client";
import React, { useState, useEffect, useRef } from "react";

function useInView(threshold = 0.15): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, style = {}, className = "" }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties; className?: string }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.9s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.9s ${delay}s cubic-bezier(0.16,1,0.3,1)`,
      ...style
    }}>
      {children}
    </div>
  );
}

const burnoutTypes = [
  { id: "exhausted",  emoji: "🪫", label: "Exhausted",  color: "#B5654A", desc: "Running on fumes. Physically drained, emotionally hollow. Sleep doesn't fix it anymore." },
  { id: "detached",   emoji: "🌫️", label: "Detached",   color: "#5A8A9A", desc: "You're present but not really there. Lectures, assignments — all feels distant, like watching through glass." },
  { id: "worthless",  emoji: "🌀", label: "Worthless",  color: "#7A6EAA", desc: "The nagging feeling that you're behind, not good enough, falling short no matter what you do." },
  { id: "recovering", emoji: "🌿", label: "Recovering", color: "#4A8A5A", desc: "You've been through it. Now finding your way back, slowly, at your own pace." },
];

function BurnoutCard({ emoji, label, color, desc, delay }: { emoji: string; label: string; color: string; desc: string; delay: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? `${color}12` : "#FFFFFF",
          border: `1.5px solid ${hovered ? color + "55" : "rgba(90,110,85,0.12)"}`,
          borderRadius: 24, padding: "2rem 1.8rem",
          transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
          cursor: "default",
          boxShadow: hovered ? `0 8px 32px ${color}18` : "0 2px 12px rgba(80,90,70,0.06)",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{emoji}</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.15rem", fontWeight: 600, color: hovered ? color : "#2E3528", marginBottom: "0.6rem", transition: "color 0.3s" }}>{label}</div>
        <div style={{ fontSize: "0.87rem", color: "rgba(46,53,40,0.55)", lineHeight: 1.7 }}>{desc}</div>
      </div>
    </FadeIn>
  );
}

function StepItem({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{
      display: "flex", gap: "1.5rem", alignItems: "flex-start",
      opacity: inView ? 1 : 0,
      transform: inView ? "translateX(0)" : "translateX(-24px)",
      transition: `opacity 0.8s ${delay}s cubic-bezier(0.16,1,0.3,1), transform 0.8s ${delay}s cubic-bezier(0.16,1,0.3,1)`
    }}>
      <div style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, border: "1.5px solid rgba(90,140,100,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", color: "#4A8A5A", background: "rgba(90,140,100,0.07)" }}>{num}</div>
      <div>
        <div style={{ fontSize: "1.05rem", fontWeight: 600, color: "#2E3528", marginBottom: "0.3rem" }}>{title}</div>
        <div style={{ fontSize: "0.87rem", color: "rgba(46,53,40,0.5)", lineHeight: 1.7 }}>{desc}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [moodIdx, setMoodIdx] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -200, y: -200 });
  const moods = ["cooked 🍳", "kinda dead 💀", "barely surviving 🌧️", "hanging in there 🌿", "actually okay ✨"];

  useEffect(() => {
    const t = setInterval(() => setMoodIdx(i => (i + 1) % moods.length), 2800);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Syne:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --bg: #F5F0E8; --bg2: #EDE8DC; --bg3: #EAE4D6;
          --border: rgba(90,110,85,0.12); --ink: #2E3528;
          --muted: rgba(46,53,40,0.5); --green: #4A8A5A; --terracotta: #B5654A;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--bg); color: var(--ink); font-family: 'Syne', sans-serif; overflow-x: hidden; cursor: none; }
        .cursor { position: fixed; width: 9px; height: 9px; background: var(--green); border-radius: 50%; pointer-events: none; z-index: 9999; }
        .cursor-ring { position: fixed; width: 34px; height: 34px; border: 1.5px solid rgba(74,138,90,0.4); border-radius: 50%; pointer-events: none; z-index: 9998; transition: left 0.1s ease, top 0.1s ease; }
        body::before { content: ''; position: fixed; inset: 0; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); opacity: 0.025; pointer-events: none; z-index: 9997; }
        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 1.3rem 3rem; background: rgba(245,240,232,0.85); backdrop-filter: blur(18px); border-bottom: 1px solid var(--border); }
        .logo { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; font-style: italic; color: var(--ink); text-decoration: none; letter-spacing: -0.02em; }
        .logo span { color: var(--green); }
        .nav-links { display: flex; align-items: center; gap: 0.4rem; }
        .nav-link { font-size: 0.84rem; font-weight: 500; color: var(--muted); text-decoration: none; padding: 0.4rem 0.9rem; border-radius: 100px; transition: color 0.2s, background 0.2s; }
        .nav-link:hover { color: var(--ink); background: rgba(74,138,90,0.08); }
        .nav-cta { font-size: 0.84rem; font-weight: 600; color: #F5F0E8; text-decoration: none; padding: 0.55rem 1.4rem; border-radius: 100px; background: var(--ink); transition: background 0.2s, transform 0.2s; }
        .nav-cta:hover { background: var(--green); transform: translateY(-1px); }
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10rem 2rem 6rem; text-align: center; position: relative; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none; animation: orbFloat 14s ease-in-out infinite; }
        .orb1 { width: 560px; height: 560px; background: rgba(122,158,124,0.18); top: -100px; left: -180px; }
        .orb2 { width: 440px; height: 440px; background: rgba(200,149,106,0.13); bottom: -100px; right: -120px; animation-delay: -5s; }
        .orb3 { width: 300px; height: 300px; background: rgba(181,101,74,0.08); top: 40%; left: 60%; animation-delay: -9s; }
        .hero-tag { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); border: 1.5px solid rgba(74,138,90,0.25); border-radius: 100px; padding: 0.35rem 1rem; margin-bottom: 2.5rem; background: rgba(74,138,90,0.07); animation: fadeUp 1s 0.1s both; }
        .hero-headline { font-family: 'Playfair Display', serif; font-size: clamp(3rem, 8vw, 7rem); font-weight: 700; line-height: 1.02; letter-spacing: -0.04em; max-width: 880px; animation: fadeUp 1s 0.2s both; color: var(--ink); }
        .hero-headline em { font-style: italic; color: var(--green); }
        .hero-headline .soft { color: rgba(46,53,40,0.25); }
        .hero-sub { font-size: clamp(0.95rem, 1.8vw, 1.1rem); color: var(--muted); line-height: 1.8; max-width: 460px; margin-top: 2rem; animation: fadeUp 1s 0.3s both; }
        .mood-display { margin-top: 1.2rem; font-size: 0.87rem; color: var(--muted); animation: fadeUp 1s 0.35s both; }
        .mood-value { color: var(--terracotta); font-weight: 600; display: inline-block; min-width: 180px; }
        .hero-cta { display: flex; gap: 1rem; margin-top: 3rem; justify-content: center; flex-wrap: wrap; animation: fadeUp 1s 0.45s both; }
        .btn-main { display: inline-flex; align-items: center; gap: 0.5rem; background: var(--ink); color: var(--bg); font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 700; text-decoration: none; padding: 0.9rem 2.2rem; border-radius: 100px; transition: transform 0.2s, background 0.2s, box-shadow 0.2s; }
        .btn-main:hover { background: var(--green); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(74,138,90,0.2); }
        .btn-ghost { display: inline-flex; align-items: center; gap: 0.5rem; background: transparent; color: var(--muted); font-family: 'Syne', sans-serif; font-size: 0.95rem; font-weight: 500; text-decoration: none; padding: 0.9rem 2rem; border-radius: 100px; border: 1.5px solid var(--border); transition: color 0.2s, border-color 0.2s, transform 0.2s; }
        .btn-ghost:hover { color: var(--ink); border-color: rgba(46,53,40,0.25); transform: translateY(-2px); }
        .scroll-hint { margin-top: 5rem; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--muted); font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; animation: fadeUp 1s 0.6s both; }
        .scroll-line { width: 1px; height: 48px; background: linear-gradient(to bottom, rgba(74,138,90,0.5), transparent); animation: scrollPulse 2.5s ease-in-out infinite; }
        .divider { height: 1px; background: linear-gradient(to right, transparent, rgba(90,110,85,0.15), transparent); margin: 0 3rem; }
        .section-wrap { max-width: 1080px; margin: 0 auto; padding: 7rem 2.5rem; }
        .label-tag { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green); margin-bottom: 1.2rem; display: flex; align-items: center; gap: 0.6rem; }
        .label-tag::before { content: ''; display: block; width: 20px; height: 1px; background: var(--green); opacity: 0.5; }
        .section-title { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4.5vw, 3.4rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.03em; max-width: 560px; margin-bottom: 1rem; color: var(--ink); }
        .section-title em { font-style: italic; color: var(--green); }
        .section-body { color: var(--muted); font-size: 1rem; line-height: 1.8; max-width: 460px; margin-bottom: 3.5rem; }
        .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.2rem; }
        .quote-section { background: var(--bg2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 8rem 2.5rem; text-align: center; }
        .quote-text { font-family: 'Playfair Display', serif; font-size: clamp(1.5rem, 4vw, 2.8rem); font-weight: 400; font-style: italic; line-height: 1.45; color: var(--ink); max-width: 700px; margin: 0 auto 1.5rem; letter-spacing: -0.02em; }
        .quote-text em { color: var(--green); font-style: normal; font-weight: 700; }
        .quote-attr { font-size: 0.75rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
        .steps-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem 6rem; align-items: start; }
        .steps-list { display: flex; flex-direction: column; gap: 2.2rem; }
        .about-section { background: var(--bg3); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .about-inner { max-width: 1080px; margin: 0 auto; padding: 7rem 2.5rem; display: grid; grid-template-columns: 1fr 1.5fr; gap: 5rem; align-items: center; }
        .about-avatar { width: 100%; aspect-ratio: 1; max-width: 300px; border-radius: 32px; background: linear-gradient(135deg, rgba(122,158,124,0.2), rgba(200,149,106,0.12)); border: 1.5px solid rgba(90,140,100,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; font-size: 5rem; position: relative; overflow: hidden; box-shadow: 0 8px 40px rgba(74,138,90,0.08); }
        .about-avatar::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 35% 35%, rgba(122,158,124,0.15), transparent 65%); }
        .about-name-badge { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--green); background: rgba(74,138,90,0.08); border: 1px solid rgba(74,138,90,0.2); border-radius: 100px; padding: 0.3rem 0.9rem; }
        .about-title-text { font-family: 'Playfair Display', serif; font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; line-height: 1.15; letter-spacing: -0.03em; margin-bottom: 1.4rem; color: var(--ink); }
        .about-title-text em { font-style: italic; color: var(--green); }
        .about-body { color: var(--muted); font-size: 1rem; line-height: 1.85; margin-bottom: 1rem; }
        .about-body strong { color: var(--ink); font-weight: 600; }
        .about-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 2rem; }
        .about-tag { font-size: 0.78rem; font-weight: 500; color: var(--muted); border: 1px solid var(--border); border-radius: 100px; padding: 0.3rem 0.85rem; background: rgba(255,255,255,0.5); }
        .cta-section { padding: 9rem 2.5rem; text-align: center; position: relative; overflow: hidden; }
        .cta-section .section-title { max-width: 700px; margin: 0.5rem auto 1rem; }
        .cta-section .section-body { max-width: 360px; margin: 0 auto 2.5rem; }
        footer { border-top: 1px solid var(--border); background: var(--bg2); padding: 2.5rem 3rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
        .footer-text { font-size: 0.78rem; color: var(--muted); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes orbFloat { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(25px,-18px) scale(1.04); } 66% { transform: translate(-18px,12px) scale(0.97); } }
        @keyframes scrollPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.9; } }
        @media (max-width: 768px) {
          nav { padding: 1.2rem 1.5rem; }
          .nav-links .nav-link { display: none; }
          .hero { padding: 8rem 1.5rem 5rem; }
          .section-wrap { padding: 5rem 1.5rem; }
          .steps-layout { grid-template-columns: 1fr; gap: 3rem; }
          .about-inner { grid-template-columns: 1fr; gap: 2.5rem; }
          .about-avatar { max-width: 180px; margin: 0 auto; }
          .divider { margin: 0 1.5rem; }
          body { cursor: auto; }
          .cursor, .cursor-ring { display: none; }
          footer { padding: 2rem 1.5rem; flex-direction: column; text-align: center; }
        }
      `}</style>

      <div className="cursor" style={{ left: cursorPos.x - 4, top: cursorPos.y - 4 }} />
      <div className="cursor-ring" style={{ left: cursorPos.x - 17, top: cursorPos.y - 17 }} />

      <nav>
        <a href="/" className="logo">calf<span>.</span></a>
        <div className="nav-links">
          <a href="#burnout" className="nav-link">what is burnout</a>
          <a href="#how" className="nav-link">how it works</a>
          <a href="#about" className="nav-link">about</a>
          <a href="/auth" className="nav-cta">get started</a>
        </div>
      </nav>

      <section className="hero">
        <div className="orb orb1" />
        <div className="orb orb2" />
        <div className="orb orb3" />
        <div className="hero-tag">🌿 burnout recovery for gen z students</div>
        <h1 className="hero-headline">
          you&apos;re not failing.<br />
          you&apos;re <em>burnt out.</em><br />
          <span className="soft">there&apos;s a difference.</span>
        </h1>
        <p className="hero-sub">
          Calf is a quiet space to check in with yourself, understand what&apos;s actually going on, and find your way back — without the pressure to be okay right now.
        </p>
        <p className="mood-display">
          right now you&apos;re probably feeling{" "}
          <span className="mood-value">{moods[moodIdx]}</span>
        </p>
        <div className="hero-cta">
          <a href="/assessment" className="btn-main">take the assessment ↗</a>
          <a href="#burnout" className="btn-ghost">learn more ↓</a>
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>scroll</span>
        </div>
      </section>

      <div className="divider" />

      <section id="burnout">
        <div className="section-wrap">
          <FadeIn>
            <div className="label-tag">understanding it</div>
            <h2 className="section-title">burnout isn&apos;t just<br /><em>being tired.</em></h2>
            <p className="section-body">
              It&apos;s a specific kind of depletion — and it shows up differently for everyone. Recognizing which type you&apos;re dealing with is the first step to actually recovering.
            </p>
          </FadeIn>
          <div className="cards-grid">
            {burnoutTypes.map((b, i) => (
              <BurnoutCard key={b.id} {...b} delay={i * 0.09} />
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      <div className="quote-section">
        <FadeIn>
          <p className="quote-text">
            &ldquo;Rest is not a <em>reward</em> for finishing everything.<br />
            it&apos;s what makes finishing anything possible.&rdquo;
          </p>
          <p className="quote-attr">— something your body&apos;s been trying to tell you</p>
        </FadeIn>
      </div>

      <section id="how">
        <div className="section-wrap">
          <div className="steps-layout">
            <div>
              <FadeIn>
                <div className="label-tag">the process</div>
                <h2 className="section-title">simple.<br /><em>honest.</em><br />actually helpful.</h2>
                <p className="section-body">
                  No toxic positivity. No 47-step programs. Just a grounded check-in and a realistic path forward.
                </p>
              </FadeIn>
            </div>
            <div className="steps-list">
              <StepItem num="01" title="Check in honestly" desc="8 questions that actually get at how you're doing — across exhaustion, detachment, and self-worth." delay={0} />
              <StepItem num="02" title="See your breakdown" desc="A clear picture of your burnout type. No sugar-coating, no alarm bells either." delay={0.1} />
              <StepItem num="03" title="Get a recovery plan" desc="Matched to your specific burnout pattern. Small, real steps — not a full life overhaul." delay={0.2} />
              <StepItem num="04" title="Track over time" desc="Come back when you need to. Watch the numbers actually shift as you recover." delay={0.3} />
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      <section id="about" className="about-section">
        <div className="about-inner">
          <FadeIn>
            <div className="about-avatar">
              <span>👨‍💻</span>
              <span className="about-name-badge">Bhargava K S</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div className="label-tag">who built this</div>
            <h2 className="about-title-text">built by a student,<br /><em>for students.</em></h2>
            <p className="about-body">Hey, I&apos;m <strong>Bhargava K S</strong> — an ECE student, and yeah, I&apos;ve been cooked before.</p>
            <p className="about-body">I built Calf because when I was burnt out, everything I found online felt designed for someone who already had their life together. Generic tips. Toxic positivity. Nothing that actually acknowledged how <strong>specific and heavy</strong> student burnout feels.</p>
            <p className="about-body">Calf is my attempt to fix that — a no-BS tool that meets you where you are, helps you understand what&apos;s actually going on, and gives you a path forward that&apos;s doable alongside a full course load.</p>
            <div className="about-tags">
              {["ECE Student", "Built with Next.js", "Open to feedback", "Free always", "No fluff"].map(t => (
                <span key={t} className="about-tag">{t}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="cta-section">
        <div className="orb orb1" style={{ opacity: 0.5 }} />
        <div className="orb orb2" style={{ opacity: 0.5 }} />
        <FadeIn>
          <div className="label-tag" style={{ justifyContent: "center" }}>when you&apos;re ready</div>
          <h2 className="section-title" style={{ margin: "0.5rem auto 1rem", fontSize: "clamp(2.2rem,5vw,4rem)" }}>
            it&apos;s okay to<br /><em>start small.</em>
          </h2>
          <p className="section-body" style={{ margin: "0 auto 2.5rem" }}>
            Two minutes. Eight questions. A little more clarity about where you&apos;re at. That&apos;s all this is.
          </p>
          <a href="/assessment" className="btn-main" style={{ fontSize: "1rem", padding: "1rem 2.5rem" }}>
            begin your check-in ↗
          </a>
        </FadeIn>
      </section>

      <footer>
        <a href="/" className="logo" style={{ fontSize: "1.2rem" }}>calf<span>.</span></a>
        <span className="footer-text">a quiet space for burnt-out students</span>
        <span className="footer-text">© 2025 calf — free, always</span>
      </footer>
    </>
  );
}
