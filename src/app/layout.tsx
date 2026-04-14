import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | CamStreamer BR',
    default: 'CamStreamer BR — Transmissao Profissional pelo Celular',
  },
  description: 'Transforme seu Android em uma camera de transmissao profissional. RTMP, HLS, SRT diretamente do seu dispositivo.',
  metadataBase: new URL('https://infrabr.site'),
  openGraph: {
    siteName: 'CamStreamer BR',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
