import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ServiceHub Uncaught UI Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/services'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="m-4 flex min-h-[400px] flex-col items-center justify-center space-y-5 rounded-lg border border-hairline bg-card p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent-amber/25 bg-accent-amber/10 text-accent-amber">
            <AlertTriangle size={24} strokeWidth={1.6} />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="font-display text-2xl tracking-[-0.02em] text-ink">
              Something went wrong loading this view
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              An unexpected error occurred. You can refresh the view or return to the dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Button onClick={this.handleReset} size="sm" icon={RefreshCw}>
              Refresh page
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" size="sm" icon={Home}>
              Go to services
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
