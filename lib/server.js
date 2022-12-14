import http from 'http';
import path from 'path';

import { ProxyServer } from './proxy-server.js';
import { WebServer } from './web-server.js';
import { CertManager } from './cert-manager/index.js';
import { logger } from './logger.js';
import { accessLog } from './module/access-log.js';
import { connectionLog } from './module/connection-log.js';
import { configParser } from './config-parser.js';
import { getServeIp } from './util/get-serve-ip.js';
import { qrCode } from './module/qr-code.js';

export class Server {
  constructor(config) {
    this.config = configParser;
    this.config.parse(config);
    this._ready = this.prepareServers();
  }

  async prepareServers() {
    this.certManager = new CertManager(this.config);
    if (!await this.certManager.verifyCaCertificate()) {
      await this.certManager.generateCaCertificate();
    }
    this.proxyServer = new ProxyServer(this.config);
    this.webServer = new WebServer(this.config);


    // apply plugins
    const context = {
      proxy: this.proxyServer,
      web: this.webServer,
      system: this,
      logger,
    };
    for (const plugin of this.config.plugins) {
      if (typeof plugin.init !== 'function') {
        throw Error(`plugin doesn't have init method`);
      }
      plugin.init(context);
    }

    // internal plugins (modules)
    const modules = [ accessLog, connectionLog, qrCode ];
    for (const mod of modules) {
      mod.init(context);
    }
  }

  startProxyServer(option) {
    this.proxyServer.addHandler('listen', () => {
      logger.debug(`proxy server started on ${option.bindAddress}:${this.config.proxy.port}`);
    });
    this.proxyServer.listen(option);
  }

  startWebServer(option) {
    this.webServer.addHandler('listen', () => {
      logger.debug(`web server started on ${option.bindAddress}:${this.config.web.port}`);
    });
    this.webServer.listen(option);
  }

  async start() {
    await this._ready;

    // get IP addresses to access the servers
    const ifaces = getServeIp(this.config.network);
    let exposedAddress = '0.0.0.0';
    let exposedNetworkInterfaceName  = '';
    if (ifaces.length == 0) {
      logger.info('no matched external network interface found. use 0.0.0.0 to listen.');
    } else {
      if (ifaces.length > 1) {
        logger.info('multiple external network interface found. use first interface.');
      }
      exposedAddress = ifaces[0].address;
      exposedNetworkInterfaceName = ifaces[0].name;
    }
    let bindAddress = exposedAddress;
    if ((this.config.network || {}).bind) {
      bindAddress = this.config.network.bind;
    }

    logger.info(`bind servers to ${bindAddress}...`);
    logger.info(`Proxy URL: http//${exposedAddress}:${this.config.proxy.port}/`);
    logger.info(`Console URL: http://${exposedAddress}:${this.config.web.port}/`);
    const serverOpt = { bindAddress, exposedAddress, };
    this.startWebServer(serverOpt);
    this.startProxyServer(serverOpt);
  }

  async stop() {
    logger.info('stopping server...');
    if (this.webServer) {
      this.webServer.stop(() => {
        logger.info('web server has been closed.');
      });
    }
    if (this.proxyServer) {
      this.proxyServer.stop(() => {
        logger.info('proxy server has been closed.');
      });
    }
    //const logs = await connectionLog.getLogs();
    //console.log(logs);
  }
  
}

