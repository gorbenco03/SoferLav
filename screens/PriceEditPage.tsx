import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Routes {
  [key: string]: string[];
}

const PriceEditPage = () => {
    const [fromCity, setFromCity] = useState<string | undefined>(undefined);
    const [toCity, setToCity] = useState<string | undefined>(undefined);
    const [price, setPrice] = useState('');
    const [routes, setRoutes] = useState<Routes>({});

    useEffect(() => {
        fetchRoutes();
    }, []);

    const fetchRoutes = async () => {
        try {
            const response = await fetch('https://lavial.icu/get-routes');
            const data = await response.json();
            setRoutes(data);
        } catch (error) {
            console.error('Error fetching routes:', error);
            Alert.alert('Error', 'A apărut o eroare la încărcarea rutelor.');
        }
    };

    const fetchPrice = async () => {
        if (!fromCity || !toCity) {
            Alert.alert('Error', 'Vă rugăm să selectați ambele orașe.');
            return;
        }

        try {
            const response = await fetch('https://lavial.icu/get-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ from: fromCity, to: toCity }),
            });
            const data = await response.json();
            setPrice(data.routePrice.toString());
        } catch (error) {
            console.error('Error fetching price:', error);
            Alert.alert('Error', 'A apărut o eroare la încărcarea prețului.');
        }
    };

    const handleSavePrice = async () => {
        if (!fromCity || !toCity || !price) {
            Alert.alert('Error', 'Vă rugăm să completați toate câmpurile.');
            return;
        }

        try {
            await fetch('https://lavial.icu/update-price', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ from: fromCity, to: toCity, price: parseFloat(price) }),
            });
            Alert.alert('Success', 'Prețul a fost actualizat cu succes.');
        } catch (error) {
            console.error('Error updating price:', error);
            Alert.alert('Error', 'A apărut o eroare la actualizarea prețului.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Selectați orașul de plecare:</Text>
            <View style={styles.dropdownContainer}>
                <Picker
                    selectedValue={fromCity}
                    onValueChange={(itemValue: string) => setFromCity(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Selectați orașul" value="" />
                    {Object.keys(routes).map((city) => (
                        <Picker.Item key={city} label={city} value={city} />
                    ))}
                </Picker>
            </View>

            <Text style={styles.label}>Selectați orașul de destinație:</Text>
            <View style={styles.dropdownContainer}>
                <Picker
                    selectedValue={toCity}
                    onValueChange={(itemValue: string) => setToCity(itemValue)}
                    style={styles.picker}
                    enabled={!!fromCity}
                >
                    <Picker.Item label="Selectați orașul" value="" />
                    {fromCity && routes[fromCity] && routes[fromCity].map((city) => (
                        <Picker.Item key={city} label={city} value={city} />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity onPress={fetchPrice} style={styles.button}>
                <Text style={styles.buttonText}>Afișează Prețul</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Prețul:</Text>
            <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />

            <TouchableOpacity onPress={handleSavePrice} style={styles.saveButton}>
                <Text style={styles.buttonText}>Salvează Prețul</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f7f8fc',
        marginTop: 35,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    dropdownContainer: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    picker: {
        height: 40,
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default PriceEditPage;