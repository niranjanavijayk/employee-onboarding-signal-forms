export type EmploymentType = 'Full-time' | 'Contract' | 'Intern';

/** Shape sent to the server (from the assignment). */
export interface Onboarding {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  employmentType: EmploymentType;
  department: string;
  designation: string;
  joiningDate: string;
  endDate: string | null;
  managerEmail: string;
  address: { line1: string; city: string; pin: string };
  skills: { name: string; rating: number }[];
}

/**
 * Form model. Signal Forms treats null/undefined as "no field", so endDate is ''
 * while editing and is converted to null in the submit payload.
 */
export type OnboardingForm = Omit<Onboarding, 'endDate'> & { endDate: string };

export const DEPARTMENTS: Record<string, string[]> = {
  Engineering: ['Frontend Developer', 'Backend Developer', 'QA Engineer'],
  Design: ['UI Designer', 'UX Researcher'],
  HR: ['HR Executive', 'Recruiter'],
};

export const emptyForm = (): OnboardingForm => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  employmentType: 'Full-time',
  department: '',
  designation: '',
  joiningDate: '',
  endDate: '',
  managerEmail: '',
  address: { line1: '', city: '', pin: '' },
  skills: [
    { name: '', rating: 0 },
    { name: '', rating: 0 },
  ],
});
