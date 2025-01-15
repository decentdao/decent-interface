import { FeatureFlag, IFeatureFlags } from './featureFlags';

export class EnvironmentFeatureFlags implements IFeatureFlags {
  urlFlags: { [key: string]: any } = {};

  constructor() {
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const keys = urlParams.keys();
    for (const key of keys) {
      if (key.startsWith('VITE_APP_FLAG_')) {
        const value = urlParams.get(key);
        this.set(key as FeatureFlag, value);
      }
    }
  }

  set(key: FeatureFlag, value: any): void {
    this.urlFlags[key] = value;
  }

  get(key: FeatureFlag): any {
    return this.urlFlags[key] ?? import.meta.env[key];
  }
}
