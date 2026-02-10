import { AlertCircle } from 'lucide-react-native';
import React, { Component, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <AlertCircle size={64} color="#FF6B6B" />
                    <Text style={styles.title}>Bir Hata Oluştu</Text>
                    <Text style={styles.message}>
                        Üzgünüz, beklenmeyen bir hata meydana geldi.
                    </Text>
                    {__DEV__ && this.state.error && (
                        <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                    )}
                    <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                        <Text style={styles.buttonText}>Yeniden Dene</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#141414',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 20,
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        color: '#999999',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorText: {
        fontSize: 12,
        color: '#FF6B6B',
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#CCFF00',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '600',
    },
});
