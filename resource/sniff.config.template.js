export const config = {
  // targets: set the domain name to sniff
  targets: [
    'example.com',
  ],
  network: {
    externalIpAddress: {
      // network.externalIpAddress.network: network exposing proxy and web server
      network: '192.168.1.0/24',
    },
    // network.bind: IP address to listen proxy and web server
    bind: '0.0.0.0',
  },
  plugins: [],
};

