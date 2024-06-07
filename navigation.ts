export type RootStackParamList = {
    ReservationList: undefined;
    ReservationDetail: { reservation: Reservation };
  };
  
  export interface Reservation {
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
  