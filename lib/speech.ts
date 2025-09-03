import type { VoiceSettings } from '@/types';

// Speech recognition and synthesis utilities

export class SpeechRecognition {
  private recognition: any;
  private isSupported: boolean;
  private isListening: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
    
    if (this.isSupported) {
      this.initializeRecognition();
    }
  }

  private checkSupport(): boolean {
    if (typeof window === 'undefined') return false;
    
    return !!(
      (window as any).webkitSpeechRecognition || 
      (window as any).SpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition
    );
  }

  private initializeRecognition(): void {
    try {
      const SpeechRecognition = 
        (window as any).webkitSpeechRecognition || 
        (window as any).SpeechRecognition ||
        (window as any).mozSpeechRecognition ||
        (window as any).msSpeechRecognition;
      
      if (!SpeechRecognition) {
        this.isSupported = false;
        return;
      }

      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      this.isSupported = false;
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;
    
    try {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
    } catch (error) {
      console.error('Failed to setup speech recognition:', error);
    }
  }

  isSupported_(): boolean {
    return this.isSupported;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  startListening(
    language: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): void {
    if (!this.isSupported || !this.recognition) {
      onError('Speech recognition is not supported in this browser. Please try using Chrome, Safari, or Edge.');
      return;
    }

    if (this.isListening) {
      this.stopListening();
      setTimeout(() => this.startListening(language, onResult, onError), 100);
      return;
    }

    try {
      this.recognition.lang = this.getLanguageCode(language);
      this.isListening = true;
      
      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };
      
      this.recognition.onresult = (event: any) => {
        try {
          if (event.results && event.results.length > 0) {
            const result = event.results[event.results.length - 1];
            if (result && result[0]) {
              const transcript = result[0].transcript;
              const isFinal = result.isFinal;
              onResult(transcript, isFinal);
              
              if (isFinal) {
                this.isListening = false;
              }
            }
          }
        } catch (resultError) {
          console.error('Error processing speech result:', resultError);
          onError('Error processing speech recognition result');
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errorMessage = this.getErrorMessage(event.error);
        console.error('Speech recognition error:', event.error);
        onError(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      // Request microphone permission and start recognition
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          this.recognition.start();
        })
        .catch((error) => {
          this.isListening = false;
          console.error('Microphone access denied:', error);
          onError('Microphone access is required for speech recognition. Please allow microphone access and try again.');
        });

    } catch (error) {
      this.isListening = false;
      console.error('Failed to start speech recognition:', error);
      onError('Failed to start speech recognition. Please try again.');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  }

  private getErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'no-speech': 'No speech was detected. Please try speaking again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access was denied. Please allow microphone access in your browser settings.',
      'network': 'Network error occurred. Please check your internet connection.',
      'not-supported': 'Speech recognition is not supported in this browser.',
      'bad-grammar': 'Speech recognition grammar error.',
      'language-not-supported': 'The selected language is not supported for speech recognition.',
      'service-not-allowed': 'Speech recognition service is not allowed.'
    };

    return errorMessages[errorCode] || `Speech recognition error: ${errorCode}. Please try again.`;
  }

  private getLanguageCode(language: string): string {
    const languageCodes: Record<string, string> = {
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-BR',
      'Russian': 'ru-RU',
      'Chinese': 'zh-CN',
      'Japanese': 'ja-JP',
      'Korean': 'ko-KR',
      'Arabic': 'ar-SA',
      'Hindi': 'hi-IN',
      'Dutch': 'nl-NL',
      'Swedish': 'sv-SE',
      'Norwegian': 'no-NO',
      'Danish': 'da-DK',
      'Finnish': 'fi-FI',
      'Polish': 'pl-PL',
      'Turkish': 'tr-TR',
      'Thai': 'th-TH'
    };
    
    return languageCodes[language] || 'en-US';
  }
}

export class SpeechSynthesis {
  private synth: globalThis.SpeechSynthesis | null;
  private isSupported: boolean;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.isSupported = this.checkSupport();
    this.synth = this.isSupported ? window.speechSynthesis : null;
    
