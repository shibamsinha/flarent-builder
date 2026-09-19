import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  nodeId: string;
  type: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * One broken component must never take the editor down with it. Each node is
 * isolated; a failure renders a recoverable placeholder in its place.
 */
export class NodeErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[flarent] component "${this.props.type}" failed to render`, error, info);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="fl-node-error" data-fl-id={this.props.nodeId} data-fl-type={this.props.type}>
          <strong>{this.props.type}</strong> could not be displayed
          <span>{this.state.error.message}</span>
        </div>
      );
    }
    return this.props.children;
  }
}
