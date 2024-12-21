import { ChangeDetectorRef } from '@angular/core';

export enum IndicatorState {
  Idle = 'idle',
  Countdown = 'countdown',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error'
}

export class AnimationStateManager {
  private state: IndicatorState = IndicatorState.Idle;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(private cdRef: ChangeDetectorRef) {
  }

  public get currentState(): IndicatorState {
    return this.state;
  }

  public setState(newState: IndicatorState): void {
    this.clearTimeout();
    this.state = newState;
    this.cdRef.markForCheck();
  }

  public setStateWithDelay(newState: IndicatorState): void {
    this.clearTimeout();
    this.state = IndicatorState.Idle;
    this.timeoutId = setTimeout(() => {
      this.state = newState;
      this.cdRef.markForCheck();
    });
  }

  public startCountdown(onComplete: () => void, delayMs: number): void {
    this.clearTimeout();
    this.state = IndicatorState.Idle;
    this.timeoutId = setTimeout(() => {
      this.state = IndicatorState.Countdown;
      this.cdRef.markForCheck();

      this.timeoutId = setTimeout(() => {
        this.timeoutId = null;
        onComplete();
      }, delayMs);
    });
  }

  private clearTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
