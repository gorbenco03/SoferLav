import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button, Alert } from "react-native";
import { Camera, CameraView } from "expo-camera";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    console.log(`Scanned barcode of type ${type} with data ${data}`);
    try {
      const parsedData = JSON.parse(data);
      const response = await axios.post("http://192.168.3.35:3000/verify-ticket", { uniq_id: parsedData.uniq_id });
      console.log('Server response:', response);

      if (response.status === 200) {
        setVerificationStatus('success');
        Alert.alert("Success", "Ticket verified successfully!");
      } else {
        setVerificationStatus('error');
        Alert.alert("Error", response.data.message);
      }
    } catch (error) {
      console.error('Error during ticket verification:', error);
      setVerificationStatus('error');
      Alert.alert("Error", "Failed to verify ticket");
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {!cameraActive ? (
        <Button title="Start Scanning" onPress={() => setCameraActive(true)} />
      ) : (
        <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
            barcodeTypes: ["qr", "pdf417"],
          }}
      />
      )}
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => { setScanned(false); setVerificationStatus(null); }} />
      )}
      {verificationStatus === 'success' && (
        <View style={styles.overlay}>
          <Ionicons name="checkmark-circle" size={100} color="green" />
          <Text style={styles.overlayText}>Done</Text>
        </View>
      )}
      {verificationStatus === 'error' && (
        <View style={styles.overlay}>
          <Ionicons name="close-circle" size={100} color="red" />
          <Text style={styles.overlayText}>Error</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#f8f8f8',
  },
  overlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#fff',
  },
});
