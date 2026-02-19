import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
                    <h2 className="text-2xl font-bold text-red-600">Something went wrong.</h2>
                    <p className="text-gray-500 mt-2">Please try refreshing the page or contact support if the problem persists.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 btn-primary"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
