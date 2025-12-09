declare module "@studio-freight/lenis" {
  export interface LenisOptions {
    duration?: number;
    easing?: (t: number) => number;
    smoothWheel?: boolean;
    smoothTouch?: boolean;
    lerp?: number;
    infinite?: boolean;
    orientation?: "vertical" | "horizontal";
    gestureOrientation?: "vertical" | "horizontal" | "both";
  }

  export default class Lenis {
    constructor(options?: LenisOptions);
    raf(time: number): void;
    destroy(): void;
    start(): void;
    stop(): void;
  }
}
