import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }
  render() {
    if (this.state.error) {
      const dev = import.meta.env.DEV;
      return (
        <div className="phone-frame">
          <div className="screen no-nav center" style={{ justifyContent: 'center', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 40 }}>😅</div>
            <h2>Oups, une erreur est survenue</h2>
            <p className="muted small">Réessaie, ou reviens à l’accueil.</p>
            {dev && (
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: 'var(--pill-danger-fg)', textAlign: 'start', maxHeight: 240, overflow: 'auto' }}>
                {String(this.state.error.stack || this.state.error)}
              </pre>
            )}
            <button className="btn btn-primary" onClick={() => { this.setState({ error: null }); window.location.href = '/home'; }}>
              Retour à l’accueil
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
