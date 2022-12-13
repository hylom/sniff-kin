import PouchDB from 'pouchdb';

const options = {};
const database = new PouchDB('connection_log', options);

export class ConnectionLog {
  constructor() {
    this._sequence = 0;
    this._previousTs = 0;
  }
  
  init(context) {
    context.proxy.addHandler('response', this.writeLog.bind(this));
    context.proxy.addHandler('connect', this.writeLog.bind(this));
    this.logger = context.logger;
  }

  _getId(ts) {
    if (ts == this._previousTs) {
      this._sequence++;
    } else {
      this._previousTs = ts;
      this._sequence = 0;
    }
    return `${ts}.${this._sequence}`;
  }

  formatLog(req, res) {
    const ts = Date.now();
    const source = req.socket.address();

    return {
      timestamp: ts,
      sourceIp: source.address,
      sourcePort: source.port,
      sourceFamily: source.family,
      destinationIp: res.socket.remoteAddress,
      destinationPort: res.socket.remotePort,
      destinationFamily: res.socket.remoteFamily,
      host: req.headers.host || '',
      requestHeaders: req.headers,
      requestHttpVersion: req.httpVersion,
      requestMethod: req.method,
      requestUrl: req.url,
      responseStatusCode: res.statusCode,
      responseHeaders: res.headers,
      _id: this._getId(ts),
    };
  }

  async writeLog(session) {
    const req = session.clientRequest;
    const res = session.serverResponse;
    const log = this.formatLog(req, res);
    try {
      await database.put(log);
    } catch (err) {
      this.logger.debug(err);
    };
  }

  async getLogs(query) {
    const options = {
      include_docs: true,
    };
    if (query.lastId) {
      options.startkey = query.lastId;
      options.skip = 1;
    }
    
    const result = await database.allDocs(options);
    if (result.rows) {
      return result.rows.map(x => (x.doc || {}));
    }
    return [];
  }

}

export const connectionLog = new ConnectionLog();



