const FEATURE_FLAG_ENVIRONMENT_VARIABLES = {
  devMode: 'VITE_APP_FLAG_DEV',
  demoMode: 'VITE_APP_FLAG_DEMO',
  configMode: 'VITE_APP_FLAG_CONFIG',
} as const;

const FEATURE_FLAG_VALUES = {
  ON: 'on',
  OFF: 'off',
} as const;

type FeatureFlag = keyof typeof FEATURE_FLAG_ENVIRONMENT_VARIABLES;
type FeatureFlagValuesTypes = typeof FEATURE_FLAG_VALUES;
type FeatureFlagValue = FeatureFlagValuesTypes[keyof FeatureFlagValuesTypes];

interface IFeatureFlags {
  set(key: FeatureFlag, value: FeatureFlagValue): void; // set from URL params
  get(key: FeatureFlag): FeatureFlagValue | undefined;
}

export class FeatureFlags {
  static instance?: IFeatureFlags;
}

const envVarToQueryParam = (envVar: string): string => {
  return envVar.replace('VITE_APP_', '').toLowerCase();
};

export class EnvironmentFeatureFlags implements IFeatureFlags {
  urlFlags: { [key: string]: FeatureFlagValue } = {};

  constructor() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Check all feature flags
    (Object.entries(FEATURE_FLAG_ENVIRONMENT_VARIABLES) as Array<[FeatureFlag, string]>).forEach(
      ([key, envVar]) => {
        const queryParam = envVarToQueryParam(envVar);
        const rawValue = urlParams.get(queryParam)?.toLowerCase();
        if (rawValue === FEATURE_FLAG_VALUES.ON || rawValue === FEATURE_FLAG_VALUES.OFF) {
          this.set(key, rawValue);
        }
      },
    );
  }

  set(key: FeatureFlag, value: FeatureFlagValue): void {
    this.urlFlags[key] = value;
  }

  get(key: FeatureFlag): FeatureFlagValue | undefined {
    const envValue = import.meta.env[FEATURE_FLAG_ENVIRONMENT_VARIABLES[key]]?.toLowerCase();
    return (
      this.urlFlags[key] ??
      (envValue === FEATURE_FLAG_VALUES.ON || envValue === FEATURE_FLAG_VALUES.OFF
        ? envValue
        : undefined)
    );
  }
}

export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return FeatureFlags.instance?.get(feature) === FEATURE_FLAG_VALUES.ON;
};

export const isDevMode = () => isFeatureEnabled('devMode');
export const isDemoMode = () => isFeatureEnabled('demoMode');
export const isConfigDemo = () => isFeatureEnabled('configMode');
