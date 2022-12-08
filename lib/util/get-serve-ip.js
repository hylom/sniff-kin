import os from 'os';

const privateNetworks = [
  { address: '10.0.0.0', prefix: 8 },
  { address: '172.16.0.0', prefix: 12 },
  { address: '192.168.0.0', prefix: 16 },
];

function regularizeCidr(cidr) {
  const { address, prefix } = parseNetworkAddress(cidr);
  const s = 32 - prefix;
  const bin = (ipv4ToBin(address) >> s) << s;
  return `${binToIpv4(bin)}/${prefix}`;
}

export function getConnectedPrivateNetworks() {
  const ifaces = os.networkInterfaces();
  const results = [];
  for (const name in ifaces) {
    const iface = ifaces[name];
    for (const info of iface) {
      if (info.family == 'IPv4' && !info.internal) {
        const { address, prefix } = parseNetworkAddress(info.cidr);
        for (const net of privateNetworks) {
          if (isInIpv4Network(address, net.address, net.prefix)) {
            results.push(info);
            break;
          }
        }
      }
    }
  }
  return results.map(info => info.cidr).map(regularizeCidr);
}
  

export function getServeIp(networkConfig = {}) {
  let externalAddresses = [];
  let externalNetwork;

  if (networkConfig.externalIpAddress) {
    const addr = networkConfig.externalIpAddress;
    if (typeof addr === 'string') {
      externalAddresses.push(addr);
    } else if (Array.isArray(addr)) {
      externalAddresses = addr;
    } else if (typeof addr === 'object' && addr.network) {
      externalNetwork = addr.network;
    }
  }
    
  const result = [];
  const ifaces = os.networkInterfaces();
  for (const name in ifaces) {
    const iface = ifaces[name];
    for (const info of iface) {
      if (info.family == 'IPv4' && !info.internal) {
        if (isMatchedIpv4ForConfig(info.address,
                                   externalAddresses,
                                   externalNetwork)) {
          result.push(Object.assign({name,}, info));
        }
      }
    }
  }
  return result;
}

function isMatchedIpv4ForConfig(target, ipAddresses, network) {
  if (ipAddresses.length) {
    const r = ipAddresses.find(el => (el == target));
    if (r) {
      return true;
    }
  }
  if (network) {
    const { address, prefix } = parseNetworkAddress(network);
    if (isInIpv4Network(target, address, prefix)) {
      return true;
    }
  }
  return false;
}

function parseNetworkAddress(networkAddress) {
  const s = networkAddress.split('/');
  return { address: s[0], prefix: s[1] };
}

function ipv4ToBin(ipAddress) {
  return ipAddress.split('.')
    .map(v => Number(v))
    .reduce((i, v) => (i * 256 + v));
}

function binToIpv4(bin) {
  const result = [0, 0, 0, 0];
  for (let n = 3; n >= 0; n--) {
    result[n] = bin & 0xFF;
    bin >>= 8;
  }
  return result.map(n => n.toString()).join('.');
}

function isInIpv4Network(ipAddress, network, prefix) {
  const shift = 32 - prefix;
  const binAddr = ipv4ToBin(ipAddress);
  const binNet = ipv4ToBin(network);

  return (binAddr >> shift) == (binNet >> shift);
}
