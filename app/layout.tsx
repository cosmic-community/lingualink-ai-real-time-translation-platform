import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import CosmicBadge from '@/components/CosmicBadge'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'LinguaLink AI - Real-Time Translation Platform',
  description: 'AI-powered real-time translation platform that breaks down language barriers and promotes global communication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const bucketSlug = process.env.COSMIC_BUCKET_SLUG as string

  return (
    <html lang="en">
      <head>
        <script src="/dashboard-console-capture.js" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">L</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">LinguaLink AI</h1>
                    <p className="text-xs text-muted-foreground">Real-Time Translation</p>
                  </div>
                </div>
                
                <nav className="hidden md:flex items-center gap-6">
                  <a href="#translate" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Translate
                  </a>
                  <a href="#conversation" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Conversation
                  </a>
                  <a href="#history" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    History
                  </a>
                </nav>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="border-t border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 mt-12">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>© 2024 LinguaLink AI. Breaking down language barriers worldwide.</p>
              </div>
            </div>
          </footer>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'bg-card border border-border text-foreground',
          }}
        />
        
        <CosmicBadge bucketSlug={bucketSlug} />
      </body>
    </html>
  )
}