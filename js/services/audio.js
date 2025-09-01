/**
 * Audio Service
 * Centralized audio management for the game
 */

class AudioService {
  constructor() {
    this.audioCache = new Map();
    this.masterVolume = 1.0;
    this.sfxVolume = 0.7;
    this.musicVolume = 0.5;
    this.isMuted = false;
    
    // Initialize audio context for better performance
    this.initializeAudioContext();
  }
  
  /**
   * Initialize audio context for better performance
   */
  initializeAudioContext() {
    try {
      // Create audio context for web audio API (optional, for advanced features)
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML5 audio');
      this.audioContext = null;
    }
  }
  
  /**
   * Preload an audio file and cache it
   */
  async preloadAudio(key, src) {
    if (this.audioCache.has(key)) {
      return this.audioCache.get(key);
    }
    
    const audio = new Audio();
    audio.preload = 'auto';
    
    return new Promise((resolve, reject) => {
      const handleLoad = () => {
        this.audioCache.set(key, audio);
        audio.removeEventListener('canplaythrough', handleLoad);
        audio.removeEventListener('error', handleError);
        console.log(`Audio preloaded: ${key}`);
        resolve(audio);
      };
      
      const handleError = (error) => {
        audio.removeEventListener('canplaythrough', handleLoad);
        audio.removeEventListener('error', handleError);
        console.error(`Failed to preload audio: ${key}`, error);
        reject(error);
      };
      
      audio.addEventListener('canplaythrough', handleLoad);
      audio.addEventListener('error', handleError);
      audio.src = src;
    });
  }
  
  /**
   * Play a sound effect
   */
  async playSFX(key, options = {}) {
    if (this.isMuted) return;
    
    const {
      volume = this.sfxVolume,
      loop = false,
      playbackRate = 1.0
    } = options;
    
    let audio = this.audioCache.get(key);
    
    if (!audio) {
      console.warn(`Audio not found in cache: ${key}`);
      return;
    }
    
    try {
      // Clone the audio for overlapping plays
      const audioClone = audio.cloneNode();
      audioClone.volume = Math.min(volume * this.masterVolume, 1.0);
      audioClone.loop = loop;
      audioClone.playbackRate = playbackRate;
      
      // Reset to beginning
      audioClone.currentTime = 0;
      
      const playPromise = audioClone.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      // Clean up after playing (for non-looping sounds)
      if (!loop) {
        audioClone.addEventListener('ended', () => {
          audioClone.remove();
        });
      }
      
      return audioClone;
    } catch (error) {
      console.error(`Failed to play audio: ${key}`, error);
    }
  }
  
  /**
   * Play background music
   */
  async playMusic(key, options = {}) {
    if (this.isMuted) return;
    
    const {
      volume = this.musicVolume,
      loop = true,
      fadeIn = false,
      fadeInDuration = 1000
    } = options;
    
    let audio = this.audioCache.get(key);
    
    if (!audio) {
      console.warn(`Music not found in cache: ${key}`);
      return;
    }
    
    try {
      audio.volume = fadeIn ? 0 : Math.min(volume * this.masterVolume, 1.0);
      audio.loop = loop;
      audio.currentTime = 0;
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      // Fade in if requested
      if (fadeIn) {
        this.fadeVolume(audio, 0, volume * this.masterVolume, fadeInDuration);
      }
      
      return audio;
    } catch (error) {
      console.error(`Failed to play music: ${key}`, error);
    }
  }
  
  /**
   * Stop all instances of a sound
   */
  stopSound(key) {
    const audio = this.audioCache.get(key);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }
  
  /**
   * Fade volume over time
   */
  fadeVolume(audio, startVolume, endVolume, duration) {
    const startTime = Date.now();
    const volumeDiff = endVolume - startVolume;
    
    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = startVolume + (volumeDiff * progress);
      
      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };
    
    fade();
  }
  
  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Set SFX volume (0.0 to 1.0)
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
  }
  
  /**
   * Toggle mute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
  }
  
  /**
   * Set mute state
   */
  setMuted(muted) {
    this.isMuted = muted;
  }
  
  /**
   * Get current audio state
   */
  getState() {
    return {
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
      isMuted: this.isMuted,
      cachedSounds: Array.from(this.audioCache.keys())
    };
  }
  
  /**
   * Preload common game sounds
   */
  async preloadGameSounds() {
    const sounds = [
      { key: 'click', src: '/img/click.mp3' },
      // Add more sounds here as needed
    ];
    
    const loadPromises = sounds.map(({ key, src }) => 
      this.preloadAudio(key, src).catch(error => {
        console.warn(`Failed to preload ${key}:`, error);
      })
    );
    
    await Promise.allSettled(loadPromises);
    console.log('Game sounds preloaded');
  }
}

// Create and export singleton instance
export const audioService = new AudioService();

// Initialize game sounds when module loads
audioService.preloadGameSounds();

// Export for convenience
export default audioService;