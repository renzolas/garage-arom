import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Garage — Arron',
  description: 'Vehicle service history tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="header">
          <div className="header-inner">
            <span className="header-logo">Garage<span>.</span></span>
            <span className="tag">MVP</span>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
