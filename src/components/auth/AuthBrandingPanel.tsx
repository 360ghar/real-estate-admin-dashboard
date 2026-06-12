import { Building2, Shield } from 'lucide-react'

interface AuthBrandingPanelProps {
  title: string
  subtitle: string
  features: string[]
}

/**
 * Left-side branding panel shown on large screens during auth flows
 * (login, signup). Extracted to avoid copy-pasting across auth pages.
 */
export function AuthBrandingPanel({ title, subtitle, features }: AuthBrandingPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-primary-foreground/10 rounded-full backdrop-blur-sm">
            <Building2 className="h-16 w-16" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl mb-8 opacity-90">{subtitle}</p>
        <div className="space-y-4 text-sm opacity-75">
          {features.map((f) => (
            <p key={f}>✓ {f}</p>
          ))}
        </div>
      </div>
      <div className="absolute bottom-8 left-8">
        <Shield className="h-8 w-8 opacity-50" />
      </div>
    </div>
  )
}
