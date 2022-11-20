import path from 'path';
import { promises as fs } from 'fs';
import { execFile } from 'child_process';

import { logger } from '../logger.js';

const CERT_COMMON_NAME = 'DEBUGGINGPROXY';

function _dirname() {
  return path.dirname(new URL(import.meta.url).pathname);
}

const CA_EXT = `subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true, pathlen:0
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
`;

export class CertManager {
  constructor(config) {
    /*
    const defaultOpts = {
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
    };
    */
    this.options = Object.assign({}, config.certs);
  }

  async _ensureDirectoriesExists() {
    await this._generateDir(this.options.certificatesDirectory);
    await this._generateDir(this.options.keysDirectory);
  }

  async _generateDir(dirname) {
    let stat;
    try {
      stat = await fs.stat(dirname);
    } catch (err) {
      // make directory
      logger.info(`${dirname} missing. create...`);
      await fs.mkdir(dirname);
      return;
    }
    if (stat.isDirectory()) {
      return;
    }
    throw Error(`cannot create directory: ${dirname} exists but not directory`);
  }

  _getPathname(name, hostname='') {
    if (!(name in this.options.outputFiles)) {
      throw Error(`no "${name}" in options.outputFiles`);
    }
    if (typeof this.options.certificatesDirectory === 'undefined') {
      throw Error(`no certificatesDirectory in options`);
    }
    if (typeof this.options.keysDirectory === 'undefined') {
      throw Error(`no keysDirectory in options`);
    }

    let pathname;
    if (name == 'privateKeyForCaCert'
        || name == 'publicKeyForCaCert'
        || name == 'privateKeyForServerCert') {
      pathname = path.join(this.options.keysDirectory,
                           this.options.outputFiles[name]);
    } else {
      pathname = path.join(this.options.certificatesDirectory,
                           this.options.outputFiles[name]);
    }

    if (typeof hostname !== 'undefined') {
      const name = `${hostname}`;
      if (name.length > 0) {
        pathname = pathname.replace('{hostname}', name);
      }
    }

    return pathname;
  }

  async verifyCaCertificate() {
    // currently checking only file exists.
    let stat;
    try {
      stat = await fs.stat(this._getPathname('caCert'));
    } catch (err) {
      return false;
    }
    return stat.isFile();
  }

  async verifyServerCertificate() {
    // currently checking only file exists.
    let stat;
    try {
      stat = await fs.stat(this._getPathname('serverCert'));
    } catch (err) {
      return false;
    }
    return stat.isFile();
  }

  async generateCaCertificate() {
    logger.info("generate CA cert...");
    await this._ensureDirectoriesExists();

    const caPrivKey = this._getPathname('privateKeyForCaCert');
    const caPubKey = this._getPathname('publicKeyForCaCert');
    const caCertCsr = this._getPathname('csrForCaCert');
    const caCert = this._getPathname('caCert');

    await this._generatePrivateKey(caPrivKey);
    await this._generatePublicKey(caPrivKey, caPubKey);
    await this._generateCaCertCsr(caPrivKey, caCertCsr);
    await this._generateCaCert(caCertCsr, caPrivKey, caCert);

    logger.info("done.");
  }

  async generateServerCertificate(hostname) {
    logger.info(`generate server cert for ${hostname} ...`);
    await this._ensureDirectoriesExists();

    const caKey = this._getPathname('privateKeyForCaCert');
    const caCertCsr = this._getPathname('csrForCaCert');
    const caCert = this._getPathname('caCert');

    const serverKey = this._getPathname('privateKeyForServerCert', hostname);
    const serverCertCsr = this._getPathname('csrForServerCert', hostname);
    const serverCert = this._getPathname('serverCert', hostname);
    
    await this._generatePrivateKey(serverKey);
    await this._generateServerCertCsr(serverKey, hostname, serverCertCsr);
    await this._generateServerCert(serverCertCsr, caCert, caKey, serverCert);

    logger.info("done.");
  }

  async _generatePrivateKey(outputPath) {
    // openssl genrsa -out key 2048
    return this._openssl([
      'genrsa', '-out',
      outputPath, '2048'
    ]);
  }

  async _generatePublicKey(privKeyPath, outputPath) {
    // openssl rsa -in privKey -pubout -out pubKey
    return this._openssl([
      'rsa', '-in', privKeyPath,
      '-pubout', '-out', outputPath,
    ]);
  }

  //_generate

  async _generateCaCertCsr(keyPath, outputPath) {
    // openssl req -new -key caKey -subj "/CN=${CERT_COMMON_NAME}" -out caCertCsr
    return this._openssl([
      'req', '-new',
      '-subj', `/CN=${CERT_COMMON_NAME}`,
      '-key', keyPath,
      '-out', outputPath,
    ]);
  }

  async _generateCaCert(csrPath, keyPath, outputPath) {
    // openssl x509 -req -in caCertCsr -signkey caKey -out caCert
    const tmpFile = await this._generateTempFile(CA_EXT, 'ca_ext');

    await this._openssl([
      'x509', '-req',
      '-days', this.options.expiry,
      '-extfile', tmpFile,
      '-in', csrPath,
      '-signkey', keyPath,
      '-out', outputPath,
    ]);

    await this._deleteTempFile(tmpFile);
    return;
  }

  async _generateServerCertCsr(keyPath, domain, outputPath) {
    // openssl req -new -key serverKey -subj "/CN=domain" -out serverCertCsr
    return this._openssl([
      'req', '-new',
      '-subj', `/CN=${domain}`,
      '-key', keyPath,
      '-out', outputPath,
    ]);
  }

  async _generateTempFile(content, fileName) {
    const filePath = path.join(this.options.certificatesDirectory,
                               fileName);
    await fs.writeFile(filePath, content, {encoding: 'utf8'});
    return filePath;
  }

  async _deleteTempFile(filePath) {
    return fs.unlink(filePath);
  }

  async _generateServerCert(csrPath, caCertPath, keyPath, outputPath) {
    // openssl x509 -req -in serverCertCsr -CA caCert -CAkey caKey -CAcreateserial -out serverCert
    return this._openssl([
      'x509', '-req',
      '-days', this.options.expiry,
      '-in', csrPath,
      '-CA', caCertPath,
      '-CAkey', keyPath,
      '-CAcreateserial',
      '-out', outputPath,
    ]);
  }

  async _openssl(args) {
    const cmd = 'openssl';
    const options = {
      stdio: 'pipe',
    };
    
    return new Promise((resolve, reject) => {
      execFile(cmd, args, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
