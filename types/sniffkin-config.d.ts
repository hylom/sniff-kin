import { SniffkinPlugin } from './sniffkin';

interface SniffkinConfig {
    proxy: SniffkinProxyConfig;
    web: SniffkinServerConfig;
    targets: Array<string>;
    network: NetworkConfig;
    certs: CertsConfig;
    plugins: Array<SniffkinPlugin>;
}

interface OutputFiles {
    privateKeyForCaCert: string;
    publicKeyForCaCert: string;
    csrForCaCert: string;
    caCert: string;
    privateKeyForServerCert: string;
    csrForServerCert: string;
    serverCert: string;
}

interface CertsConfig {
    certificatesDirectory: string;
    keysDirectory: string;
    outputFiles: OutputFiles;
    expiry: number;
}

interface NetworkConfig {
    externalIpAddress: {
        network: string;
    };
    bind: string;
}

interface SniffkinProxyConfig {
    port: number;
    sslCaDir: string;
}

interface SniffkinServerConfig {
    port: number;
    caCertificatePath: string;
    caCertificateFile: string;
}

