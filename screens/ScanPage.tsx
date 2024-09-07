import React, { useState, useEffect } from "react";
import { Text, View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Camera, CameraView } from "expo-camera";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

export default function ScanPage() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'success' | 'error' | null>(null);
  const [reservationDetails, setReservationDetails] = useState<any>(null);

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
      console.log('Parsed data:', parsedData);
      const response = await axios.post("https:/lavial.icu/verify-ticket", { uniq_id: parsedData.uniq_id });
      console.log('Server response:', response);

      if (response.status === 200) {
        setVerificationStatus('success');
        console.log('Travel data:', response.data.travel);
        setReservationDetails(response.data.travel);
      } else {
        console.log('Verification error, status:', response.status);
        setVerificationStatus('error');
      }
    } catch (error) {
      console.error('Error during ticket verification:', error);
      setVerificationStatus('error');
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.permissionText}>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text style={styles.permissionText}>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {!cameraActive ? (
        <TouchableOpacity style={styles.startButton} onPress={() => setCameraActive(true)}>
          <Text style={styles.startButtonText}>Start Scanning</Text>
        </TouchableOpacity>
      ) : (
        <>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={styles.camera}
          />
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.bottomContainer}>
              {verificationStatus && (
                <View style={styles.resultContainer}>
                  {verificationStatus === 'success' ? (
                    <>
                      <Ionicons name="checkmark-circle" size={100} color="green" />
                      <Text style={styles.resultText}>Done</Text>
                      {reservationDetails ? (
                        <View style={styles.reservationDetails}>
                          <Text style={styles.detailText}>From: {reservationDetails.from}</Text>
                          <Text style={styles.detailText}>To: {reservationDetails.to}</Text>
                          <Text style={styles.detailText}>Date: {new Date(reservationDetails.date).toLocaleDateString()}</Text>
                          <Text style={styles.detailText}>Name: {reservationDetails.name} {reservationDetails.surname}</Text>
                        </View>
                      ) : (
                        <Text style={styles.resultText}>No reservation details available</Text>
                      )}
                    </>
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={100} color="red" />
                      <Text style={styles.resultText}>Error</Text>
                    </>
                  )}
                </View>
              )}
              {scanned && (
                <TouchableOpacity style={styles.scanAgainButton} onPress={() => { setScanned(false); setVerificationStatus(null); setReservationDetails(null); }}>
                  <Text style={styles.scanAgainButtonText}>Tap to Scan Again</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.stopButton} onPress={() => setCameraActive(false)}>
                <Text style={styles.stopButtonText}>Stop Camera</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 10,
    marginTop: 40,
  },
  startButton: {
    marginTop: 50,
    padding: 15,
    backgroundColor: '#1e90ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  camera: {
    width: '100%',
    height: '50%',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  bottomContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    padding: 20,
  },
  resultText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
    color: '#333',
  },
  reservationDetails: {
    marginTop: 20,
    alignItems: 'flex-start',
    width: '100%',
  },
  detailText: {
    fontSize: 18,
    marginVertical: 5,
    color: '#555',
  },
  scanAgainButton: {
    padding: 15,
    backgroundColor: '#1e90ff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  scanAgainButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  stopButton: {
    padding: 15,
    backgroundColor: '#ff4c4c',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  stopButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
});
