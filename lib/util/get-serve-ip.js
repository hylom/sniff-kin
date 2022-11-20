import os from 'os';

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

function isInIpv4Network(ipAddress, network, prefix) {
  const shift = 32 - prefix;
  const binAddr = ipv4ToBin(ipAddress);
  const binNet = ipv4ToBin(network);

  return (binAddr >> shift) == (binNet >> shift);
}
