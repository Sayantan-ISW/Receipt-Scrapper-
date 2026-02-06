import { ExpenseCategory } from '../types';

/**
 * Vendor to Category Mapping
 * Maps keywords to expense categories for automatic categorization
 */
export const VENDOR_CATEGORY_MAP: Record<string, ExpenseCategory> = {
  // Food & Dining - Delivery Apps
  'swiggy': 'Food',
  'zomato': 'Food',
  'uber eats': 'Food',
  'ubereats': 'Food',
  'doordash': 'Food',
  'grubhub': 'Food',
  'deliveroo': 'Food',
  'foodpanda': 'Food',
  'dunzo': 'Food',
  
  // Food & Dining - Quick Commerce / Grocery
  'bigbasket': 'Food',
  'blinkit': 'Food',
  'zepto': 'Food',
  'instamart': 'Food',
  'grofers': 'Food',
  'jiomart': 'Food',
  'dmart': 'Food',
  'reliance fresh': 'Food',
  'more supermarket': 'Food',
  
  // Food & Dining - Restaurants & Cafes
  'starbucks': 'Food',
  'mcdonald': 'Food',
  'subway': 'Food',
  'pizza': 'Food',
  'domino': 'Food',
  'pizza hut': 'Food',
  'kfc': 'Food',
  'burger king': 'Food',
  'restaurant': 'Food',
  'cafe': 'Food',
  'coffee': 'Food',
  'burger': 'Food',
  'kitchen': 'Food',
  'dining': 'Food',
  'food': 'Food',
  'bakery': 'Food',
  'chai': 'Food',
  'biryani': 'Food',
  
  // Food & Dining - Grocery
  'grocery': 'Food',
  'market': 'Food',
  'supermarket': 'Food',
  'walmart': 'Shopping',
  'costco': 'Shopping',
  'target': 'Shopping',
  
  // Travel - Ride Sharing
  'uber': 'Travel',
  'lyft': 'Travel',
  'ola': 'Travel',
  'ola cabs': 'Travel',
  'rapido': 'Travel',
  'meru': 'Travel',
  'grab': 'Travel',
  'gojek': 'Travel',
  'didi': 'Travel',
  
  // Travel - Airlines & Hotels
  'airline': 'Travel',
  'airways': 'Travel',
  'indigo': 'Travel',
  'air india': 'Travel',
  'spicejet': 'Travel',
  'vistara': 'Travel',
  'emirates': 'Travel',
  'hotel': 'Travel',
  'oyo': 'Travel',
  'airbnb': 'Travel',
  'makemytrip': 'Travel',
  'goibibo': 'Travel',
  'booking.com': 'Travel',
  'cleartrip': 'Travel',
  'yatra': 'Travel',
  
  // Travel - Transport
  'rental': 'Travel',
  'gas': 'Travel',
  'fuel': 'Travel',
  'petrol': 'Travel',
  'diesel': 'Travel',
  'parking': 'Travel',
  'transit': 'Travel',
  'train': 'Travel',
  'irctc': 'Travel',
  'bus': 'Travel',
  'redbus': 'Travel',
  'metro': 'Travel',
  
  // Shopping - E-commerce
  'amazon': 'Shopping',
  'flipkart': 'Shopping',
  'myntra': 'Shopping',
  'ajio': 'Shopping',
  'nykaa': 'Shopping',
  'meesho': 'Shopping',
  'snapdeal': 'Shopping',
  'ebay': 'Shopping',
  'alibaba': 'Shopping',
  
  // Shopping - General
  'store': 'Shopping',
  'shop': 'Shopping',
  'retail': 'Shopping',
  'mall': 'Shopping',
  'electronics': 'Shopping',
  'croma': 'Shopping',
  'reliance digital': 'Shopping',
  
  // Utilities - Telecom
  'jio': 'Utilities',
  'airtel': 'Utilities',
  'vodafone': 'Utilities',
  'vi': 'Utilities',
  'bsnl': 'Utilities',
  'verizon': 'Utilities',
  'at&t': 'Utilities',
  't-mobile': 'Utilities',
  
  // Utilities - Internet & Services
  'electric': 'Utilities',
  'electricity': 'Utilities',
  'water': 'Utilities',
  'internet': 'Utilities',
  'broadband': 'Utilities',
  'phone': 'Utilities',
  'mobile': 'Utilities',
  'utility': 'Utilities',
  'comcast': 'Utilities',
  'act fibernet': 'Utilities',
  
  // Utilities - Streaming & Subscriptions
  'netflix': 'Utilities',
  'prime video': 'Utilities',
  'hotstar': 'Utilities',
  'disney': 'Utilities',
  'spotify': 'Utilities',
  'apple music': 'Utilities',
  'youtube': 'Utilities',
  
  // Utilities - Payments & Finance
  'paytm': 'Utilities',
  'phonepe': 'Utilities',
  'gpay': 'Utilities',
  'google pay': 'Utilities',
  'bharatpe': 'Utilities',
};

/**
 * All available expense categories
 */
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Utilities',
  'Other',
];
