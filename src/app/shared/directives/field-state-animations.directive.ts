import { Directive, ElementRef, Input, OnDestroy, Renderer2 } from '@angular/core';

import { DEFAULT_FIELD_STATUS_TIMER_MS } from 'src/app/shared/const';

export enum AnimationState {
  Idle = 'idle',
  Countdown = 'countdown',
  Submitting = 'submitting',
  Success = 'success',
  Error = 'error',
}

export class AnimationStateManager {
  constructor(
    private currentState: AnimationState,
    private onChange: (state: AnimationState) => void,
  ) {}

  toIdle() {
    this.transition(AnimationState.Idle);
  }
  toCountdown() {
    this.transition(AnimationState.Countdown);
  }
  toSubmitting() {
    this.transition(AnimationState.Submitting);
  }
  toSuccess() {
    this.transition(AnimationState.Success);
  }
  toError() {
    this.transition(AnimationState.Error);
  }

  private transition(state: AnimationState) {
    this.onChange(state);
  }
}

@Directive({
  selector: '[fieldStateAnimations]',
  standalone: true,
})
export class FieldStateAnimationsDirective implements OnDestroy {
  @Input()
  public set state(value: AnimationState) {
    this.setState(value);
  }

  private currentState: AnimationState = AnimationState.Idle;
  private transitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
  ) {}

  public ngOnDestroy() {
    this.clearTimeout();
  }

  private setState(newState: AnimationState) {
    this.clearTimeout();
    this.clearStateClass(this.currentState);
    this.currentState = newState;
    this.addStateClass(newState);

    if ([AnimationState.Success, AnimationState.Error].includes(newState)) {
      this.transitionTimeoutId = setTimeout(() => {
        this.currentState = AnimationState.Idle;
        this.clearStateClass(AnimationState.Success);
        this.clearStateClass(AnimationState.Error);
        this.addStateClass(AnimationState.Idle);
      }, DEFAULT_FIELD_STATUS_TIMER_MS);
    }
  }

  private clearStateClass(className: AnimationState) {
    this.renderer.removeClass(this.el.nativeElement, `${className}-state`);
  }

  private addStateClass(className: AnimationState) {
    this.renderer.addClass(this.el.nativeElement, `${className}-state`);
  }

  private clearTimeout() {
    if (this.transitionTimeoutId) {
      clearTimeout(this.transitionTimeoutId);
      this.transitionTimeoutId = null;
    }
  }
}
