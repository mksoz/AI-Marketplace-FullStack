
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class DebugErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 m-4 bg-red-50 border border-red-200 rounded-xl max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-red-700 mb-4">Algo salió mal (Debug Mode)</h1>
                    <p className="text-red-900 font-bold">{this.state.error?.message}</p>
                    <pre className="mt-4 p-4 bg-gray-900 text-white rounded-lg text-xs overflow-auto h-64">
                        {this.state.errorInfo?.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Recargar Página
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default DebugErrorBoundary;
