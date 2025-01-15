declare module "plyr" {
  export interface PlyrProps {
    controls?: string[];
    seekTime?: number;
    keyboard?: { focused: boolean; global: boolean };
  }

  export default class Plyr {
    constructor(target: HTMLElement, options?: PlyrProps);
    destroy(): void;
    play(): Promise<void>;
    pause(): void;
    togglePlay(): void;
    stop(): void;
    restart(): void;
    rewind(time: number): void;
    forward(time: number): void;
    getCurrentTime(): number;
    getDuration(): number;
    getVolume(): number;
    isMuted(): boolean;
    isPlaying(): boolean;
  }
}
