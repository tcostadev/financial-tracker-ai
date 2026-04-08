import React, { ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isFirestoreError = false;

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firestore Error (${parsed.operationType}): ${parsed.error}`;
            isFirestoreError = true;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="h-screen flex items-center justify-center bg-zinc-50 p-4">
          <Card className="max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-600 w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Something went wrong</h2>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8 text-left">
              <p className="text-red-800 text-sm font-mono break-all">
                {errorMessage}
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                Try Again
              </Button>
              {isFirestoreError && (
                <p className="text-xs text-zinc-400">
                  If this is a permission error, please check your Firestore Security Rules.
                </p>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
