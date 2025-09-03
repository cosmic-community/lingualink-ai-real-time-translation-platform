import type { VoiceSettings } from '@/types';

// Speech recognition and synthesis utilities

export class SpeechRecognition {
  private recognition: any;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    if (this.isSupported) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;
    
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  isSupported_(): boolean {
    return this.isSupported;
  }

  startListening(
    language: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ) {
    if (!this.isSupported || !this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    this.recognition.lang = this.getLanguageCode(language);
    
    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;
      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error || 'Unknown error');
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
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
      'Hindi': 'hi-IN'
    };
    
    return languageCodes[language] || 'en-US';
  }
}

export class SpeechSynthesis {
  private synth: globalThis.SpeechSynthesis | null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'speechSynthesis' in window;
    this.synth = this.isSupported ? window.speechSynthesis : null;
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
      'Hindi': 'hi-IN'
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
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(language);
      utterance.rate = settings.speed;
      utterance.pitch = settings.pitch;
      utterance.volume = settings.volume;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error || 'Unknown error'}`));

      this.synth.speak(utterance);
    });
  }

  getVoices(language?: string): SpeechSynthesisVoice[] {
    if (!this.isSupported || !this.synth) return [];

    const voices = this.synth.getVoices();
    
    if (language) {
      const langCode = this.getLanguageCode(language);
      // Fix: Properly handle the case where split might return undefined
      const langPrefix = langCode.split('-')[0];
      if (langPrefix) {
        return voices.filter(voice => voice.lang.startsWith(langPrefix));
      }
    }
    
    return voices;
  }
}

// Utility function to check if speech features are supported
export function getSpeechSupport() {
  return {
    recognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    synthesis: 'speechSynthesis' in window
  };
}