export enum FeatureFlag {
  developmentMode = 'VITE_APP_FLAG_DEVELOPMENT_MODE',
  demoMode = 'VITE_APP_FLAG_DEMO_MODE',
  configDemo = 'VITE_APP_FLAG_CONFIG_DEMO',
}

export interface IFeatureFlags {
  set(key: FeatureFlag, value: any): void; // set from URL params
  get(key: FeatureFlag): any;
}

export class FeatureFlags {
  static instance?: IFeatureFlags;
}

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

export const isFeatureEnabled = (feature: FeatureFlag) => {
  return FeatureFlags.instance?.get(feature) === 'ON';
};

export const isDevMode = () => isFeatureEnabled(FeatureFlag.developmentMode);
export const isDemoMode = () => isFeatureEnabled(FeatureFlag.demoMode);
export const isConfigDemo = () => isFeatureEnabled(FeatureFlag.configDemo);
