import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
      <App />
      <Toaster
        position="bottom-right"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              'sh-card !rounded-lg !border-hairline !bg-popover !text-ink !shadow-[var(--shadow-lift)] !font-sans',
            title: '!text-ink !text-sm !font-medium',
            description: '!text-muted-foreground !text-xs',
            actionButton: '!bg-primary !text-primary-foreground !rounded-sm',
            cancelButton: '!bg-surface-soft !text-ink !rounded-sm',
            closeButton: '!bg-canvas !border-hairline !text-muted-foreground',
          },
        }}
      />
    </MotionConfig>
  </StrictMode>,
)
