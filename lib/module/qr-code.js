import { logger } from '../logger.js';

class QrCode {
  init(caller) {
    caller.addHandler('beforeListen',
                      this.registerHandler.bind(this));
  }

  registerHandler(app) {
    logger.debug('register handler for /img/qr/:name');
    app.get('/img/qr/:name', this.qrCodeHandler.bind(this));
  }

  qrCodeHandler(req, res) {
    const name = req.params.name;
    res.status(404);
  }
}

export const qrCode = new QrCode();

