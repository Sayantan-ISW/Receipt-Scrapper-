import { ExtractionResult } from '../types';

/**
 * Known vendor patterns for better detection
 */
const KNOWN_VENDORS: { name: string; patterns: RegExp[] }[] = [
  // Food Delivery Apps
  { name: 'Swiggy', patterns: [/swiggy/i, /bundl\s*technologies/i] },
  { name: 'Zomato', patterns: [/zomato/i, /zomato\s*media/i] },
  { name: 'Uber Eats', patterns: [/uber\s*eats/i, /ubereats/i] },
  { name: 'DoorDash', patterns: [/doordash/i, /door\s*dash/i] },
  { name: 'Grubhub', patterns: [/grubhub/i, /grub\s*hub/i] },
  
  // Ride-sharing
  { name: 'Uber', patterns: [/\buber\b(?!\s*eats)/i, /uber\s*trip/i, /uber\s*ride/i, /uber\s*technologies/i] },
  { name: 'Lyft', patterns: [/lyft/i] },
  { name: 'Ola', patterns: [/\bola\b/i, /ola\s*cabs/i, /ani\s*technologies/i] },
  { name: 'Rapido', patterns: [/rapido/i] },
  
  // E-commerce
  { name: 'Amazon', patterns: [/amazon/i, /amzn/i] },
  { name: 'Flipkart', patterns: [/flipkart/i] },
  { name: 'Myntra', patterns: [/myntra/i] },
  { name: 'Walmart', patterns: [/walmart/i, /wal-mart/i] },
  { name: 'Target', patterns: [/target/i] },
  { name: 'eBay', patterns: [/ebay/i, /e-bay/i] },
  
  // Food & Restaurant
  { name: 'Starbucks', patterns: [/starbucks/i] },
  { name: 'McDonalds', patterns: [/mcdonald/i, /mc\s*donald/i] },
  { name: 'Subway', patterns: [/subway/i] },
  { name: 'Dominos', patterns: [/domino/i] },
  { name: 'Pizza Hut', patterns: [/pizza\s*hut/i] },
  { name: 'KFC', patterns: [/\bkfc\b/i, /kentucky\s*fried/i] },
  { name: 'Burger King', patterns: [/burger\s*king/i] },
  
  // Grocery
  { name: 'BigBasket', patterns: [/bigbasket/i, /big\s*basket/i] },
  { name: 'Blinkit', patterns: [/blinkit/i, /grofers/i] },
  { name: 'Zepto', patterns: [/zepto/i] },
  { name: 'Instamart', patterns: [/instamart/i] },
  
  // Utilities & Services
  { name: 'Netflix', patterns: [/netflix/i] },
  { name: 'Spotify', patterns: [/spotify/i] },
  { name: 'Apple', patterns: [/apple\s*(inc|store)?/i, /itunes/i, /app\s*store/i] },
  { name: 'Google', patterns: [/google/i] },
  { name: 'Microsoft', patterns: [/microsoft/i] },
  
  // Telecom
  { name: 'Jio', patterns: [/\bjio\b/i, /reliance\s*jio/i] },
  { name: 'Airtel', patterns: [/airtel/i, /bharti\s*airtel/i] },
  { name: 'Vodafone', patterns: [/vodafone/i, /vi\s/i] },
  { name: 'Verizon', patterns: [/verizon/i] },
  { name: 'AT&T', patterns: [/at&t/i, /att\b/i] },
];

/**
 * Data Extraction Service
 * Uses regex and heuristics to extract structured data from receipt text
 */
