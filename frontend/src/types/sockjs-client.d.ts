declare module "sockjs-client" {
  interface Options {
    server?: string;
    transports?: string[];
    sessionId?: number | (() => number);
    devel?: boolean;
    debug?: boolean;
    protocol_whitelist?: string[];
    rtt?: number;
    timeout?: number;
    info?: {
      websocket?: boolean;
      cookie_needed?: boolean;
      null_origin?: boolean;
    };
  }

  class SockJS {
    constructor(url: string, protocols?: string | string[] | null, options?: Options);
    protocol: string;
    readyState: number;
    url: string;
    onopen: ((event: any) => void) | null;
    onmessage: ((event: any) => void) | null;
    onclose: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    send(data: string): void;
    close(code?: number, reason?: string): void;
    static CONNECTING: number;
    static OPEN: number;
    static CLOSING: number;
    static CLOSED: number;
  }

  export = SockJS;
}
