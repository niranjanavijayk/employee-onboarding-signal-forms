import { Component } from '@angular/core';
import { OnboardingFormComponent } from './onboarding-form';

@Component({
  selector: 'app-root',
  imports: [OnboardingFormComponent],
  template: `<app-onboarding-form />`,
})
export class App {}
