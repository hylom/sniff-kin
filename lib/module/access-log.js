import morgan from 'morgan';

morgan.token('host', (req, res) => req.headers.host);

const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :host:url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

const morganLog = morgan(logFormat);

class AccessLog {
  init(context) {
    context.proxy.addHandler('response', this.writeAccessLog.bind(this));
    this.logger = context.logger;
  }

  writeAccessLog(session) {
    const req = session.clientRequest;
    const res = session.serverResponse;
    morganLog(req, res, () => {});
  }
}

export const accessLog = new AccessLog();

