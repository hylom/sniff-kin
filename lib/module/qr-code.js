/*
 * QrCode - add QR code endpoint (/img/qr/ca_url) to web server.
 * This endpoint returns QR code PNG image containing CA cert.
 */

import { logger } from '../logger.js';
import qrcode from 'qrcode';

async function renderQrCode(text, option) {
  return new Promise((resolve, reject) => {
    qrcode.toBuffer(text, option, (error, buf) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(buf);
    });
  });
}

class QrCodeModule {
  init(context) {
    context.web.addHandler('beforeListen', this.registerHandler.bind(this));
    this._webServer = context.web;
  }

  registerHandler(app) {
    logger.debug('register handler for /img/qr/ca_url');
    this._webServer.app.get('/img/qr/:name', this.qrCodeHandler.bind(this));
  }

  qrCodeHandler(req, res) {
    const name = req.params.name;
    if (name == 'ca_url') {
      const caPath = this._webServer.config.caCertificatePath;
      const url = this.generateUrl(caPath);
      this.generateAndSendCode(url, req, res);
      return;
    }
    res.status(404);
  }

  async generateAndSendCode(url, req, res) {
    const buf = await renderQrCode(url, { type: 'png' });
    res.type('image/png');
    res.send(buf);
    res.end();
  }

  generateUrl(path) {
    const addr = this._webServer.app.get('exposedAddress');
    let port = this._webServer.app.get('listenPort');
    if (!port || port == 80) {
      port = '';
    } else {
      port = `:${port}`;
    }
    return new URL(path, `http://${addr}${port}/`).toString();
  }
}

export const qrCode = new QrCodeModule();

