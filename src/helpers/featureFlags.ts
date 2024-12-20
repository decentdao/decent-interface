export interface IFeatureFlags {
  set(key: string, value: any): void; // set from URL params
  get(key: string): any;
}

export class FeatureFlags {
  static instance?: IFeatureFlags;
}

export class EnvironmentFeatureFlags implements IFeatureFlags {
  urlFlags: { [key: string]: any } = {};
  set(key: string, value: any): void {
    this.urlFlags[key] = value;
  }

  get(key: string): any {
    return this.urlFlags[key] ?? import.meta.env[key];
  }
}
