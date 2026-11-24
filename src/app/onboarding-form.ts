import { ChangeDetectionStrategy, Component, computed, effect, signal } from '@angular/core';
import { form, FormField, submit } from '@angular/forms/signals';
import { DEPARTMENTS, emptyForm, Onboarding, OnboardingForm } from './models';
import { onboardingSchema } from './onboarding.schema';
import { StarRating } from './star-rating';
import { FieldError } from './field-error';

@Component({
  selector: 'app-onboarding-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, StarRating, FieldError],
  templateUrl: './onboarding-form.html',
  styleUrl: './onboarding-form.css',
})
export class OnboardingFormComponent {
  protected readonly model = signal<OnboardingForm>(emptyForm());
  protected readonly f = form(this.model, onboardingSchema);

  protected readonly departments = Object.keys(DEPARTMENTS);
  protected readonly designations = computed(() => DEPARTMENTS[this.model().department] ?? []);
  protected readonly successName = signal('');

  /** Progress bar: a step is done when all of its fields are valid. */
  protected readonly steps = computed(() => {
    const f = this.f;
    const all = (...fs: Array<() => { valid(): boolean }>) => fs.every((x) => x().valid());
    const needsEnd = this.model().employmentType !== 'Full-time';
    const flags = [
      all(f.firstName, f.lastName, f.email, f.phone, f.dateOfBirth),
      all(f.employmentType, f.department, f.designation, f.joiningDate, f.managerEmail, ...(needsEnd ? [f.endDate] : [])),
      all(f.address.line1, f.address.city, f.address.pin),
      all(f.skills),
    ];
    const firstOpen = flags.indexOf(false);
    return ['Personal', 'Employment', 'Address', 'Skills'].map((label, i) => ({
      label,
      done: flags[i],
      active: i === firstOpen,
    }));
  });

  private previousDepartment = '';

  constructor() {
    // Clear designation whenever the department changes.
    effect(() => {
      const dept = this.model().department;
      if (dept !== this.previousDepartment) {
        this.previousDepartment = dept;
        this.model.update((m) => ({ ...m, designation: '' }));
      }
    });
  }

  protected addSkill() {
    if (this.model().skills.length >= 6) return;
    this.model.update((m) => ({ ...m, skills: [...m.skills, { name: '', rating: 0 }] }));
  }

  protected removeSkill(index: number) {
    this.model.update((m) => ({ ...m, skills: m.skills.filter((_, i) => i !== index) }));
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    this.successName.set('');
    const { firstName, lastName } = this.model();

    const ok = await submit(this.f, async (field) => {
      const v = field().value();
      const payload: Onboarding = {
        ...v,
        endDate: v.employmentType === 'Full-time' ? null : v.endDate || null,
      };
      console.log('Onboarding payload', payload); // replace with a real API call
    });

    if (ok) {
      this.successName.set(`${firstName} ${lastName}`);
      this.model.set(emptyForm());
      this.f().reset();
    }
  }
}
