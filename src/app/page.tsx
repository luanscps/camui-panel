import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&family=Roboto+Mono:wght@400;500;700&display=swap');

        :root {
          --bg:      #f6f7fb;
          --bg2:     #ffffff;
          --bg3:     #eff2fb;
          --border:  #e3e7f5;
          --purple:  #7c3aed;
          --cyan:    #06b6d4;
          --pink:    #ec4899;
          --orange:  #f97316;
          --green:   #10b981;
          --text:    #0f172a;
          --muted:   #475569;
          --font-body: 'Roboto', sans-serif;
          --font-mono: 'Roboto Mono', monospace;
        }

        .lp * { margin: 0; padding: 0; box-sizing: border-box; }

        .lp {
          font-family: var(--font-body);
          background-color: var(--bg);
          color: var(--text);
          line-height: 1.7;
          overflow-x: hidden;
          min-height: 100vh;
          position: relative;
        }

        .lp::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
          z-index: 0;
        }

        /* NAV */
        .lp-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(246,247,251,0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 16px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .lp-nav-logo {
          font-family: var(--font-mono);
          font-size: 1em;
          font-weight: 700;
          background: linear-gradient(90deg, var(--purple), var(--cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-decoration: none;
          letter-spacing: -0.5px;
        }
        .lp-nav-links {
          display: flex;
          gap: 28px;
          align-items: center;
          list-style: none;
        }
        .lp-nav-links a {
          font-family: var(--font-body);
          color: var(--muted);
          text-decoration: none;
          font-size: 0.88em;
          font-weight: 500;
          letter-spacing: 0.3px;
          transition: color 0.2s;
          position: relative;
        }
        .lp-nav-links a::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0; right: 0;
          height: 1px;
          background: var(--cyan);
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .lp-nav-links a:hover { color: var(--cyan); }
        .lp-nav-links a:hover::after { transform: scaleX(1); }
        .lp-btn-nav {
          padding: 8px 20px;
          border-radius: 6px;
          background: linear-gradient(135deg, var(--purple), var(--pink));
          color: #fff !important;
          font-size: 0.85em !important;
          font-weight: 700 !important;
          text-decoration: none;
          transition: all 0.25s;
          -webkit-text-fill-color: #fff !important;
        }
        .lp-btn-nav::after { display: none !important; }
        .lp-btn-nav:hover { box-shadow: 0 4px 16px rgba(124,58,237,0.35); transform: translateY(-1px); }

        /* HERO */
        .lp-hero {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 48px 80px;
        }
        .lp-hero-tag {
          display: inline-block;
          padding: 5px 14px;
          border: 1px solid var(--green);
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.72em;
          color: var(--green);
          letter-spacing: 1px;
          margin-bottom: 20px;
          background: rgba(16,185,129,0.08);
        }
        .lp-hero h1 {
          font-family: var(--font-body);
          font-size: clamp(2.4em, 5vw, 3.8em);
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }
        .lp-hero h1 .grad {
          background: linear-gradient(90deg, var(--purple), var(--cyan), var(--pink));
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradMove 4s linear infinite;
        }
        @keyframes gradMove {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .lp-hero-sub {
          font-family: var(--font-mono);
          font-size: 0.95em;
          color: var(--muted);
          margin-bottom: 36px;
          max-width: 600px;
        }
        .lp-hero-sub .cursor {
          display: inline-block;
          width: 2px; height: 1em;
          background: var(--cyan);
          margin-left: 2px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0; } }

        .lp-hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 56px; }
        .lp-cta-primary {
          font-family: var(--font-body);
          padding: 13px 30px;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.92em;
          text-decoration: none;
          background: linear-gradient(135deg, var(--purple), var(--pink));
          color: #fff;
          box-shadow: 0 0 20px rgba(124,58,237,0.22);
          transition: all 0.25s;
          -webkit-text-fill-color: #fff;
        }
        .lp-cta-primary:hover { box-shadow: 0 0 35px rgba(124,58,237,0.38); transform: translateY(-2px); }
        .lp-cta-outline {
          font-family: var(--font-body);
          padding: 13px 30px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.92em;
          text-decoration: none;
          border: 1px solid var(--cyan);
          color: #0e7490;
          background: rgba(6,182,212,0.08);
          transition: all 0.25s;
        }
        .lp-cta-outline:hover { background: rgba(6,182,212,0.14); box-shadow: 0 0 20px rgba(6,182,212,0.18); transform: translateY(-2px); }

        .lp-hero-stats { display: flex; gap: 48px; flex-wrap: wrap; }
        .lp-stat-num {
          font-family: var(--font-mono);
          font-size: 1.9em;
          font-weight: 700;
          color: var(--cyan);
          text-shadow: 0 0 20px rgba(6,182,212,0.22);
          display: block;
        }
        .lp-stat-lbl {
          font-family: var(--font-body);
          font-size: 0.78em;
          color: var(--muted);
          font-weight: 500;
          letter-spacing: 0.3px;
        }

        /* SECTIONS */
        .lp-section {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }
        .lp-section-tag {
          font-family: var(--font-mono);
          font-size: 0.72em;
          color: var(--purple);
          letter-spacing: 2px;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .lp-section-title {
          font-family: var(--font-body);
          font-size: clamp(1.5em, 3vw, 2em);
          font-weight: 800;
          color: var(--text);
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }
        .lp-section-sub {
          font-family: var(--font-body);
          color: var(--muted);
          font-size: 0.95em;
          margin-bottom: 40px;
          max-width: 560px;
        }
        .lp-divider {
          height: 1px;
          background: var(--border);
          margin-bottom: 64px;
        }

        /* FEATURES GRID */
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .lp-feat-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 28px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .lp-feat-card:hover {
          border-color: rgba(124,58,237,0.35);
          box-shadow: 0 8px 32px rgba(124,58,237,0.08);
        }
        .lp-feat-icon {
          font-size: 1.6em;
          margin-bottom: 14px;
          display: block;
        }
        .lp-feat-title {
          font-family: var(--font-body);
          font-size: 0.95em;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
        }
        .lp-feat-desc {
          font-family: var(--font-body);
          font-size: 0.87em;
          color: var(--muted);
          line-height: 1.7;
        }
        .lp-feat-tag {
          display: inline-block;
          margin-top: 14px;
          padding: 3px 10px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.72em;
          font-weight: 500;
          background: rgba(6,182,212,0.10);
          color: #0e7490;
          border: 1px solid rgba(6,182,212,0.3);
        }
        .lp-feat-tag.pro {
          background: rgba(124,58,237,0.10);
          color: var(--purple);
          border-color: rgba(124,58,237,0.3);
        }

        /* PRICING */
        .lp-pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          max-width: 700px;
        }
        .lp-plan-card {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          transition: all 0.3s;
        }
        .lp-plan-card.pro {
          border-color: rgba(124,58,237,0.45);
          background: linear-gradient(135deg, #faf8ff 0%, #f5f0ff 100%);
          box-shadow: 0 8px 32px rgba(124,58,237,0.10);
        }
        .lp-plan-badge {
          display: inline-block;
          padding: 3px 12px;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.72em;
          font-weight: 700;
          letter-spacing: 1px;
          background: rgba(124,58,237,0.12);
          color: var(--purple);
          border: 1px solid rgba(124,58,237,0.3);
          margin-bottom: 16px;
        }
        .lp-plan-badge.basic {
          background: rgba(6,182,212,0.10);
          color: #0e7490;
          border-color: rgba(6,182,212,0.3);
        }
        .lp-plan-price {
          font-family: var(--font-mono);
          font-size: 2.4em;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 4px;
          line-height: 1;
        }
        .lp-plan-price span {
          font-size: 0.45em;
          color: var(--muted);
          font-weight: 400;
        }
        .lp-plan-desc {
          font-size: 0.85em;
          color: var(--muted);
          margin-bottom: 24px;
          font-family: var(--font-body);
        }
        .lp-plan-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          font-family: var(--font-body);
        }
        .lp-plan-features li {
          font-size: 0.88em;
          color: var(--text);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-plan-features li.off { color: var(--muted); }
        .lp-plan-features li::before { content: '✓'; color: var(--green); font-weight: 700; font-size: 0.9em; flex-shrink: 0; }
        .lp-plan-features li.off::before { content: '×'; color: #cbd5e1; }
        .lp-plan-btn {
          display: block;
          text-align: center;
          padding: 12px 0;
          border-radius: 8px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 0.9em;
          text-decoration: none;
          transition: all 0.25s;
          border: 1px solid var(--border);
          color: var(--muted);
          background: transparent;
        }
        .lp-plan-btn:hover { border-color: var(--cyan); color: #0e7490; }
        .lp-plan-btn.primary {
          background: linear-gradient(135deg, var(--purple), var(--pink));
          color: #fff;
          border: none;
          box-shadow: 0 0 20px rgba(124,58,237,0.22);
          -webkit-text-fill-color: #fff;
        }
        .lp-plan-btn.primary:hover { box-shadow: 0 0 35px rgba(124,58,237,0.38); transform: translateY(-2px); }

        /* PROTOCOL BADGES */
        .lp-proto-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 48px;
        }
        .lp-proto {
          padding: 8px 18px;
          border-radius: 6px;
          font-family: var(--font-mono);
          font-size: 0.82em;
          font-weight: 700;
          letter-spacing: 1px;
          border: 1px solid;
        }
        .lp-proto.rtmp { background: rgba(236,72,153,0.08); color: #be185d; border-color: rgba(236,72,153,0.3); }
        .lp-proto.hls  { background: rgba(6,182,212,0.08);  color: #0e7490; border-color: rgba(6,182,212,0.3);  }
        .lp-proto.srt  { background: rgba(124,58,237,0.08); color: var(--purple); border-color: rgba(124,58,237,0.3); }
        .lp-proto.mediamtx { background: rgba(16,185,129,0.08); color: #047857; border-color: rgba(16,185,129,0.3); }

        /* FOOTER */
        .lp-footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border);
          padding: 28px 48px;
          text-align: center;
          color: var(--muted);
          font-family: var(--font-mono);
          font-size: 0.8em;
        }
        .lp-footer .p { color: var(--purple); }
        .lp-footer .c { color: var(--cyan); }

        @media (max-width: 768px) {
          .lp-nav { padding: 14px 20px; }
          .lp-nav-links { gap: 14px; }
          .lp-hero { padding: 60px 20px 40px; }
          .lp-section { padding: 0 20px 60px; }
          .lp-hero-stats { gap: 28px; }
          .lp-footer { padding: 24px 20px; }
        }
      `}</style>

      <div className="lp">
        {/* NAV */}
        <nav className="lp-nav">
          <Link href="/" className="lp-nav-logo">CAMSTREAMER<span style={{color:'var(--pink)'}}>-BR</span></Link>
          <ul className="lp-nav-links">
            <li><a href="#recursos">Recursos</a></li>
            <li><a href="#planos">Planos</a></li>
            <li><a href="https://github.com/luanscps/CAMSTREAMER-BR" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            <li><Link href="/login" className="lp-btn-nav">Entrar</Link></li>
          </ul>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-hero-tag">● v5 — CAMUI disponível agora</div>
          <h1>Transmita ao vivo<br /><span className="grad">direto do seu Android</span></h1>
          <p className="lp-hero-sub">
            RTMP, HLS e SRT com qualidade profissional. Configure perfis de streaming, overlays e muito mais.<span className="cursor" />
          </p>
          <div className="lp-hero-cta">
            <Link href="/register" className="lp-cta-primary">Criar conta grátis</Link>
            <a href="https://github.com/luanscps/CAMSTREAMER-BR" target="_blank" rel="noopener noreferrer" className="lp-cta-outline">Ver no GitHub →</a>
          </div>
          <div className="lp-hero-stats">
            <div>
              <span className="lp-stat-num">3</span>
              <span className="lp-stat-lbl">Protocolos</span>
            </div>
            <div>
              <span className="lp-stat-num">v5</span>
              <span className="lp-stat-lbl">Versão atual</span>
            </div>
            <div>
              <span className="lp-stat-num">Android</span>
              <span className="lp-stat-lbl">Plataforma</span>
            </div>
            <div>
              <span className="lp-stat-num">Free</span>
              <span className="lp-stat-lbl">Plano Basic</span>
            </div>
          </div>
        </section>

        <div className="lp-divider" style={{maxWidth:'1100px',margin:'0 auto 0',position:'relative',zIndex:1}} />

        {/* PROTOCOLOS */}
        <section className="lp-section" id="recursos" style={{paddingTop:'64px'}}>
          <div className="lp-section-tag">// protocolos suportados</div>
          <h2 className="lp-section-title">Tudo que você precisa para transmitir</h2>
          <p className="lp-section-sub">Compatível com os principais protocolos e servidores de streaming profissional.</p>
          <div className="lp-proto-row">
            <span className="lp-proto rtmp">RTMP</span>
            <span className="lp-proto hls">HLS</span>
            <span className="lp-proto srt">SRT</span>
            <span className="lp-proto mediamtx">MediaMTX</span>
          </div>

          <div className="lp-features-grid">
            <div className="lp-feat-card">
              <span className="lp-feat-icon">📡</span>
              <div className="lp-feat-title">RTMP / HLS / SRT</div>
              <p className="lp-feat-desc">Suporte completo aos principais protocolos de streaming profissional. Transmita para qualquer plataforma ou servidor.</p>
              <span className="lp-feat-tag">BASIC + PRO</span>
            </div>
            <div className="lp-feat-card">
              <span className="lp-feat-icon">🔑</span>
              <div className="lp-feat-title">Licença por dispositivo</div>
              <p className="lp-feat-desc">Cada licença é vinculada ao seu device. Sistema seguro de ativação com verificação na inicialização do app.</p>
              <span className="lp-feat-tag">BASIC + PRO</span>
            </div>
            <div className="lp-feat-card">
              <span className="lp-feat-icon">🎛️</span>
              <div className="lp-feat-title">Perfis de transmissão</div>
              <p className="lp-feat-desc">Salve configurações de qualidade, destino e codec para usar rapidamente em suas transmissões futuras.</p>
              <span className="lp-feat-tag">BASIC + PRO</span>
            </div>
            <div className="lp-feat-card">
              <span className="lp-feat-icon">🖼️</span>
              <div className="lp-feat-title">Overlay customizável</div>
              <p className="lp-feat-desc">Adicione textos, logos e imagens sobre sua transmissão ao vivo em tempo real com o plano Pro.</p>
              <span className="lp-feat-tag pro">SOMENTE PRO</span>
            </div>
            <div className="lp-feat-card">
              <span className="lp-feat-icon">📊</span>
              <div className="lp-feat-title">Painel de controle</div>
              <p className="lp-feat-desc">Gerencie sua licença, dispositivos ativos e plano diretamente neste painel web — CAMUI Panel.</p>
              <span className="lp-feat-tag">BASIC + PRO</span>
            </div>
            <div className="lp-feat-card">
              <span className="lp-feat-icon">⚡</span>
              <div className="lp-feat-title">Integrado ao MediaMTX</div>
              <p className="lp-feat-desc">Compatível com servidor MediaMTX para relay, gravação e redistribuição de streams. Auto-configuração incluída.</p>
              <span className="lp-feat-tag pro">SOMENTE PRO</span>
            </div>
          </div>
        </section>

        <div className="lp-divider" style={{maxWidth:'1100px',margin:'0 auto',position:'relative',zIndex:1}} />

        {/* PLANOS */}
        <section className="lp-section" id="planos" style={{paddingTop:'64px'}}>
          <div className="lp-section-tag">// planos e preços</div>
          <h2 className="lp-section-title">Simples e transparente</h2>
          <p className="lp-section-sub">Comece grátis com o plano Basic. Faça upgrade para Pro quando precisar de mais poder.</p>

          <div className="lp-pricing-grid">
            <div className="lp-plan-card">
              <div className="lp-plan-badge basic">BASIC</div>
              <div className="lp-plan-price">Grátis<span> / sempre</span></div>
              <p className="lp-plan-desc">Para quem está começando ou transmite ocasionalmente.</p>
              <ul className="lp-plan-features">
                <li>1 dispositivo ativo</li>
                <li>RTMP básico</li>
                <li>1 perfil de streaming</li>
                <li>Acesso ao painel CAMUI</li>
                <li className="off">Overlay customizável</li>
                <li className="off">HLS + SRT</li>
                <li className="off">Múltiplos perfis</li>
                <li className="off">Suporte prioritário</li>
              </ul>
              <Link href="/register" className="lp-plan-btn">Criar conta grátis</Link>
            </div>

            <div className="lp-plan-card pro">
              <div className="lp-plan-badge">PRO</div>
              <div className="lp-plan-price">Em breve<span> / detalhes</span></div>
              <p className="lp-plan-desc">Para streamers profissionais que precisam do máximo.</p>
              <ul className="lp-plan-features">
                <li>Até 5 dispositivos</li>
                <li>RTMP + HLS + SRT</li>
                <li>10 perfis de streaming</li>
                <li>Overlay customizável</li>
                <li>Integração MediaMTX</li>
                <li>Stream em 1080p / 4K</li>
                <li>Sem watermark</li>
                <li>Suporte prioritário</li>
              </ul>
              <Link href="/register" className="lp-plan-btn primary">Quero o Pro →</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <p>
            <span className="p">CAMSTREAMER</span><span className="c">-BR</span>
            {' '}·{' '}
            Desenvolvido por{' '}
            <a href="https://luanscps.github.io" target="_blank" rel="noopener noreferrer" style={{color:'var(--cyan)',textDecoration:'none'}}>@luanscps</a>
            {' '}·{' '}
            <a href="https://github.com/luanscps/CAMSTREAMER-BR" target="_blank" rel="noopener noreferrer" style={{color:'var(--muted)',textDecoration:'none'}}>GitHub</a>
          </p>
        </footer>
      </div>
    </>
  )
}
