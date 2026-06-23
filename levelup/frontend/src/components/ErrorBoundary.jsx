import React from 'react';
import { AlertOctagon, RefreshCw, Trash2 } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-page">
          <div className="error-boundary-card">
            <div className="error-boundary-icon" style={{ display: 'flex', justifyContent: 'center', color: 'var(--error)', marginBottom: 20 }}>
              <AlertOctagon size={64} />
            </div>
            <h2>Application Crash</h2>
            <p>An unexpected error occurred in the interface. We caught the crash safely.</p>
            {this.state.error && (
              <pre className="error-boundary-details">
                {this.state.error.toString()}
                {"\n"}
                {this.state.error.stack?.split("\n").slice(0, 3).join("\n")}
              </pre>
            )}
            <div className="error-boundary-actions">
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <RefreshCw size={14} style={{ animation: 'spin 3s linear infinite' }} /> Reload Page
                </span>
              </button>
              <button className="btn btn-secondary" onClick={() => {
                localStorage.clear();
                window.location.href = '/';
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={14} /> Clear Data &amp; Home
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
