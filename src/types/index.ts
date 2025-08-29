// Common types used across the application

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Call-related types
export interface CallRequest {
  to: string;
  from: string;
  url?: string;
  method?: 'GET' | 'POST';
  timeout?: number;
  record?: boolean;
  machineDetection?: boolean;
}

export interface CallResponse {
  sid: string;
  accountSid: string;
  to: string;
  from: string;
  status: CallStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  price?: string;
  priceUnit?: string;
  direction: CallDirection;
  uri: string;
  subresourceUris: {
    recordings: string;
  };
}

export enum CallStatus {
  QUEUED = 'queued',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
  CANCELED = 'canceled',
}

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound-api',
  OUTBOUND_DIAL = 'outbound-dial',
}

// User and Account types
export interface User {
  id: string;
  email: string;
  accountSid: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  sid: string;
  friendlyName: string;
  status: AccountStatus;
  type: AccountType;
  authToken: string;
  dateCreated: Date;
  dateUpdated: Date;
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum AccountType {
  TRIAL = 'Trial',
  FULL = 'Full',
}

// African Region and Carrier types
export interface AfricanCountry {
  code: string;
  name: string;
  dialCode: string;
  carriers: AfricanCarrier[];
  region: AfricanRegion;
}

export interface AfricanCarrier {
  id: string;
  name: string;
  country: string;
  apiKey?: string;
  baseUrl: string;
  supportedServices: CarrierService[];
  pricing: CarrierPricing;
}

export enum AfricanRegion {
  WEST = 'africa-west',
  EAST = 'africa-east',
  SOUTH = 'africa-south',
  NORTH = 'africa-north',
  CENTRAL = 'africa-central',
}

export enum CarrierService {
  VOICE = 'voice',
  SMS = 'sms',
  DATA = 'data',
  USSD = 'ussd',
}

export interface CarrierPricing {
  voice: {
    local: number;
    national: number;
    international: number;
  };
  sms: {
    local: number;
    national: number;
    international: number;
  };
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: PaymentType;
  provider: PaymentProvider;
  details: any;
  isDefault: boolean;
}

export enum PaymentType {
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
  CRYPTOCURRENCY = 'cryptocurrency',
}

export enum PaymentProvider {
  BITS_XPAY = 'bits_xpay',
  FLUTTERWAVE = 'flutterwave',
  PAYSTACK = 'paystack',
  MPESA = 'mpesa',
  MTN_MONEY = 'mtn_money',
  AIRTEL_MONEY = 'airtel_money',
}

// AI/ML types
export interface AIVoiceConfig {
  language: string;
  accent: string;
  voice: string;
  speed: number;
  pitch: number;
}

export interface AIProcessingResult {
  transcription?: string;
  sentiment?: SentimentAnalysis;
  language?: string;
  confidence: number;
}

export interface SentimentAnalysis {
  score: number; // -1 to 1
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

// WebRTC types (placeholder interfaces)
export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface MediaStreamConstraints {
  audio?: boolean | object;
  video?: boolean | object;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  constraints: MediaStreamConstraints;
}

export interface WebRTCSession {
  id: string;
  peerId: string;
  status: WebRTCStatus;
  startTime: Date;
  endTime?: Date;
}

export enum WebRTCStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  FAILED = 'failed',
}

// Error types
export interface NexusError extends Error {
  code: string;
  statusCode: number;
  details?: any;
}

export class ValidationError extends Error implements NexusError {
  code = 'VALIDATION_ERROR';
  statusCode = 400;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements NexusError {
  code = 'AUTHENTICATION_ERROR';
  statusCode = 401;
  
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements NexusError {
  code = 'AUTHORIZATION_ERROR';
  statusCode = 403;
  
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements NexusError {
  code = 'NOT_FOUND_ERROR';
  statusCode = 404;
  
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class InternalServerError extends Error implements NexusError {
  code = 'INTERNAL_SERVER_ERROR';
  statusCode = 500;
  
  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
  }
}