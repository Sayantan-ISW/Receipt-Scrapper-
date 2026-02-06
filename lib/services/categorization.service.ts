import { ExpenseCategory } from '../types';
import { VENDOR_CATEGORY_MAP } from '../constants/categories';

/**
 * Categorization Service
 * Categorizes expenses based on vendor name and keywords
 */
export class CategorizationService {
  /**
   * Categorize based on vendor name and description
   */
  categorize(vendor: string, description?: string): ExpenseCategory {
    const searchText = `${vendor} ${description || ''}`.toLowerCase();

    // Check vendor map
    for (const [keyword, category] of Object.entries(VENDOR_CATEGORY_MAP)) {
      if (searchText.includes(keyword)) {
        return category;
      }
    }

    // Default category
    return 'Other';
  }
}
