import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private platformId = inject(PLATFORM_ID);

  getClientErrorMessage(error: Error): string {
    if (isPlatformBrowser(this.platformId) && navigator) {
      return navigator.onLine
        ? error.message
          ? error.message
          : 'Something Went Wrong'
        : 'No Internet Connection';
    }
    // Return a fallback error message if the navigator is not available
    return 'An error occurred';
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    return error.message;
  }
}
