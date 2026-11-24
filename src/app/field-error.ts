import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

/** Shows "Checking..." while async validation runs, else messages produced by the validation rules. */
@Component({
  selector: 'app-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.has-error]': 'showError()' },
  template: `
    @if (state().pending()) {
      <small class="checking">Checking...</small>
    } @else if (state().touched() && state().invalid()) {
      @for (e of state().errors(); track $index) {
        <small class="error" role="alert">{{ e.message }}</small>
      }
    }
  `,
  styles: `
    small { display: block; margin-top: 2px; font-size: .8rem; }
    .error { color: #c62828; }
    .checking { color: #6b7280; }
  `,
})
export class FieldError {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly state = input.required<FieldState<any>>();
  protected readonly showError = computed(
    () => !this.state().pending() && this.state().touched() && this.state().invalid(),
  );
}
