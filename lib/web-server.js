import http from 'http';
import { promises as fs } from 'fs';
import path from 'path';

import morgan from 'morgan';
import express from 'express';
import { logger } from './logger.js';
import { apiHandlers } from './api/index.js';
import { Pluggable } from './pluggable.js';
import { getRootDirectory } from './util/root-directory.js';

const CA_MIMETYPE = 'application/x-x509-ca-cert';

export class WebServer extends Pluggable {
  constructor(config) {
    super();
    this.config = Object.assign({}, config.web);
    this._middlewares = [];

    this.defineEvent('beforeListen');
    this.defineEvent('listen');
    this.defineEvent('error');
    this._morgan = morgan('combined');
    this.use(this._morgan);
    this.use('/api/', apiHandlers);

    logger.debug(`WebServer is instantiate. config: ${JSON.stringify(config.web)}`);
  }

  _setCommonResponseHeader(req, res) {
    res.set('cache-control', 'no-cache');
    res.set('date', new Date().toUTCString());
  }

  async sendCertificate(req, res) {
    const stat = await fs.stat(this.config.caCertificateFile);
    const content = await fs.readFile(this.config.caCertificateFile,
                                      {encoding: 'utf8'});
    const lastMod = new Date(stat.mtimeMs);
    this._setCommonResponseHeader(req, res);
    res.set('content-type', CA_MIMETYPE);
    res.set('last-modified', lastMod.toUTCString());
    res.status(200).send(content).end();
  }

  stop(callback) {
    if (this.server) {
      this.server.close(() => {
        this.server = undefined;
        callback();
      });
    }
  }

  use() {
    // same as expressjs's use([path,] callback [, callback...])
    this._middlewares.push(Array.from(arguments));
  }

  applyMiddlewares() {
    for (const m of this._middlewares) {
      if (typeof m[0] === 'string') {
        logger.debug(`webServer: add middleware for ${m[0]}`);
      } else {
        logger.debug(`webServer: add middleware for all`);
      }
      this.app.use.apply(this.app, m);
    }
  };

  getHttpBaseUrl() {
    const exposedAddr = this.app.get('exposedAddress');
    let port = '';
    if (this.config.port != 80) {
      port = `:${this.config.port}`;
    }
    return `http://${exposedAddr}${port}`;
  }

  getHttpsBaseUrl() {
    return null;
  }

  listen(option) {
    const app = express();
    this.app = app;
    this.app.set('exposedAddress', option.exposedAddress || '127.0.0.1');
    this.app.set('listenPort', this.config.port);

    const staticDir = path.join(getRootDirectory(), 'client/build');
    app.use(express.static(staticDir));
    
    app.get(this.config.caCertificatePath,
            this.sendCertificate.bind(this));
    this.applyMiddlewares();
    const callback = () => {
      this.executeHandler('listen');
    };

    this.executeHandler('beforeListen');
    if (option.bind) {
      this.server = this.app.listen(this.config.port,
                                    option.bind, callback);
    } else {
      this.server = this.app.listen(this.config.port, callback);
    }
  }
}
