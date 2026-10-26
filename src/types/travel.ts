export type PaymentStatus = 'prevu' | 'a_payer' | 'partiel' | 'paye';

export type ActivityStatus = 'idee' | 'a_reserver' | 'reserve' | 'effectue';

export type ActivityCategory = 
  | 'Culture' 
  | 'Gastronomie' 
  | 'Nature' 
  | 'Shopping' 
  | 'Visite' 
  | 'Détente' 
  | 'Aventure' 
  | 'Spectacle' 
  | 'Autre';

export type TransportType = 
  | 'flight' 
  | 'train' 
  | 'bus' 
  | 'metro' 
  | 'ferry' 
  | 'car_rental' 
  | 'taxi' 
  | 'other';

export type BookingStatus = 'en_attente' | 'confirme' | 'annule';

export type ExpenseCategory = 
  | 'accommodation' 
  | 'transport' 
  | 'activity' 
  | 'food' 
  | 'shopping' 
  | 'admin' 
  | 'other';

export interface Trip {
  id: string;
  title: string;
  description: string;
  coverImage?: string;
  startDate: string;
  endDate: string;
  currency: string; // e.g. 'EUR', 'CNY', 'USD', 'AUD'
  totalBudget: number; // Previsional forecast budget
  countries: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  id: string;
  tripId: string;
  destination: string; // City or place name
  country: string;
  region?: string;
  arrivalDate: string;
  departureDate: string;
  nights: number;
  order: number;
  transportToNext?: string; // e.g. "Train rapide TGV G-Series (4h30)"
  notes?: string;
  lat?: number;
  lng?: number;
  googleMapsUrl?: string;
  emoji?: string;
}

export interface Activity {
  id: string;
  tripId: string;
  stepId?: string; // Associated step/city
  name: string;
  date: string;
  time?: string;
  address?: string;
  description?: string;
  price: number;
  currency: string;
  status: ActivityStatus;
  category: ActivityCategory;
  bookingUrl?: string;
  googleMapsUrl?: string;
  lat?: number;
  lng?: number;
  notes?: string;
}

export interface Accommodation {
  id: string;
  tripId: string;
  stepId?: string;
  name: string;
  address: string;
  city: string;
  country: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  priceTotal: number;
  currency: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  bookingStatus: BookingStatus;
  bookingRef?: string;
  bookingUrl?: string;
  googleMapsUrl?: string;
  notes?: string;
  lat?: number;
  lng?: number;
}

export interface Transport {
  id: string;
  tripId: string;
  stepId?: string;
  type: TransportType;
  departurePlace: string;
  arrivalPlace: string;
  departureDateTime: string;
  arrivalDateTime?: string;
  carrier?: string; // e.g. Air France, China Railway, Trenitalia
  transportNumber?: string; // e.g. AF128, G104
  bookingRef?: string;
  price: number;
  currency: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  notes?: string;
  bookingUrl?: string;
  googleMapsUrl?: string;
  depLat?: number;
  depLng?: number;
  arrLat?: number;
  arrLng?: number;
}

export interface Expense {
  id: string;
  tripId: string;
  stepId?: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  date: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  linkedType?: 'accommodation' | 'transport' | 'activity';
  linkedId?: string;
  paidBy?: string;
  splitBetween?: string[];
}

export interface DocumentItem {
  id: string;
  tripId: string;
  stepId?: string;
  type: 'flight' | 'train' | 'hotel' | 'activity' | 'passport' | 'insurance' | 'other';
  title: string;
  bookingRef?: string;
  qrCodeContent?: string;
  externalUrl?: string;
  notes?: string;
  date?: string;
}

export interface GeneralLink {
  id: string;
  tripId: string;
  stepId?: string;
  title: string;
  url: string;
  description?: string;
  category: 'Guide' | 'Restaurant' | 'Transport' | 'Réservation' | 'Pratique' | 'Autre';
}

export interface GeneralNote {
  id: string;
  tripId: string;
  title: string;
  content: string;
  category: 'bagages' | 'urgences' | 'itineraires' | 'conseils' | 'general';
}

export interface TravelAppData {
  trips: Trip[];
  activeTripId: string;
  steps: Step[];
  activities: Activity[];
  accommodations: Accommodation[];
  transports: Transport[];
  expenses: Expense[];
  documents: DocumentItem[];
  links: GeneralLink[];
  notes: GeneralNote[];
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
  };
  cloudSyncEnabled?: boolean;
}
