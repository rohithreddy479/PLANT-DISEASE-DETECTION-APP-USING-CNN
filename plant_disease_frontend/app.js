import React, { useState } from 'react';
import { View, Text, Button, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const [selectedImages, setSelectedImages] = useState([]);
  const [results, setResults] = useState([]);

  // Pick multiple images
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      // result.assets is an array of images
      setSelectedImages(result.assets);
    }
  };

  // Upload images to FastAPI
  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No images selected', 'Please select images to predict.');
      return;
    }

    const newResults = [];

    for (const image of selectedImages) {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });

      try {
        const response = await fetch('http://10.162.221.82:8000/plants/detect', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });

        const data = await response.json();
        newResults.push(data);
      } catch (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image.');
      }
    }

    setResults(newResults);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Plant Disease Detection</Text>

      <Button title="Select Images" onPress={pickImages} />

      <View style={styles.imagesContainer}>
        {selectedImages.map((img, idx) => (
          <Image key={idx} source={{ uri: img.uri }} style={styles.image} />
        ))}
      </View>

      <Button title="Predict Disease" onPress={uploadImages} />

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.subtitle}>Prediction Results:</Text>
          {results.map((res, idx) => (
            <View key={idx} style={styles.resultCard}>
              <Text>Disease: {res.disease}</Text>
              <Text>Confidence: {(res.confidence * 100).toFixed(2)}%</Text>
              <Text>Description: {res.description || 'N/A'}</Text>
              <Text>Treatment: {res.treatment || 'N/A'}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
  },
  resultsContainer: {
    marginTop: 20,
  },
  resultCard: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});
