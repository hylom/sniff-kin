export class Pluggable {
  use(plugin) {
    if (typeof plugin.init !== 'function') {
      throw Error(`plugin doesn't have init method`);
    }
    plugin.init(this);
  }

  _assure(propertyName, type, defaultValue) {
    if (typeof this[propertyName] !== type) {
      this[propertyName] = defaultValue;
    }
  }

  defineEvent(name, handlers=[]) {
    this._assure('handlers', 'object', {});
    this.handlers[name] = [].concat(handlers);
  }

  addHandler(eventName, handler) {
    this._assure('handlers', 'object', {});
    try {
      this.handlers[eventName].push(handler);
    } catch (err) {
      throw Error('invalid eventName)');
    }
  }

  removeHandler(eventName, handler) {
    this._assure('handlers', 'object', {});
    let i;
    try {
      i = this.handlers[eventName].findIndex(el => (el === handler));
    } catch (err) {
      throw Error('invalid eventName)');
    }
    if (i == -1) {
      return;
    }
    this.handlers[eventName].splice(i, 1);
  }

  executeHandler(eventName, ...args) {
    this._assure('handlers', 'object', {});
    if (!Array.isArray(this.handlers[eventName])) {
      throw Error('invalid eventName');
    }
    for (const fn of this.handlers[eventName]) {
      fn.apply(null, args);
    }
  }
}

