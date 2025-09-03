import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Truncate text to specified length
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Validate translation input
export function validateTranslationInput(text: string): {
  isValid: boolean;
  error?: string;
} {
  if (!text || text.trim().length === 0) {
    return { isValid: false, error: 'Please enter text to translate' };
  }
  
  if (text.length > 5000) {
    return { isValid: false, error: 'Text must be less than 5000 characters' };
  }
  
  return { isValid: true };
}

// Get language flag emoji
export function getLanguageFlag(language: string): string {
  const flags: Record<string, string> = {
    'English': '🇺🇸',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'German': '🇩🇪',
    'Italian': '🇮🇹',
    'Portuguese': '🇵🇹',
    'Russian': '🇷🇺',
    'Chinese': '🇨🇳',
    'Japanese': '🇯🇵',
    'Korean': '🇰🇷',
    'Arabic': '🇸🇦',
    'Hindi': '🇮🇳',
    'Dutch': '🇳🇱',
    'Swedish': '🇸🇪',
    'Norwegian': '🇳🇴',
    'Danish': '🇩🇰',
    'Finnish': '🇫🇮',
    'Polish': '🇵🇱',
    'Czech': '🇨🇿',
    'Hungarian': '🇭🇺',
    'Romanian': '🇷🇴',
    'Bulgarian': '🇧🇬',
    'Croatian': '🇭🇷',
    'Serbian': '🇷🇸',
    'Slovak': '🇸🇰',
    'Slovenian': '🇸🇮',
    'Estonian': '🇪🇪',
    'Latvian': '🇱🇻',
    'Lithuanian': '🇱🇹',
    'Greek': '🇬🇷',
    'Turkish': '🇹🇷',
    'Hebrew': '🇮🇱',
    'Thai': '🇹🇭',
    'Vietnamese': '🇻🇳',
    'Indonesian': '🇮🇩',
    'Malay': '🇲🇾',
    'Tagalog': '🇵🇭'
  };
  
  return flags[language] || '🌐';
}

// Get contrast color for backgrounds
export function getContrastColor(backgroundColor: string): string {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return brightness > 155 ? '#000000' : '#ffffff';
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Generate unique session ID
export function generateSessionId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Debounce function for search/input
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Get popular language pairs for quick access
export function getPopularLanguagePairs(): Array<{
  source: string;
  target: string;
  label: string;
}> {
  return [
    { source: 'English', target: 'Spanish', label: 'EN → ES' },
    { source: 'English', target: 'French', label: 'EN → FR' },
    { source: 'English', target: 'German', label: 'EN → DE' },
    { source: 'English', target: 'Chinese', label: 'EN → ZH' },
    { source: 'Spanish', target: 'English', label: 'ES → EN' },
    { source: 'French', target: 'English', label: 'FR → EN' },
    { source: 'German', target: 'English', label: 'DE → EN' },
    { source: 'Chinese', target: 'English', label: 'ZH → EN' }
  ];
}