//import { Browser, BrowserContext, test, expect } from '@playwright/test';

export async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
