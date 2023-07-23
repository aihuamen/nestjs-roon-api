/// <reference types="node"/>

declare module 'node-roon-api-settings' {
  import RoonApi, { MooMessage } from 'node-roon-api';

  export default class RoonApiSettings {
    constructor(roon: RoonApi, opts: SettingOption);

    update_settings(settings: any): void;
  }

  export type GetSettingCallback = (s: RoonSetting) => void;

  export interface SettingOption {
    get_settings: (cb: GetSettingCallback) => void;
    save_settings: (
      req: MooMessage,
      isdryrun: boolean,
      settings: RoonSetting,
    ) => void;
  }

  export interface RoonSetting {
    values: SettingValues;
    layout: SettingLayout[];
    has_error: boolean;
  }

  export type SettingValues = Record<string, any>;

  export interface LabelLayout {
    type: 'label';
    title: string;
  }

  export interface StringLayout {
    type: 'string';
    title: string;
    setting: string;
  }

  export interface DropdownLayout {
    type: 'dropdown';
    title: string;
    values: DropdownLayoutValue[];
    setting: string;
  }

  export interface DropdownLayoutValue {
    title: string;
    value: any;
  }

  export interface IntegerLayout {
    type: 'integer';
    title: string;
    setting: string;
  }

  export interface ZoneLayout {
    type: 'zone';
    title: string;
    setting: string;
  }

  export type SettingLayout =
    | LabelLayout
    | StringLayout
    | IntegerLayout
    | DropdownLayout
    | ZoneLayout;
}
