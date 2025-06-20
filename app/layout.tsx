import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AIR-BATTLE-ROYALE-PAK-VS-IND',
  description: 'Created with Love',
  generator: 'AIR-BATTLE-ROYALE-PAK-VS-IND',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
