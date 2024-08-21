import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';

interface Reservation {
  tripType: string;
  from: string;
  fromStation: string;
  departureTime: string;
  to: string;
  toStation: string;
  arrivalTime: string;
  date: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
  passportSerial: string;
  isStudent: boolean;
  studentIdSerial: string;
}

const ReservationList = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReservation, setExpandedReservation] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromCity, setFromCity] = useState<string>('');
  const [toCity, setToCity] = useState<string>('');
  const [reservationCount, setReservationCount] = useState<number>(0);
  const [reservationsStopped, setReservationsStopped] = useState<boolean>(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await fetch('https://lavial.icu/reservations');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    if (filterDate) {
      const count = reservations.filter(
        (reservation) => new Date(reservation.date).toLocaleDateString('ro-RO') === filterDate.toLocaleDateString('ro-RO')
      ).length;
      setReservationCount(count);
    } else {
      setReservationCount(0);
    }
  }, [filterDate, reservations]);

  const onDateChange = async (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || filterDate;
    setShowDatePicker(false);
    setFilterDate(currentDate);

    // Verifică starea rezervărilor pentru data selectată
    try {
        const response = await fetch('http://localhost:3000/check-reservation-status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date: currentDate.toISOString() }),
        });

        const data = await response.json();
        setReservationsStopped(data.stopped);
    } catch (error) {
        console.error('Error checking reservation status:', error);
        Alert.alert('Error', 'A apărut o eroare la verificarea stării rezervărilor.');
    }
};

  const resetFilters = () => {
    setFilterDate(undefined);
    setSearchQuery('');
    setFromCity('');
    setToCity('');
  };

  const toggleReservations = async () => {
    if (!filterDate) {
        Alert.alert('Error', 'Selectați o dată pentru a opri/pornir rezervările');
        return;
    }


    const action = reservationsStopped ? 'start' : 'stop';
    try {
        const response = await fetch(`https://lavial.icu/${action}-reservation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date: filterDate.toISOString(), // Trimitem data selectată către backend
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to ${action} reservations`);
        }

        setReservationsStopped(!reservationsStopped);
        Alert.alert('Success', `Rezervările au fost ${reservationsStopped ? 'pornite' : 'oprite'} pentru data selectată`);
    } catch (error) {
        console.error(`Error ${action}ping reservations:`, error);
        Alert.alert('Error', `A apărut o eroare la ${action}ping rezervărilor`);
    }
};

  const filteredReservations = reservations.filter((reservation) => {
    const matchesDate = !filterDate || new Date(reservation.date).toLocaleDateString('ro-RO') === filterDate.toLocaleDateString('ro-RO');
    const matchesSearch = searchQuery === '' || reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) || reservation.surname.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFromCity = fromCity === '' || reservation.from.toLowerCase().includes(fromCity.toLowerCase());
    const matchesToCity = toCity === '' || reservation.to.toLowerCase().includes(toCity.toLowerCase());
    return matchesDate && matchesSearch && matchesFromCity && matchesToCity;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          Rezervări pentru {filterDate ? filterDate.toLocaleDateString('ro-RO') : 'selectați o dată'}: {reservationCount}
        </Text>
      </View>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Căutați după nume..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View style={styles.citySearchContainer}>
        <TextInput
          style={styles.cityInput}
          placeholder="De la oraș..."
          value={fromCity}
          onChangeText={setFromCity}
        />
        <TextInput
          style={styles.cityInput}
          placeholder="La oraș..."
          value={toCity}
          onChangeText={setToCity}
        />
      </View>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
        <Text style={styles.datePickerButtonText}>
          {filterDate ? filterDate.toLocaleDateString('ro-RO') : 'Selectați data'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Resetați Filtrele</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleReservations} style={reservationsStopped ? styles.startButton : styles.stopButton}>
        <Text style={styles.toggleButtonText}>
          {reservationsStopped ? 'Porniți Rezervările' : 'Opriți Rezervările'}
        </Text>
      </TouchableOpacity>
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.email + item.date}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reservationItem}
            onPress={() => {
              const reservationKey = `${item.email}-${item.date}`;
              setExpandedReservation(expandedReservation === reservationKey ? null : reservationKey);
            }}
          >
            <View style={styles.reservationHeader}>
              <Text style={styles.title}>Pasager: {item.name} {item.surname}</Text>
              <Icon name={expandedReservation === `${item.email}-${item.date}` ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </View>
            {expandedReservation === `${item.email}-${item.date}` && (
              <View style={styles.expandedDetails}>
                <Text style={styles.detailText}>Tipul călătoriei: {item.tripType}</Text>
                <Text style={styles.detailText}>De la: {item.from} ({item.fromStation}) la {item.to} ({item.toStation})</Text>
                <Text style={styles.detailText}>Ora plecării: {item.departureTime}</Text>
                <Text style={styles.detailText}>Ora sosirii: {item.arrivalTime}</Text>
                <Text style={styles.detailText}>Data: {new Date(item.date).toLocaleDateString('ro-RO')}</Text>
                <Text style={styles.detailText}>Email: {item.email}</Text>
                <Text style={styles.detailText}>Telefon: {item.phone}</Text>
                {item.isStudent && <Text style={styles.detailText}>Legitimația de student: {item.studentIdSerial}</Text>}
              </View>
            )}
          </TouchableOpacity>
        )}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  counterContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#ffd54f',
    borderRadius: 8,
    alignItems: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  citySearchContainer: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  cityInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
    marginTop:10, 
    marginBottom: 15,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stopButton: {
    padding: 12,
    backgroundColor: '#f44336',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  startButton: {
    padding: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reservationItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  reservationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expandedDetails: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
});

export default ReservationList;