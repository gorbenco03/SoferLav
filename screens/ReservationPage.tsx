import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
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

  useEffect(() => {
    const fetchReservations = async () => {
      console.log('Fetching reservations...');
      try {
        const response = await fetch('http://192.168.3.35:3000/reservations');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Reservations fetched:', data);
        setReservations(data);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || filterDate;
    setShowDatePicker(false);
    setFilterDate(currentDate);
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesDate = !filterDate || new Date(reservation.date).toLocaleDateString('ro-RO') === filterDate.toLocaleDateString('ro-RO');
    const matchesSearch = searchQuery === '' || reservation.name.toLowerCase().includes(searchQuery.toLowerCase()) || reservation.surname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
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
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Căutați după nume..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.email + item.date}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.reservationItem}
            onPress={() => setExpandedReservation(expandedReservation === item.email ? null : item.email)}
          >
            <View style={styles.reservationHeader}>
              <Text style={styles.title}>Rezervare pentru: {item.name} {item.surname}</Text>
              <Icon name={expandedReservation === item.email ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </View>
            {expandedReservation === item.email && (
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
    backgroundColor: '#f0f2f5',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
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
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ReservationList;
