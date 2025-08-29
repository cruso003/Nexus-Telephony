import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export const generateAccountSid = (): string => {
  return `AC${crypto.randomBytes(16).toString('hex')}`;
};

export const generateCallSid = (): string => {
  return `CA${crypto.randomBytes(16).toString('hex')}`;
};

export const generateAuthToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateApiKey = (): string => {
  return `SK${crypto.randomBytes(20).toString('hex')}`;
};

export const generateUuid = (): string => {
  return uuidv4();
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcryptjs');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  const bcrypt = await import('bcryptjs');
  return bcrypt.compare(password, hash);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // Add + prefix if not present
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Basic validation for international phone numbers
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(formatPhoneNumber(phoneNumber));
};

export const getCountryFromPhoneNumber = (phoneNumber: string): string | null => {
  const formatted = formatPhoneNumber(phoneNumber);
  
  // African country codes mapping
  const africanCountryCodes: { [key: string]: string } = {
    '+234': 'NG', // Nigeria
    '+254': 'KE', // Kenya
    '+233': 'GH', // Ghana
    '+256': 'UG', // Uganda
    '+250': 'RW', // Rwanda
    '+231': 'LR', // Liberia
    '+27': 'ZA',  // South Africa
    '+251': 'ET', // Ethiopia
    '+255': 'TZ', // Tanzania
    '+220': 'GM', // Gambia
    '+221': 'SN', // Senegal
    '+225': 'CI', // Côte d'Ivoire
    '+226': 'BF', // Burkina Faso
    '+227': 'NE', // Niger
    '+228': 'TG', // Togo
    '+229': 'BJ', // Benin
    '+230': 'MU', // Mauritius
    '+232': 'SL', // Sierra Leone
    '+235': 'TD', // Chad
    '+236': 'CF', // Central African Republic
    '+237': 'CM', // Cameroon
    '+238': 'CV', // Cape Verde
    '+239': 'ST', // São Tomé and Príncipe
    '+240': 'GQ', // Equatorial Guinea
    '+241': 'GA', // Gabon
    '+242': 'CG', // Republic of the Congo
    '+243': 'CD', // Democratic Republic of the Congo
    '+244': 'AO', // Angola
    '+245': 'GW', // Guinea-Bissau
    '+246': 'IO', // British Indian Ocean Territory
    '+247': 'AC', // Ascension Island
    '+248': 'SC', // Seychelles
    '+249': 'SD', // Sudan
    '+252': 'SO', // Somalia
    '+253': 'DJ', // Djibouti
    '+257': 'BI', // Burundi
    '+258': 'MZ', // Mozambique
    '+260': 'ZM', // Zambia
    '+261': 'MG', // Madagascar
    '+262': 'RE', // Réunion
    '+263': 'ZW', // Zimbabwe
    '+264': 'NA', // Namibia
    '+265': 'MW', // Malawi
    '+266': 'LS', // Lesotho
    '+267': 'BW', // Botswana
    '+268': 'SZ', // Eswatini
    '+269': 'KM', // Comoros
    '+290': 'SH', // Saint Helena
    '+291': 'ER', // Eritrea
    '+297': 'AW', // Aruba
    '+298': 'FO', // Faroe Islands
    '+299': 'GL', // Greenland
  };
  
  // Find matching country code
  for (const [code, country] of Object.entries(africanCountryCodes)) {
    if (formatted.startsWith(code)) {
      return country;
    }
  }
  
  return null;
};

export const calculateCallPrice = (
  duration: number, // in seconds
  ratePerMinute: number,
  _country: string
): number => {
  const minutes = Math.ceil(duration / 60); // Round up to nearest minute
  return minutes * ratePerMinute;
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retryAsync = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retryAsync(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const paginate = (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};