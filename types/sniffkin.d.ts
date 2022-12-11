import {
    SniffkinConfig,
    SniffkinProxyConfig,
    SniffkinServerConfig
} from './sniffkin-config';

import { Logger } from './logger';

interface Sniffkin {
    async start(): Promise<void>;
    async stop(): Promise<void>;
    config: SniffkinConfig;
}

interface SniffkinPlugin {
    pluginName: string;
    init(context: PluginContext): void;
}

type eventHandler = (...args: any[]) => void;

interface Plaggable {
    use(plugin: SniffkinPlugin): void;
    defineEvent(name: string, handlers?: Array<eventHandler>): void;
    addHandler(eventName: string, hander: eventHandler): void;
    removeHandler(eventName: string, hander: eventHandler): void;
    executeHandler(eventName: string, ...args: any[]): void;
}

interface SniffkinProxy extends Plaggable {
    config: SniffkinProxyConfig;
    targets: Array<string>;
}

interface SniffkinServer extends Plaggable {
    config: SniffkinServerConfig;
    use(...args: any[]): void;
    getHttpBaseUrl(): string;
    getHttpsBaseUrl(): string;
}

interface PluginContext {
    proxy: SniffkinProxy;
    server: SniffkinServer;
    logger: Logger;
    system: Sniffkin;
}
