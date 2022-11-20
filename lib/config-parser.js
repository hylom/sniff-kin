import path from 'path';

class ConfigParser {
  constructor() {
  }

  parse(config) {
    if (!config) {
      throw Error('argument required');
    }
    this._config = config;
    this._required('targets', Array);
    this._optional('network', Object, {});
    this._optional('plugins', Array, []);
    this._optional('certs', Object, {
      certificatesDirectory: './certs',
      keysDirectory: './keys',
      outputFiles: {
        // mitm-proxy needs the following filenames!
        privateKeyForCaCert: 'ca.private.key',
        publicKeyForCaCert: 'ca.public.key',
        csrForCaCert: 'ca-cert.csr',
        caCert: 'ca.pem',
        privateKeyForServerCert: '{hostname}-key.pem',
        csrForServerCert: '{hostname}-cert.csr',
        serverCert: '{hostname}-cert.pem',
      },
      expiry: 30,
    });
    this._optional('proxy', Object, {
      port: 9090,
      sslCaDir: process.cwd(),
    });
    this._optional('web', Object, {
      port: 8080,
      caCertificateUrl: '/ca.pem',
      caCertificateFile: path.join(process.cwd(), 'certs', 'ca.pem'),
    });
  }

  _required(key, type) {
    const value = this._config[key];
    if (typeof value === 'undefined') {
      throw Error(`option "${key}" is required`);
    }
    this._set(key, type, value);
  }

  _optional(key, type, defaultValue) {
    const value = this._config[key];
    if (typeof value === 'undefined') {
      this._set(key, type, defaultValue);
    } else {
      this._set(key, type, value);
    }
  }

  _set(key, type, value) {
    if (type === Array) {
      return this._setArray(key, value);
    }
    if (type === Object) {
      return this._setObject(key, value);
    }
    throw Error(`invalid type: ${type}`);
  }

  _setArray(key, value) {
    this[key] = Array.from(value);
  }

  _setObject(key, value) {
    this[key] = Object.assign({}, value);
  }
}

// export singleton object
export const configParser = new ConfigParser();

