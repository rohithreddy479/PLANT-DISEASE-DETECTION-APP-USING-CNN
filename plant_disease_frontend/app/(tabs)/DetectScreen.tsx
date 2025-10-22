// detectScreen.tsx (Simplified, Nature-Themed UI with Scroll Fix)

import React, { useState, useCallback } from "react";
import {
    View,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from 'axios';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming 
} from 'react-native-reanimated';

// 🚨 CRITICAL: Use your computer's actual local IP address
const API_URL = "http://192.168.0.143:8000/plants/detect"; 

// --- Custom Animated Button Component ---
const AnimatedButton = ({ title, onPress, disabled, style, textStyle, icon }: any) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            opacity: withTiming(disabled ? 0.6 : 1, { duration: 200 }),
        };
    });

    const handlePressIn = () => {
        if (!disabled) scale.value = withSpring(0.95);
    };

    const handlePressOut = () => {
        if (!disabled) scale.value = withSpring(1);
    };

    return (
        <TouchableOpacity 
            onPress={onPress} 
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
            disabled={disabled}
            style={{ width: '48%' }} // Ensure buttons take up equal space
        >
            <Animated.View style={[styles.button, style, animatedStyle]}>
                {/* Simple Icon placeholder if needed, using text for simplicity */}
                {icon && <Text style={styles.buttonIcon}>{icon}</Text>} 
                <Text style={[styles.buttonText, textStyle]}>{title}</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};
// ----------------------------------------


