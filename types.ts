// Enums for Roles and Statuses
export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  CUSTOMER = 'customer',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum PayoutStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  REJECTED = 'rejected',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum AgentType {
  INDIVIDUAL = 'individual',
  CORPORATE = 'corporate',
}

export enum AgentSpecialization {
  TOUR = 'tour',
  STAY = 'stay',
  TRANSPORT = 'transport',
}

// Sub-Categories Enums
export enum TourCategory {
  NATURE = 'Nature',
  ADVENTURE = 'Adventure',
  SPIRITUAL = 'Spiritual',
  CULTURAL = 'Cultural',
  CULINARY = 'Culinary',
}

export enum StayCategory {
  HOTEL = 'Hotel',
  VILLA = 'Villa',
  HOMESTAY = 'Homestay',
  RESORT = 'Resort',
}

export enum TransportCategory {
  CAR_RENTAL = 'Car Rental',
  AIRPORT_TRANSFER = 'Airport Transfer',
  MOTORBIKE = 'Motorbike',
}

// Flash Sale Campaign
export interface FlashSaleCampaign {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  minDiscount: number; // e.g. 20 for 20%
  adminFeePercentage: number; // e.g. 5 for 5% instead of standard 11%
  image: string;
  isActive: boolean;
}

// Flash Sale Types
export interface FlashSaleDetails {
  salePrice: number;
  originalPrice: number;
  discountPercentage: number;
  status: 'pending' | 'approved' | 'rejected' | 'ended';
  endTime?: string; // Set by Admin upon approval
  requestDate: string;
  campaignId?: number; // Optional link to a specific campaign
}

// Detailed Interfaces for Product Types
export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  meals?: string[]; // e.g. ['Breakfast', 'Lunch']
  accommodation?: string; // e.g. 'Hotel Neo'
}

export interface TourDetails {
  type: 'tour';
  tourCategory: TourCategory; // Added
  duration: string;
  groupSize: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard'; // Added
  ageRestriction?: string; // Added
  meetingPoint: string; // Added
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
}

export interface StayDetails {
  type: 'stay';
  stayCategory: StayCategory; // Added
  checkIn: string;
  checkOut: string;
  rooms: number;
  bathrooms: number;
  beds: number; // Added
  roomSize?: number; // sqm
  amenities: { category: string; items: string[] }[];
  rules: string[];
  breakfastIncluded: boolean; // Added
}

export interface CarDetails {
  type: 'car';
  transportCategory: TransportCategory; // Added
  transmission: 'Automatic' | 'Manual';
  seats: number;
  luggage: number;
  fuelPolicy: string;
  year?: number; // Added
  driverLanguages?: string[]; // Added
  requirements: string[];
  driver?: boolean;
}

export type ProductDetails = TourDetails | StayDetails | CarDetails;

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

// Data Models based on ERD
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  balance?: number; // For agents (commission)

  // Verification Fields
  verificationStatus?: VerificationStatus;
  agentType?: AgentType;
  specialization?: AgentSpecialization;
  documents?: {
    idCard?: string; // KTP/Passport
    taxId?: string; // NPWP
    companyDeed?: string;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Product {
  id: number;
  ownerId: number; // Added to link product to agent
  ownerName?: string; // Denormalized for Admin UI
  categoryId: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  rating: number;
  image: string;
  images?: string[]; // Added for gallery
  features: string[];
  details?: ProductDetails; // Flexible details field
  reviews?: Review[]; // Added for review system

  // Availability Management
  dailyCapacity?: number;
  blockedDates?: string[]; // ISO date strings 'YYYY-MM-DD'
  isActive?: boolean;

  // Flash Sale
  flashSale?: FlashSaleDetails;
}

export interface Booking {
  id: number;
  userId: number;
  userName?: string; // Added for Admin display
  productId: number;
  productName: string; // Denormalized for display
  productImage: string;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  date: string;
  createdAt: string;
  contactDetails?: {
    // Added for "Book for others" feature
    name: string;
    email: string;
    phone: string;
  };
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface PayoutRequest {
  id: number;
  userId: number;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: PayoutStatus;
  date: string;
}
