import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

/** Reusable 1-5 star control. Works with [formField] via FormValueControl (no ControlValueAccessor). */
@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stars" role="radiogroup" aria-label="Rating" [class.invalid]="invalid() && touched()">
      @for (n of stars; track n) {
        <button
          type="button"
          role="radio"
          class="star"
          [class.on]="n <= value()"
          [disabled]="disabled()"
          [attr.aria-checked]="n === value()"
          [attr.aria-label]="n + (n === 1 ? ' star' : ' stars')"
          (click)="select(n)"
          (blur)="touch.emit()"
        >★</button>
      }
    </div>
  `,
  styles: `
    .stars { display: inline-flex; gap: 2px; }
    .star { background: none; border: 0; font-size: 1.7rem; line-height: 1; cursor: pointer; color: #c9ced6; padding: 0 2px; }
    .star.on { color: #f5a623; }
    .star:hover:not(:disabled) { transform: scale(1.15); }
    .star { transition: transform .1s, color .1s; }
    .star:disabled { cursor: not-allowed; opacity: .5; }
    .invalid .star:not(.on) { color: #e5a3a3; }
  `,
})
export class StarRating implements FormValueControl<number> {
  readonly value = model(0);
  readonly touch = output<void>();
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly touched = input(false);

  protected readonly stars = [1, 2, 3, 4, 5];

  protected select(n: number) {
    if (this.disabled()) return;
    this.value.set(n);
    this.touch.emit();
  }
}