export default function DetectScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Animation for the image card appearance
    const imageOpacity = useSharedValue(0);
    const imageScale = useSharedValue(0.5);
    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: imageOpacity.value,
            transform: [{ scale: imageScale.value }],
        };
    });

    const triggerImageAnimation = useCallback(() => {
        imageOpacity.value = withTiming(1, { duration: 500 });
        imageScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    }, [imageOpacity, imageScale]);

    // --- Image Picker Logic ---
    const pickImage = async (source: 'camera' | 'library') => {
        const permissionRequest = 
            source === 'camera'
                ? ImagePicker.requestCameraPermissionsAsync()
                : ImagePicker.requestMediaLibraryPermissionsAsync();
        
        const { status } = await permissionRequest;
        
        if (status !== "granted") {
            Alert.alert("Permission denied!", `Please allow ${source} access.`);
            return;
        }

        const pickerOptions: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, 
            quality: 0.7, 
        };

        let result;
        if (source === 'camera') {
            result = await ImagePicker.launchCameraAsync(pickerOptions);
        } else {
            result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
        }

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            setPrediction(null);
            triggerImageAnimation(); 
        }
    };
    // ----------------------------


    const sendToBackend = async () => {
        if (!imageUri) {
            Alert.alert("Select an image first!");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        
        const filename = imageUri.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const fileExtension = match ? match[1] : 'jpeg';
        const type = `image/${fileExtension}`.toLowerCase(); 
        const normalizedUri = imageUri.startsWith('file://') || Platform.OS === 'web' ? imageUri : `file://${imageUri}`; 

        formData.append("file", {
            uri: normalizedUri, 
            name: filename,
            type, 
        } as any);

        try {
            const response = await axios.post(API_URL, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 15000 
            });

            setPrediction(response.data);
            
        } catch (error: any) {
            console.error("Axios Error:", error);
            let errorMessage = "Failed to connect to server.";
            
            if (error.response) {
                const status = error.response.status;
                if (error.response.data && error.response.data.detail) {
                    errorMessage = Array.isArray(error.response.data.detail) ? error.response.data.detail[0].msg : error.response.data.detail;
                } else {
                    errorMessage = `Server Error: Status ${status}.`;
                }
            } else if (error.request) {
                errorMessage = "Network Error: Could not reach server. Check IP and firewall.";
            } else {
                errorMessage = "Unknown Error. Check network configuration.";
            }
            
            Alert.alert("Prediction Failed", errorMessage);
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* ScrollView is now the main container, allowing all content to scroll */}
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.headerTitle}>Leaf Doctor 🌱</Text>

                <View style={styles.buttonGroup}>
                    <AnimatedButton 
                        title="Gallery" 
                        icon="🖼️"
                        onPress={() => pickImage('library')} 
                        style={styles.galleryButton}
                    />
                    <AnimatedButton 
                        title="Camera" 
                        icon="📸"
                        onPress={() => pickImage('camera')} 
                        style={styles.cameraButton}
                    />
                </View>

                {imageUri ? (
                    <Animated.View style={[styles.imageWrapper, imageAnimatedStyle]}>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                    </Animated.View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>Select an image to start analysis.</Text>
                    </View>
                )}
                
                {imageUri && (
                    <AnimatedButton 
                        title={loading ? "ANALYZING..." : "ANALYZE PLANT"} 
                        onPress={sendToBackend} 
                        disabled={loading} 
                        style={[styles.detectButton, {backgroundColor: loading ? '#2E8B5799' : '#2E8B57'}]} // Tree Green
                        textStyle={styles.detectButtonText}
                    />
                )}
                
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2E8B57" />
                        <Text style={styles.loadingText}>Please wait, analyzing image...</Text>
                    </View>
                )}
                
                {prediction && (
                    <View style={styles.result}>
                        <Text style={styles.resultTitle}>Diagnosis</Text>
                        <View style={styles.separator} />
                        
                        <ResultItem label="Disease" value={prediction.disease} highlight={true} />
                        <ResultItem label="Confidence" value={`${Math.round(prediction.confidence)}%`} />
                        
                        <Text style={styles.subTitle}>Description</Text>
                        <Text style={styles.resultDescription}>{prediction.description}</Text>
                        
                        <Text style={styles.subTitle}>Recommended Treatment</Text>
                        <Text style={styles.resultDescription}>{prediction.treatment}</Text>
                    </View>
                )}
                {/* Spacer to ensure last element is not cut off by padding/edge */}
                <View style={{ height: 50 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Helper Component for Results ---
const ResultItem = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <View style={styles.resultRow}>
        <Text style={styles.resultLabel}>{label}:</Text>
        <Text style={[styles.resultValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
);
// ------------------------------------


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5F5F5', // Earth/Tree-themed light background
    },
    // The key to fixing scroll: contentContainerStyle applied to ScrollView
    container: {
        alignItems: "center",
        padding: 20,
        paddingTop: 40,
        minHeight: '100%', // Ensure it takes up enough space to scroll if needed
    },
    headerTitle: {
        fontSize: 30,
        fontWeight: '700',
        color: '#333333',
        marginBottom: 30,
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 400,
        marginBottom: 25,
    },
    button: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
    },
    buttonIcon: {
        fontSize: 18,
        marginRight: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    galleryButton: {
        backgroundColor: '#2E8B57', // Forest Green
    },
    cameraButton: {
        backgroundColor: '#A0522D', // Earth Brown
    },
    placeholderContainer: {
        width: 320,
        height: 320,
        backgroundColor: '#E0E0E0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
    },
    placeholderText: {
        color: '#888',
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    imageWrapper: {
        borderRadius: 20,
        overflow: 'hidden', // Important for image border radius
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        backgroundColor: '#fff',
        marginVertical: 20,
    },
    image: {
        width: 320,
        height: 320,
        resizeMode: 'cover',
    },
    detectButton: {
        backgroundColor: '#2E8B57', 
        width: '100%',
        maxWidth: 400,
        marginTop: 10,
        paddingVertical: 15,
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 6,
    },
    detectButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e6fff0', // Very light green
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2E8B57',
    },
    loadingText: {
        marginLeft: 10,
        color: '#2E8B57',
        fontSize: 16,
    },
    result: {
        marginTop: 30,
        padding: 25,
        backgroundColor: '#ffffff',
        borderRadius: 20,
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        width: "100%",
        maxWidth: 400,
        borderWidth: 1,
        borderColor: '#eee',
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 10,
        color: '#2E8B57',
        textAlign: 'center',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 15,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    resultLabel: {
        fontSize: 16,
        color: '#555',
        fontWeight: '600',
    },
    resultValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    highlightValue: {
        fontWeight: '700',
        color: '#A0522D', // Earth tone for the main finding
    },
    subTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginTop: 15,
        marginBottom: 5,
    },
    resultDescription: {
        fontSize: 16,
        color: '#555',
        lineHeight: 24,
        marginBottom: 10,
    }
});