/* eslint-disable prettier/prettier */
export declare class Moo {
  private reqid: number;
  private subkey: number;
  private requests: Record<string, unknown>;
  private mooid: number;
  private logger: any;

  private static _counter: number;

  constructor(private transport: any);

  _subscribe_helper(): void;
  send_request(): void;
  parse(buf: ArrayBuffer): any;
  handle_response(): void;
  clean_up(): void;
}
