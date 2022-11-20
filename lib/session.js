import { logger } from './logger.js';

export class RequestFilter {
  constructor(condition=null, requestFilter=null, bodyFilter=null) {
    if (!condition) {
      return;
    }
    this.condition = condition;
    this.requestFilter = requestFilter;
    this.bodyFilter = bodyFilter;
  }
}

export class ResponseFilter {
  constructor(condition=null, responseFilter=null, bodyFilter=null) {
    if (!condition) {
      return;
    }
    this.condition = condition;
    this.responseFilter = responseFilter;
    this.bodyFilter = bodyFilter;
  }
}

export class ProxySession {
  static getSession(context) {
    return context._proxySession;
  }

  constructor(context, callback) {
    this._ctx = context;
    this._requestFilters = [];
    this._responseFilters = [];
    context._proxySession = this;

    // In current implement, constructor is called in onRequest
    this._onRequest = Promise.resolve({context, callback});

    // add onResponse handlers
    this._onResponse = new Promise((resolve, reject) => {
      this._ctx.onResponse((context, callback) => {
        resolve({context, callback});
      });
      this._ctx.onError((context, err, errorKind) => {
        reject({context, error:err, errorKind});
      });
    });

    this._onRequest.then(param => {
      this.onRequest()
        .then(() => {
          param.callback();
        })
        .catch(err => {
          logger.error(err);
          param.callback();
        });
    });

    this._onResponse
      .then(param => {
        this.onResponse()
          .then(() => {
            param.callback();
          })
          .catch(err => {
            logger.error(err);
            param.callback();
          });
      })
      .catch(param => {
          logger.error(param.error);
          logger.error(param.errorKind);
      });
  }

  async onRequest() {
    logger.debug('check conditions on request...');
    for (const filter of this._requestFilters) {
      logger.debug(`filter: ${filter}`);
      if (filter.condition(this.clientRequest)) {
        logger.debug('match condtion');
        if (filter.requestFilter) {
          logger.debug('apply request filter');
          filter.requestFilter(this.serverRequest);
        }
        if (filter.bodyFilter) {
          logger.debug('add request body filter.');
          this._ctx.addRequestFilter(filter.bodyFilter);
        }
      }
    }
  }

  async onResponse() {
    logger.debug('check conditions on response...');
    for (const filter of this._responseFilters) {
      logger.debug(`filter: ${filter.condition}`);
      if (filter.condition(this.clientRequest, this.serverResponse)) {
        logger.debug('match condtion');
        if (filter.responseFilter) {
          logger.debug('apply response filter');
          filter.responseFilter(this.clientRequest,
                                this.clientResponse);
        }
        if (filter.bodyFilter) {
          logger.debug('add response body filter.');
          this._ctx.addResponseFilter(filter.bodyFilter);
        }
      }
    }
  }

  /*
  async onRequestData(chunk) {}
  async onRequestEnd() {}
  async onResponseData(chunk) {}
  async onResponseEnd() {}
  */

  addRequestFilter(filterOrCondition,
                   requestFilter=null,
                   filter=null) {
    let f;
    if (requestFilter === null) {
      f = filterOrCondition;
    } else {
      f = new RequestFilter(filterOrCondition,
                                 requestFilter,
                                 filter);
    }
    logger.debug(`session: add request filter`);
    this._requestFilters.push(f);
  }

  addResponseFilter(filterOrCondition,
                    responseFilter=null,
                    filter=null) {
    let f;
    if (responseFilter === null) {
      f = filterOrCondition;
    } else {
      f = new RequestFilter(filterOrCondition,
                                 responseFilter,
                                 filter);
    }
    logger.debug(`session: add response filter`);
    this._responseFilters.push(f);
  }

  get clientRequest() {
    return this._ctx.clientToProxyRequest;
  }

  get clientResponse() {
    return this._ctx.proxyToClientResponse;
  }

  get serverRequest() {
    if (this._ctx.proxyToServerRequest) {
      return this._ctx.proxyToServerRequest;
    }
    return this._ctx.proxyToServerRequestOptions;
  }
  
  get serverResponse() {
    return this._ctx.serverToProxyResponse;
  }
}
