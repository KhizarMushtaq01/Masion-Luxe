import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Jost, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.03em',
              background: '#0a0a0a',
              color: '#fff',
              borderRadius: '0',
              padding: '14px 20px',
            },
            success: {
              iconTheme: { primary: '#c9a96e', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
            duration: 3500,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
