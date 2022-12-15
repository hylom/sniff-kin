# Sniff-kin: MITM connection sniffer proxy framework for Web debugging

Sniff-kin is a Web MITM debugging proxy. Easy to install and set up. Extendable with plugin feature. And, completely free.

# What is Web MITM debugging proxy?

Web MITM debugging proxy is a proxy server to monitor HTTP/HTTPS connection. You can monitor full data exchanged between client and server using this proxy.

# Requirement

 * Node.js v18.x or later
 * openssl 1.1.1 or later
 
Note: I believe that works on recent versions of Windows, Linux, and macOS.

# How to install and use

## Install using npm or npx command

You can install Sniff-kin using npm command and execute using npx command.

```
$ npm i sniffkin
$ npx sniffkin
```

Or you can run Sniff-kin directly with npx command.

```
$ npx sniffkin
```


## Install via github

```
$ git clone https://github.com/hylom/sniff-kin
$ cd sniff-kin
$ npm i
$ npm start
```

# Configuration

You can configure Sniff-kin with `sniff.config.mjs` file. This file is JavaScript ES module and must export `config` object. By default, Sniff-kin asks to create this files. Or, you can create this file with `init` subcommand.

```
$ npx sniffkin init

(or)

$ npm run init
```

# Plugins

You can extend Sniff-kin with plugins.

## Official plugins

 * Sniff-kin session processor: https://github.com/hylom/sniffkin-session-processor
   - Plugin to manipulate request and response.

