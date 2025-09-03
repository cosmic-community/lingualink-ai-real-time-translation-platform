interface SpeechSupport {
  recognition: boolean;
  synthesis: boolean;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

export function getSpeechSupport(): SpeechSupport {
  if (typeof window === 'undefined') {
    return { recognition: false, synthesis: false };
  }

  const recognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const synthesis = !!(window.speechSynthesis && window.SpeechSynthesisUtterance);

  return { recognition, synthesis };
}

export class SpeechRecognition {
  private recognition: any;
  private isListening = false;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('SpeechRecognition is only available in browser environment');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.setupRecognition();
  }

  private setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  startListening(
    language: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ) {
    if (this.isListening) {
      this.stopListening();
    }

    try {
      // Map language names to speech recognition codes
      const languageMap: Record<string, string> = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Italian': 'it-IT',
        'Portuguese': 'pt-PT',
        'Russian': 'ru-RU',
        'Chinese': 'zh-CN',
        'Japanese': 'ja-JP',
        'Korean': 'ko-KR',
        'Arabic': 'ar-SA',
        'Hindi': 'hi-IN',
        'Dutch': 'nl-NL'
      };

      this.recognition.lang = languageMap[language] || 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }

        onResult(transcript, isFinal);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error during speech recognition';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone found. Please check your microphone.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        onError(errorMessage);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      this.recognition.start();
    } catch (error: any) {
      onError(`Failed to start speech recognition: ${error.message}`);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }
}

export class SpeechSynthesis {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('SpeechSynthesis is only available in browser environment');
    }

    if (!window.speechSynthesis) {
      throw new Error('Speech synthesis not supported in this browser');
    }

    this.synth = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    // Load voices - they might not be immediately available
    const loadVoicesAsync = () => {
      this.voices = this.synth.getVoices();
      
      if (this.voices.length === 0) {
        // Voices not loaded yet, try again after a short delay
        setTimeout(loadVoicesAsync, 100);
      }
    };

    loadVoicesAsync();

    // Listen for voice changes (some browsers fire this event when voices are loaded)
    if ('onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = () => {
        this.voices = this.synth.getVoices();
      };
    }
  }

  async speak(text: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        reject(new Error('No text to speak'));
        return;
      }

      // Stop any current speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Language mapping for speech synthesis
      const languageMap: Record<string, string> = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Italian': 'it-IT',
        'Portuguese': 'pt-PT',
        'Russian': 'ru-RU',
        'Chinese': 'zh-CN',
        'Japanese': 'ja-JP',
        'Korean': 'ko-KR',
        'Arabic': 'ar-SA',
        'Hindi': 'hi-IN',
        'Dutch': 'nl-NL'
      };

      utterance.lang = languageMap[language] || 'en-US';

      // Try to find a suitable voice
      const suitableVoice = this.voices.find(voice => 
        voice.lang.startsWith(utterance.lang.split('-')[0])
      );
      
      if (suitableVoice) {
        utterance.voice = suitableVoice;
      }

      // Speech settings
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      try {
        this.synth.speak(utterance);
      } catch (error: any) {
        reject(new Error(`Failed to start speech synthesis: ${error.message}`));
      }
    });
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }
}