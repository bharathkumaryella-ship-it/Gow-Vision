import { RouterProvider } from 'react-router';
import { router } from './routes';
import React, { ReactNode, Suspense } from 'react';
import { LanguageProvider } from './components/LanguageContext';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-100 p-8 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
            <p className="text-stone-600 mb-8 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred in the application."}
            </p>
            
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
              >
                <RefreshCw className="w-5 h-5" /> Try Again
              </button>
              
              <button 
                onClick={this.handleReset}
                className="w-full flex items-center justify-center gap-2 border-2 border-stone-100 text-stone-600 py-3 rounded-xl font-bold hover:bg-stone-50 transition-colors"
              >
                <Home className="w-5 h-5" /> Go to Home
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <div className="mt-8 text-left">
                <p className="text-xs font-mono text-stone-400 mb-2 uppercase tracking-widest">Stack Trace</p>
                <pre className="text-[10px] bg-stone-900 text-emerald-400 p-4 rounded-xl overflow-auto max-h-40 leading-relaxed custom-scrollbar">
                  {this.state.error.stack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <LanguageProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4" />
              <p className="text-stone-500 font-medium animate-pulse">Loading GowVision...</p>
            </div>
          </div>
        }>
          {this.props.children}
        </Suspense>
      </LanguageProvider>
    );
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}