export class ExtractionService {
  /**
   * Extract transaction date from text
   */
  private extractDate(text: string): string | undefined {
    const patterns = [
      // MM/DD/YYYY or DD/MM/YYYY
      /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/,
      // YYYY-MM-DD
      /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
      // Month DD, YYYY (e.g., Jan 15, 2024)
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b/i,
      // DD Month YYYY (e.g., 15 January 2024)
      /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return undefined;
  }

  /**
   * Extract amount from text
   */
  private extractAmount(text: string): number | undefined {
    // Look for patterns like "Total: $XX.XX" or "Amount: XX.XX"
    const patterns = [
      // Indian Rupee patterns
      /(?:total|grand\s*total|amount\s*payable|net\s*amount|paid|to\s*pay)[:\s]*(?:₹|rs\.?|inr)\s*(\d+[,\d]*\.?\d{0,2})/i,
      /(?:₹|rs\.?|inr)\s*(\d+[,\d]*\.?\d{0,2})(?:\s*(?:only|\/\-)?)?/i,
      // Dollar patterns
      /(?:total|amount|sum|grand total|balance due)[:\s]*\$?\s*(\d+[,\d]*\.?\d{0,2})/i,
      /\$\s*(\d+[,\d]*\.\d{2})\b/,
      // Generic number patterns
      /(?:^|\s)(\d+[,\d]*\.\d{2})(?:\s|$)/,
    ];

    const amounts: number[] = [];

    for (const pattern of patterns) {
      const matches = text.matchAll(new RegExp(pattern, 'gi'));
      for (const match of matches) {
        const amountStr = match[1].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          amounts.push(amount);
        }
      }
    }

    // Return the largest amount found (likely to be the total)
    return amounts.length > 0 ? Math.max(...amounts) : undefined;
  }

  /**
   * Extract vendor name from text using known vendor patterns
   */
  private extractVendor(text: string): string | undefined {
    // First, check against known vendor patterns
    for (const vendor of KNOWN_VENDORS) {
      for (const pattern of vendor.patterns) {
        if (pattern.test(text)) {
          return vendor.name;
        }
      }
    }

    // Fallback: Try to get the first non-empty line (often the vendor name)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length > 0) {
      // Return first line that's not just numbers/symbols and is reasonably short
      for (const line of lines.slice(0, 5)) {
        // Skip lines that look like dates, amounts, or transaction IDs
        if (line.length > 2 && line.length < 50 && 
            /[a-zA-Z]/.test(line) && 
            !/^(order|invoice|receipt|transaction|date|time|total|amount|tax|gst)/i.test(line) &&
            !/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(line) &&
            !/^[#\d]+$/.test(line)) {
          return line;
        }
      }
    }

    return undefined;
  }

