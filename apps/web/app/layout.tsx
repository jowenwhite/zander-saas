import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './components/ThemeProvider'
import { PostHogProvider } from './components/PostHogProvider'
import { PEPProvider, PersistentExecutivePanel } from './components/pep'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const sora = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sora'
})

export const metadata: Metadata = {
  title: 'Zander',
  description: 'AI-Powered Executive Team Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${inter.variable} ${sora.variable} font-sans`}>
        <PostHogProvider>
          <ThemeProvider>
            <PEPProvider>
              {children}
              <PersistentExecutivePanel />
            </PEPProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  )
}
