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
    /**
     * Information about your extension. Used by Roon to display to the end user what is trying to access Roon.
     * @property {string} extension_id - A unique ID for this extension
     * @property {string} display_name - The name of your extension.
     * @property {string} display_version - A version string that is displayed to the user for this extension. Can be anything you want.
     * @property {string} publisher - The name of the developer of the extension.
     * @property {string} website - Website for more information about the extension.
     * @property {string} log_level - How much logging information to print.  "all" for all messages, "none" for no messages, anything else for all messages not tagged as "quiet" by the Roon core.
     * @property {callback} [core_paired] - Called when Roon pairs you.
     * @property {callback} [core_unpaired] - Called when Roon unpairs you.
     * @property {callback} [core_found] - Called when a Roon Core is found. Usually, you want to implement pairing instead of using this.
     * @property {callback} [core_lost] - Called when Roon Core is lost. Usually, you want to implement pairing instead of using this.
     */

    constructor(o: RoonApiConstructor);
    /**
     * Initializes the services you require and that you provide.
     *
     * @param {object} services - Information about your extension. Used by Roon to display to the end user what is trying to access Roon.
     * @param {object[]} [services.required_services] - A list of services which the Roon Core must provide.
     * @param {object[]} [services.optional_services] - A list of services which the Roon Core may provide.
     * @param {object[]} [services.provided_services] - A list of services which this extension provides to the Roon Core.
     */
    init_services(services?: RoonInitServices): void;

    /**
     * Begin the discovery process to find/connect to a Roon Core.
     */
    start_discovery(): void;

    /**
     * If not using Roon discovery, call this to connect to the Core via a websocket.
     *
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
    load_config<T extends Record<string, any>>(key: string): T | null;
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

  /**
   *Information about your extension. Used by Roon to display to the end user what is trying to access Roon.
   */
  export interface RoonApiConstructor {
    /**
     *A unique ID for this extension
     */
    extension_id: string;
    /**
     *The name of your extension.
     */
    display_name: string;
    /**
     *A version string that is displayed to the user for this extension. Can be anything you want.
     */
    display_version: string;
    /**
     *The name of the developer of the extension.
     */
    publisher: string;
    email: string;
    /**
     *Website for more information about the extension.
     */
    website: string;
    /**
     *How much logging information to print.  "all" for all messages, "none" for no messages, anything else for all messages not tagged as "quiet" by the Roon core.
     */
    log_level?: 'none' | 'all';
    /**
     *Called when Roon pairs you.
     */
    core_paired?: (core: Core) => void;
    /**
     *Called when a Roon Core is found. Usually, you want to implement pairing instead of using this.
     */
    core_found?: (core: Core) => void;
    /**
     *Called when Roon unpairs you.
     */
    core_unpaired?: (core: Core) => void;
    /**
     *Called when Roon Core is lost. Usually, you want to implement pairing instead of using this.
     */
    core_lost?: (core: Core) => void;
  }

  /**
   *Information about your extension. Used by Roon to display to the end user what is trying to access Roon.
   */
  export interface RoonInitServices {
    /**
     *A list of services which the Roon Core must provide.
     */
    required_services?: RoonRequiredServices[];
    /**
     *A list of services which the Roon Core may provide.
     */
    optional_services?: any[];
    /**
     *A list of services which this extension provides to the Roon Core.
     */
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
    /**
     * Hostname or IP to connect to
     */
    host: string;
    /**
     * Port to connect to
     */
    port: number;
    /**
     * Called once when connect to host is lost
     */
    onclose: () => void;
  }

  export type RoonRequiredServices = ThisType<
    RoonApiTransport | RoonApiBrowse | RoonApiImage
  >;
  export type RoonProvidedServices = RoonApiStatus | RoonApiSettings;
}
