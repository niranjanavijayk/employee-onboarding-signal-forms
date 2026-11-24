import {
  applyEach, hidden, max, maxLength, min, minLength, pattern, required, schema, validate,
  validateHttp, email,
} from '@angular/forms/signals';
import { DEPARTMENTS, OnboardingForm } from './models';

/** Whole years between dob and `on` (both yyyy-mm-dd). */
function ageOn(dob: string, on: string): number {
  const [y, m, d] = dob.split('-').map(Number);
  const [Y, M, D] = on.split('-').map(Number);
  return Y - y - (M < m || (M === m && D < d) ? 1 : 0);
}

export const onboardingSchema = schema<OnboardingForm>((p) => {
  // VR-1
  for (const f of [p.firstName, p.lastName]) {
    required(f, { message: 'This field is required' });
    minLength(f, 2, { message: 'Must be at least 2 characters' });
    maxLength(f, 50, { message: 'Must be at most 50 characters' });
    pattern(f, /^[A-Za-z ]+$/, { message: 'Only letters and spaces are allowed' });
  }

  // VR-2 (sync rules first; async check only runs when they pass)
  required(p.email, { message: 'Email is required' });
  email(p.email, { message: 'Enter a valid email address' });
  validateHttp(p.email, {
    request: ({ value }) => (value() ? `/api/check-email?email=${encodeURIComponent(value())}` : undefined),
    onSuccess: (res: { exists: boolean }) =>
      res.exists ? { kind: 'emailExists', message: 'This email already exists' } : null,
    onError: () => ({ kind: 'emailCheckFailed', message: 'Could not verify email. Try again.' }),
  });

  // VR-3
  required(p.phone, { message: 'Phone is required' });
  pattern(p.phone, /^[6-9]\d{9}$/, { message: 'Enter 10 digits starting with 6, 7, 8 or 9' });

  // VR-4
  required(p.dateOfBirth, { message: 'Date of birth is required' });
  required(p.joiningDate, { message: 'Joining date is required' });
  validate(p.dateOfBirth, ({ value, valueOf }) => {
    const dob = value();
    const joining = valueOf(p.joiningDate);
    if (!dob || !joining) return null;
    return ageOn(dob, joining) < 18
      ? { kind: 'underage', message: 'Employee must be at least 18 years old on the joining date' }
      : null;
  });

  // Employment
  required(p.department, { message: 'Select a department' });
  required(p.designation, { message: 'Select a designation' });
  validate(p.designation, ({ value, valueOf }) => {
    if (!value()) return null;
    return (DEPARTMENTS[valueOf(p.department)] ?? []).includes(value())
      ? null
      : { kind: 'designationMismatch', message: 'Designation does not belong to the department' };
  });

  // VR-5
  const needsEndDate = ({ valueOf }: { valueOf: (path: typeof p.employmentType) => string }) =>
    valueOf(p.employmentType) !== 'Full-time';
  hidden(p.endDate, (ctx) => !needsEndDate(ctx));
  required(p.endDate, { when: needsEndDate, message: 'End date is required' });
  validate(p.endDate, (ctx) => {
    if (!needsEndDate(ctx) || !ctx.value()) return null;
    const joining = ctx.valueOf(p.joiningDate);
    return joining && ctx.value() <= joining
      ? { kind: 'endBeforeJoining', message: 'End date must be after the joining date' }
      : null;
  });

  // VR-6
  required(p.managerEmail, { message: 'Manager email is required' });
  email(p.managerEmail, { message: 'Enter a valid email address' });
  validate(p.managerEmail, ({ value, valueOf }) =>
    value() && value().trim().toLowerCase() === valueOf(p.email).trim().toLowerCase()
      ? { kind: 'sameAsEmployee', message: "Manager email can't be the same as the employee's email" }
      : null,
  );

  // VR-7
  required(p.address.line1, { message: 'Address line 1 is required' });
  required(p.address.city, { message: 'City is required' });
  required(p.address.pin, { message: 'PIN is required' });
  pattern(p.address.pin, /^[1-9]\d{5}$/, { message: 'PIN must be 6 digits and cannot start with 0' });

  // VR-8
  minLength(p.skills, 2, { message: 'Add at least 2 skills' });
  maxLength(p.skills, 6, { message: 'You can add at most 6 skills' });
  applyEach(p.skills, (item) => {
    required(item.name, { message: 'Skill name is required' });
    validate(item.name, ({ value, valueOf }) => {
      const name = value().trim().toLowerCase();
      if (!name) return null;
      const count = valueOf(p.skills).filter((s) => s.name.trim().toLowerCase() === name).length;
      return count > 1 ? { kind: 'duplicateSkill', message: 'Skill names must be unique' } : null;
    });
    min(item.rating, 1, { message: 'Rating is required' });
    max(item.rating, 5, { message: 'Rating cannot exceed 5' });
  });
});
