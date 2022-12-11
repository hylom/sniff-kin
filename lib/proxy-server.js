import net from 'net';
import { Proxy as MitmProxy } from 'http-mitm-proxy';
import { logger } from './logger.js';
import { Pluggable } from './pluggable.js';
import { ProxySession } from './session.js';

export class ProxyServer extends Pluggable {
  constructor(config) {
    super();
    this.config = Object.assign({}, config.proxy);
    this.targets = Array.from(config.targets);
    this._parseMitmTargets();
    this.defineEvent('request');
    this.defineEvent('response');
    this.defineEvent('listen');
    this.defineEvent('error');
    this._isRunning = false;
    logger.debug(`ProxyServer is instantiate. config: ${JSON.stringify(config.proxy)}`);
  }

  _parseMitmTargets() {
    const target = this.targets || [];
    for (let i = 0; i < target.length; i++) {
      const s = target[i];
      if (typeof s === 'string') {
        const a = s.split(':');
        if (a.length == 1) {
          target[i] = [s, '*'];
        } else if (a.length == 2 && !isNaN(Number(a[1]))) {
          target[i] = a;
        } else {
          throw Error(`invalid option value: mitmTargets[${i}] (${s})`);
        }
      }
    }
    logger.debug(`mitmTargets: ${target}`);
  }

  _isTargetHost(hostname, port) {
    for (const [h, p] of this.targets) {
      if (h == '*') {
        return true;
      }
      if (h == hostname && (p == '*' || p == port)) {
        return true;
      }
    }
    return false;
  }

  stop(callback) {
    if (!this._isRunning || !this.server) {
      logger.debug('ProxyServer.stop(): proxy server is not running.');
      return;
    }
    if (this._isClosing) {
      return;
    }
    this._isClosing = true;

    if (this.server) {
      // close() method of the http-mitm-proxy doesn't accept callback,
      // use hacky technic.
      if (this.server.httpServer) {
        this.server.httpServer.getConnections((err, count) => {
          if (err) {
            logger.debug(`getConnections of the proxy server failed: ${err}`);
            return;
          }
          logger.debug(`proxy server currently has ${count} connections.`);
        });
        this.server.httpServer.on('close', () => {
          this._isRunning = false;
          if (callback) {
            this._isClosing = false;
            callback();
          }
        });
        this.server.close();
      } else {
        logger.debug("proxy server doesn't have `httpServer` property.");
        this.server.close();
        this._isRunning = false;
        this._isClosing = false;
      }
    }
  }
  
  listen(option) {
    const proxy = new MitmProxy();
    this.server = proxy;
    this.exposedAddress = option.exposedAddress;
    if (option.bind) {
      this.config.host = option.bind;
    }

    proxy.onConnect((req, clientSocket, head, callback) => {
      const { port, hostname } = new URL(`http://${req.url}`);
      if (this._isTargetHost(hostname, port)) {
        callback();
        return;
      }

      logger.info(`CONNECT to ${hostname}:${port}`);
      const connOpt = { port, host: hostname, allowHalfOpen: true, };
      const serverSocket = net.connect(connOpt, () => {
        serverSocket.on("finish", () => {
          clientSocket.destroy();
        });
        clientSocket.on("close", () => {
          serverSocket.end();
        });
        clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                           'Proxy-agent: Node.js-Proxy\r\n' +
                           '\r\n');
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      });

      serverSocket.on("error", (err) => {
        if (err.errno === "ECONNRESET" || err.code === "ECONNRESET") {
          logger.debug(`ECONNRESET on server socket (ignorable): ${err}`);
          return;
        }
        logger.error(JSON.stringify(err));
      });

      clientSocket.on("error", (err) => {
        if (err.errno === "ECONNRESET" || err.code === "ECONNRESET") {
          logger.debug(`ECONNRESET on client socket (ignorable): ${err}`);
          return;
        }
        logger.error(JSON.stringify(err));
      });
    });

    proxy.onError((ctx, err) => {
      if (err.code === "ECONNRESET") {
        logger.debug(`ECONNRESET on proxy socket (ignorable): ${err}`);
        return;
      }
      logger.error('proxy error:', err);
      logger.error(JSON.stringify(err));
    });

    proxy.onRequest((ctx, callback) => {
      const session = new ProxySession(ctx, callback);
      this.executeHandler('request', session);
    });

    proxy.onResponse((ctx, callback) => {
      const session = ProxySession.getSession(ctx);
      this.executeHandler('response', session);
      callback();
    });

    proxy.listen(this.config, err => {
      if (err) {
        this.executeHandler('error', err);
        return;
      }
      this._isRunning = true;
      this.executeHandler('listen');
    });
  }
                       
}
