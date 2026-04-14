import Link from 'next/link'

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f3638 0%, #01696f 50%, #2793a0 100%)' }}>
        <nav className="container flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label="CamStreamer BR">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15"/>
              <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="18" r="3" fill="white"/>
              <path d="M26 12l4-3v14l-4-3V12z" fill="white"/>
            </svg>
            <span className="text-white font-bold text-lg tracking-tight">CamStreamer BR</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-secondary" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              Entrar
            </Link>
            <Link href="/register" className="btn" style={{ background: 'white', color: '#01696f', fontWeight: 600 }}>
              Comecar gratis
            </Link>
          </div>
        </nav>

        <div className="container flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-8" style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Versao 5 disponivel agora
          </div>
          <h1 className="text-5xl font-bold text-white mb-6" style={{ lineHeight: 1.1 }}>
            Transmita ao vivo<br/>
            <span style={{ color: '#7dcdd6' }}>direto do seu Android</span>
          </h1>
          <p className="text-xl mb-10 max-w-2xl" style={{ color: 'rgba(255,255,255,0.8)' }}>
            RTMP, HLS e SRT com qualidade profissional. Configure perfis de streaming, overlays e muito mais com o CAMSTREAMER BR.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="https://github.com/luanscps/CAMSTREAMER-BR" target="_blank" rel="noopener noreferrer"
               className="btn" style={{ background: 'white', color: '#01696f', fontWeight: 600, fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Ver no GitHub
            </a>
            <Link href="/register"
               className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: '1rem', padding: '0.75rem 2rem' }}>
              Criar conta gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24" style={{ background: '#f7f6f2' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#28251d' }}>Tudo que voce precisa para transmitir</h2>
          <p className="text-center mb-16" style={{ color: '#7a7974', fontSize: '1.1rem' }}>Plano BASIC gratuito. Plano PRO com recursos avancados.</p>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {[
              { icon: '📡', title: 'RTMP / HLS / SRT', desc: 'Suporte completo aos principais protocolos de streaming profissional.' },
              { icon: '🔐', title: 'Licenca por dispositivo', desc: 'Cada licenca vincula ao seu device. Seguro e controlado.' },
              { icon: '🎛️', title: 'Perfis de transmissao', desc: 'Salve configuracoes de qualidade e destino para uso rapido.' },
              { icon: '🖼️', title: 'Overlay PRO', desc: 'Adicione textos, logos e imagens na sua transmissao ao vivo.' },
              { icon: '📊', title: 'Painel de controle', desc: 'Gerencie sua licenca, devices e plano diretamente neste painel.' },
              { icon: '🌐', title: 'Integrado ao MediaMTX', desc: 'Compativel com o servidor MediaMTX para relay e gravacao.' },
            ].map((f, i) => (
              <div key={i} className="card">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: '#28251d', fontSize: '1.05rem' }}>{f.title}</h3>
                <p style={{ color: '#7a7974', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-24" style={{ background: 'white' }}>
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-16" style={{ color: '#28251d' }}>Planos simples e transparentes</h2>
          <div className="grid gap-8 max-w-3xl mx-auto" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {/* BASIC */}
            <div className="card" style={{ border: '1px solid rgba(40,37,29,0.1)' }}>
              <div className="mb-6">
                <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: '#f0fafb', color: '#01696f' }}>BASIC</span>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: '#28251d' }}>Gratis</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" style={{ color: '#7a7974', fontSize: '0.9rem' }}>
                <li>✅ 1 dispositivo</li>
                <li>✅ RTMP basico</li>
                <li>✅ 1 perfil de streaming</li>
                <li>❌ Overlay</li>
                <li>❌ Multiplos perfis</li>
              </ul>
              <Link href="/register" className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>Comecar gratis</Link>
            </div>
            {/* PRO */}
            <div className="card" style={{ border: '2px solid #01696f', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#01696f', color: 'white' }}>RECOMENDADO</span>
              </div>
              <div className="mb-6">
                <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: '#f0fafb', color: '#01696f' }}>PRO</span>
                <div className="mt-4">
                  <span className="text-4xl font-bold" style={{ color: '#28251d' }}>R$ 19</span>
                  <span style={{ color: '#7a7974' }}>/mes</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8" style={{ color: '#7a7974', fontSize: '0.9rem' }}>
                <li>✅ Ate 5 dispositivos</li>
                <li>✅ RTMP + HLS + SRT</li>
                <li>✅ 10 perfis de streaming</li>
                <li>✅ Overlay customizavel</li>
                <li>✅ Suporte prioritario</li>
              </ul>
              <Link href="/register" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>Assinar PRO</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ background: '#0f3638', color: 'rgba(255,255,255,0.6)' }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="8" fill="white" fillOpacity="0.15"/>
              <circle cx="18" cy="18" r="7" stroke="white" strokeWidth="2"/>
              <circle cx="18" cy="18" r="3" fill="white"/>
            </svg>
            <span className="text-white font-semibold">CamStreamer BR</span>
          </div>
          <p className="text-sm">© 2026 CamStreamer BR · infrabr.site · Todos os direitos reservados</p>
          <div className="flex gap-4 text-sm">
            <a href="https://github.com/luanscps/CAMSTREAMER-BR" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
