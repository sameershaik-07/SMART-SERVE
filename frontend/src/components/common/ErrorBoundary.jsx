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
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-card text-card-foreground rounded-2xl border border-border shadow-sm m-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1 max-w-md">
            <h2 className="text-xl font-bold text-foreground">Something went wrong loading this view</h2>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. You can refresh the view or return to the dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={this.handleReset} size="sm" className="gap-2">
              <RefreshCw size={14} /> Refresh Page
            </Button>
            <Button onClick={this.handleGoHome} variant="outline" size="sm" className="gap-2">
              <Home size={14} /> Go to Services
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
