import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error("ErrorBoundary: getDerivedStateFromError called with:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary: componentDidCatch called with:", error, errorInfo);
  }

  render() {
    console.log("ErrorBoundary render called, hasError:", this.state.hasError);
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white flex items-center justify-center">
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Application Error</h1>
            <p className="text-gray-300 mb-4">
              Something went wrong. Please check the console for details and try reloading the page.
            </p>
            <details className="text-left mb-4">
              <summary className="cursor-pointer text-purple-400 hover:text-purple-300">Error Details</summary>
              <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">{this.state.error?.message}</pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors mr-4"
            >
              Reload Page
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
