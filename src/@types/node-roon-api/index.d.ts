/* eslint-disable prettier/prettier */
/// <reference types="node"/>

declare module 'node-roon-api' {
  import type RoonApiTransport from 'node-roon-api-transport';
  import type RoonApiStatus from 'node-roon-api-status';
  import type RoonApiSettings from 'node-roon-api-settings';
  import type RoonApiBrowse from 'node-roon-api-browse';
  import type RoonApiImage from 'node-roon-api-image';
  export * from './moo';
  export default class RoonApi {
    constructor(o: RoonApiConstructor);
    /**
     * Initializes the services you require and that you provide.
     *
     * @this RoonApi
     * @param {object} services - Information about your extension. Used by Roon to display to the end user what is trying to access Roon.
     * @param {object[]} [services.required_services] - A list of services which the Roon Core must provide.
     * @param {object[]} [services.optional_services] - A list of services which the Roon Core may provide.
     * @param {object[]} [services.provided_services] - A list of services which this extension provides to the Roon Core.
     */
    init_services(o?: RoonInitServices): void;

    /**
     * Begin the discovery process to find/connect to a Roon Core.
     */
    start_discovery(): void;

    /**
     * If not using Roon discovery, call this to connect to the Core via a websocket.
     *
     * @this RoonApi
     * @param {object}          options
     * @param {string}          options.host - hostname or ip to connect to
     * @param {number}          options.port - port to connect to
     * @param {RoonApi~onclose} [options.onclose] - Called once when connect to host is lost
     */
    ws_connect(opts: WSOption): void;

    /**
     * Save a key value pair in the configuration data store.
     * @param {string} key
     * @param {object} value
     */
    save_config(key: string, value: Record<string, any>): void;

    /**
     * Load a key value pair in the configuration data store.
     * @param {string} key
     * @return {object} value
     */
    load_config<T extends Record<string, any>>(key: string): ?T;
  }

  export interface MooMessage {
    moo: any;
    msg: any;
    body: any;

    send_continue(
      name: string,
      body?: Record<string, any>,
      content_type?: any,
    ): void;
    send_complete(
      name: string,
      body?: Record<string, any>,
      content_type?: any,
    ): void;
  }

  export interface RoonApiConstructor {
    extension_id: string;
    display_name: string;
    display_version: string;
    publisher: string;
    email: string;
    website: string;
    core_paired?: (core: Core) => void;
    core_found?: (core: Core) => void;
    core_unpaired?: (core: Core) => void;
    core_lost?: (core: Core) => void;
  }

  export interface RoonInitServices {
    required_services?: RoonRequiredServices[];
    optional_services?: any[];
    provided_services?: RoonProvidedServices[];
  }

  export interface RoonService {
    RoonApiTransport?: RoonApiTransport;
    RoonApiBrowse?: RoonApiBrowse;
    RoonApiImage?: RoonApiImage;
  }

  export interface Core {
    moo: any;
    core_id: string;
    display_name: string;
    display_version: string;
    services: RoonService;
  }

  export interface WSOption {
    host: string;
    port: number;
    onclose: () => void;
  }

  export type RoonRequiredServices = ThisType<
    RoonApiTransport | RoonApiBrowse | RoonApiImage
  >;
  export type RoonProvidedServices = RoonApiStatus | RoonApiSettings;
}