  /**
   * Extract order/transaction ID from text
   */
  private extractOrderId(text: string): string | undefined {
    const patterns = [
      /(?:order\s*(?:id|no|number)?)[:\s#]*([A-Z0-9\-]+)/i,
      /(?:transaction\s*(?:id|no)?)[:\s#]*([A-Z0-9\-]+)/i,
      /(?:invoice\s*(?:id|no|number)?)[:\s#]*([A-Z0-9\-]+)/i,
      /(?:receipt\s*(?:id|no|number)?)[:\s#]*([A-Z0-9\-]+)/i,
      /(?:#)\s*([A-Z0-9\-]{6,})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  /**
   * Extract payment method from text
   */
  private extractPaymentMethod(text: string): string | undefined {
    const patterns = [
      { pattern: /(?:paid\s*(?:via|by|using)|payment\s*(?:method|mode))[:\s]*(.*)/i, extract: 1 },
      { pattern: /\b(upi|gpay|google\s*pay|phonepe|paytm|credit\s*card|debit\s*card|cash|net\s*banking|wallet)\b/i, extract: 0 },
      { pattern: /\b(visa|mastercard|amex|rupay)\b/i, extract: 0 },
    ];

    for (const { pattern, extract } of patterns) {
      const match = text.match(pattern);
      if (match) {
        const result = match[extract].trim();
        // Capitalize payment method
        return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
      }
    }

    return undefined;
  }

  /**
   * Extract description from text with context-aware details
   */
  private extractDescription(text: string, vendor?: string): string | undefined {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Food delivery specific patterns
    const foodPatterns = [
      /(?:restaurant|from|ordered from)[:\s]+([^\n]{3,40})/i,
      /(?:items?|dish|meal)[:\s]+([^\n]{3,50})/i,
      /(?:cuisine|menu)[:\s]+([^\n]{3,40})/i,
    ];

    // Entertainment patterns
    const entertainmentPatterns = [
      /(?:movie|film|show)[:\s]+([^\n]{3,50})/i,
      /(?:tickets?|seats?)[:\s]+([^\n]{3,50})/i,
      /(?:screen|hall|theater)[:\s]+([^\n]{3,40})/i,
    ];

    // Travel patterns
    const travelPatterns = [
      /(?:from|pickup)[:\s]+([^\n]{3,40})(?:to|drop)[:\s]+([^\n]{3,40})/i,
      /(?:trip|ride|journey)[:\s]+([^\n]{3,50})/i,
      /(?:route|destination)[:\s]+([^\n]{3,40})/i,
    ];

    // Shopping patterns
    const shoppingPatterns = [
      /(?:product|item)[:\s]+([^\n]{3,50})/i,
      /(?:brand|model)[:\s]+([^\n]{3,40})/i,
    ];

    // General description patterns
    const generalPatterns = [
      /(?:description|details)[:\s]+(.*)/i,
      /(?:for|regarding)[:\s]+(.*)/i,
    ];

    // Check vendor-specific patterns first
    if (vendor) {
      const vendorLower = vendor.toLowerCase();
      
      // Food delivery apps
      if (/swiggy|zomato|uber eats|doordash|grubhub/i.test(vendorLower)) {
        for (const pattern of foodPatterns) {
          for (const line of lines) {
            const match = line.match(pattern);
            if (match && match[1] && match[1].length > 3) {
              return `Order from ${match[1]}`;
            }
          }
        }
      }
      
      // Movie theaters
      if (/pvr|inox|cinepolis|amc|theater|cinema/i.test(vendorLower)) {
        for (const pattern of entertainmentPatterns) {
          for (const line of lines) {
            const match = line.match(pattern);
            if (match && match[1]) {
              return `Movie: ${match[1]}`;
            }
          }
        }
      }
      
      // Ride sharing
      if (/uber|ola|lyft|rapido/i.test(vendorLower)) {
        const tripPattern = /(?:from|pickup)[:\s]*([^\n,]{3,30}).*?(?:to|drop)[:\s]*([^\n]{3,30})/i;
        const match = text.match(tripPattern);
        if (match && match[1] && match[2]) {
          return `Trip: ${match[1].trim()} to ${match[2].trim()}`;
        }
        for (const pattern of travelPatterns) {
          const travelMatch = text.match(pattern);
          if (travelMatch && travelMatch[1]) {
            return `Ride: ${travelMatch[1]}`;
          }
        }
      }
    }

    // Try general patterns
    for (const pattern of [...generalPatterns, ...shoppingPatterns]) {
      for (const line of lines) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].length > 3 && match[1].length < 100) {
          return match[1].trim();
        }
      }
    }

    // Extract items list if present
    const itemsStart = lines.findIndex(l => /^(?:item|product|order)s?$/i.test(l));
    if (itemsStart >= 0 && itemsStart < lines.length - 1) {
      const items = lines.slice(itemsStart + 1, itemsStart + 4)
        .filter(l => l.length > 2 && l.length < 50 && !/^(?:total|subtotal|tax|amount|qty|price)/i.test(l))
        .join(', ');
      if (items.length > 5) {
        return items.substring(0, 100);
      }
    }

    // Fallback: use first few meaningful lines
    const meaningfulLines = lines
      .filter(l => 
        l.length > 5 && 
        l.length < 60 && 
        !/^(?:order|invoice|receipt|transaction|date|time|total|subtotal|tax|gst|cgst|sgst|amount)/i.test(l) &&
        !/^\d{2}[\/\-]\d{2}[\/\-]\d{4}/.test(l) &&
        !/^[#\d]+$/.test(l)
      )
      .slice(0, 2)
      .join(', ');
      
    return meaningfulLines.substring(0, 100) || 'Transaction';
  }

  /**
   * Extract all fields from receipt text
   */
  extract(text: string): ExtractionResult {
    const vendor = this.extractVendor(text);
    return {
      transactionDate: this.extractDate(text),
      vendor: vendor,
      amount: this.extractAmount(text),
      description: this.extractDescription(text, vendor),
      orderId: this.extractOrderId(text),
      paymentMethod: this.extractPaymentMethod(text),
    };
  }
}