    if (this.isSupported && this.synth) {
      this.loadVoices();
    }
  }

  private checkSupport(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private loadVoices(): void {
    if (!this.synth) return;

    const updateVoices = () => {
      this.voices = this.synth!.getVoices();
    };

    updateVoices();
    
    // Some browsers load voices asynchronously
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }

    // Fallback for browsers that don't fire the event
    setTimeout(updateVoices, 100);
  }

  isSupported_(): boolean {
    return this.isSupported;
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  getLanguageCode(language: string = 'English'): string {
    const languageCodes: Record<string, string> = {
      'English': 'en-US',
      'Spanish': 'es-ES',
      'French': 'fr-FR',
      'German': 'de-DE',
      'Italian': 'it-IT',
      'Portuguese': 'pt-BR',
      'Russian': 'ru-RU',
      'Chinese': 'zh-CN',
      'Japanese': 'ja-JP',
      'Korean': 'ko-KR',
      'Arabic': 'ar-SA',
      'Hindi': 'hi-IN',
      'Dutch': 'nl-NL',
      'Swedish': 'sv-SE',
      'Norwegian': 'no-NO',
      'Danish': 'da-DK',
      'Finnish': 'fi-FI',
      'Polish': 'pl-PL',
      'Turkish': 'tr-TR',
      'Thai': 'th-TH'
    };
    
    return languageCodes[language] || 'en-US';
  }

  speak(
    text: string,
    language: string,
    settings: VoiceSettings = { speed: 1, pitch: 1, volume: 1 }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported || !this.synth) {
        reject(new Error('Speech synthesis is not supported in this browser. Please try using Chrome, Safari, or Edge.'));
        return;
      }

      if (!text || text.trim().length === 0) {
        reject(new Error('No text provided for speech synthesis'));
        return;
      }

      // Stop any current speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const langCode = this.getLanguageCode(language);
      
      utterance.lang = langCode;
      utterance.rate = Math.max(0.1, Math.min(10, settings.speed));
      utterance.pitch = Math.max(0, Math.min(2, settings.pitch));
      utterance.volume = Math.max(0, Math.min(1, settings.volume));

      // Try to find a voice for the language
      const availableVoices = this.getVoices(language);
      if (availableVoices.length > 0) {
        utterance.voice = availableVoices[0];
      }

      let hasEnded = false;

      utterance.onend = () => {
        if (!hasEnded) {
          hasEnded = true;
          resolve();
        }
      };

      utterance.onerror = (event: any) => {
        if (!hasEnded) {
          hasEnded = true;
          const errorMessage = `Speech synthesis error: ${event.error || 'Unknown error'}`;
          console.error(errorMessage, event);
          reject(new Error(errorMessage));
        }
      };

      // Timeout fallback for browsers that don't fire events reliably
      setTimeout(() => {
        if (!hasEnded) {
          hasEnded = true;
          resolve();
        }
      }, Math.max(5000, text.length * 100)); // Estimate based on text length

      try {
        this.synth.speak(utterance);
      } catch (error) {
        if (!hasEnded) {
          hasEnded = true;
          reject(new Error(`Failed to start speech synthesis: ${error}`));
        }
      }
    });
  }

  getVoices(language?: string): SpeechSynthesisVoice[] {
    if (!this.isSupported || !this.synth) return [];

    // Refresh voices if empty (some browsers need this)
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    
    if (language) {
      const langCode = this.getLanguageCode(language);
      const langPrefix = langCode.split('-')[0];
      
      if (langPrefix) {
        return this.voices.filter(voice => 
          voice.lang.toLowerCase().startsWith(langPrefix.toLowerCase())
        );
      }
    }
    
    return this.voices;
  }
}

// Utility function to check if speech features are supported
export function getSpeechSupport() {
  if (typeof window === 'undefined') {
    return {
      recognition: false,
      synthesis: false
    };
  }
  
  const recognition = !!(
    (window as any).webkitSpeechRecognition || 
    (window as any).SpeechRecognition ||
    (window as any).mozSpeechRecognition ||
    (window as any).msSpeechRecognition
  );
  
  const synthesis = 'speechSynthesis' in window;
  
  return {
    recognition,
    synthesis
  };
}

// Test speech recognition availability
export async function testSpeechRecognition(): Promise<boolean> {
  const support = getSpeechSupport();
  if (!support.recognition) return false;

  try {
    const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      return true;
    }
  } catch (error) {
    console.warn('Microphone access test failed:', error);
  }
  
  return false;
}