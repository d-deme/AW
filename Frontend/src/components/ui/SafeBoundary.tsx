import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export interface SafeBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

export interface SafeBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SafeBoundary extends Component<SafeBoundaryProps, SafeBoundaryState> {
  public override state: SafeBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): SafeBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-neutral-50 rounded-3xl border border-neutral-100 mt-20">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-navy mb-4">Something went wrong</h2>
            <p className="text-neutral-500 mb-8 font-medium">
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCcw size={16} /> Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
