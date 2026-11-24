import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, of } from 'rxjs';

const TAKEN = new Set(['admin@company.com', 'hr@company.com']);

/** Fakes GET /api/check-email?email=... -> { exists: boolean } after 800 ms. */
export const fakeApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method === 'GET' && req.url.startsWith('/api/check-email')) {
    const email = (new URL(req.urlWithParams, 'http://localhost').searchParams.get('email') ?? '')
      .trim()
      .toLowerCase();
    return of(new HttpResponse({ status: 200, body: { exists: TAKEN.has(email) } })).pipe(delay(800));
  }
  return next(req);
};
