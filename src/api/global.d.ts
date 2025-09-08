export {};

declare global {
  interface Window {
    electronAPI: {
      invoke: <T = any>(channel: string, ...args: any[]) => Promise<T>;
      getLogs?: () => Promise<any[]>;
      logAction?: (data: {
        username: string;
        action: string;
        details: string;
        scanData?: string;
      }) => void;
    };
  }
}
