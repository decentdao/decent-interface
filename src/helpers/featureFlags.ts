export enum FeatureFlag {
  developmentMode = 'VITE_APP_FLAG_DEVELOPMENT_MODE',
  demoMode = 'VITE_APP_FLAG_DEMO_MODE',
  feature1 = 'VITE_APP_FLAG_FEATURE_1',
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
export const isFeature1 = () => isFeatureEnabled(FeatureFlag.feature1);
