import React from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-indigo-500/20">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 dark:shadow-black/20 text-center space-y-6 animate-fade-in relative overflow-hidden">
            
            {/* Top glowing backdrop */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Error Graphic */}
            <div className="relative mx-auto inline-flex items-center justify-center p-4 bg-rose-100 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 rounded-2xl">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Main Information */}
            <div className="space-y-2">
              <h1 className="text-xl font-sans tracking-tight font-extrabold text-slate-800 dark:text-slate-100">
                Something went wrong
              </h1>
              <p className="text-xs sm:text-xs font-sans text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                DeltaClause encountered an unexpected render interruption. Refreshing your local dashboard usually restores stable operation.
              </p>
            </div>

            {/* Refresh Action Trigger */}
            <div className="pt-2">
              <button
                id="error-boundary-refresh-button"
                onClick={this.handleReset}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider select-none cursor-pointer hover:shadow-lg transition-all border border-transparent shadow-md shadow-slate-900/5 dark:shadow-indigo-950/10"
              >
                <RefreshCw className="w-4 h-4 animate-spin-reverse" />
                <span>Quick Refresh & Recover</span>
              </button>
            </div>

            {/* Collapsible Diagnostics for internal logs info */}
            {this.state.error && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="inline-flex items-center justify-center gap-1.5 text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 cursor-pointer transition-colors"
                >
                  <span>{this.state.showDetails ? 'Hide' : 'Show'} System Log</span>
                  {this.state.showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 text-left bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/40 font-mono text-[9px] text-rose-500 overflow-x-auto max-h-40 scrollbar-thin">
                    <div className="font-bold mb-1 uppercase tracking-wide">Error Captured:</div>
                    <div className="whitespace-pre-wrap">{this.state.error.stack || this.state.error.message}</div>
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-2 text-slate-500 border-t border-slate-200/40 dark:border-slate-800/50 pt-2">
                        <div className="font-bold mb-1 uppercase tracking-wide">Component Stack:</div>
                        <div className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
          </div>
          
          {/* Back Home Link */}
          <div className="mt-8 flex items-center gap-2 text-slate-400 text-[10px] font-mono tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5" />
            <a 
              href="/"
              className="hover:underline hover:text-slate-600 dark:hover:text-slate-200"
            >
              Return to Catalog Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
