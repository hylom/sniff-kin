import { useEffect, useState } from 'react';
import { getLogs } from './lib/connection-log';
import { Expandable } from './Expandable';


const titles = {
  general: 'General',
  requestUrl: 'Request URL',
  requestMethod: 'Request Method',
  statusCode: 'Status Code',
  remoteAddress: 'Remote Address',
  responseHeaders: 'Response Headers',
  requestHeaders: 'Request Headers',
};

export function DetailedLog(props) {
  const log = props.log;
  if (!log) {
    return (
      <div className="DetailedLog">
      </div>
    );
  }

  const item = parseLog(log);

  const generalItems =  Object.keys(item.general).map(key => {
    return (
      <li key={key}>
        <span className="font-bold">{titles[key]}</span>:
        <span>{item.general[key]}</span>
      </li>
    );
  });

  let responseHeaders = [];
  if (item.responseHeaders) {
    responseHeaders = Object.keys(item.responseHeaders).map(key => {
      return (
        <li key={key}>
          <span className="font-bold">{key}</span>:
          <span>{item.responseHeaders[key]}</span>
        </li>
      );
    });
  }

  const requestHeaders = Object.keys(item.requestHeaders).map(key => {
    return (
      <li key={key}>
        <span className="font-bold">{key}</span>:
        <span>{item.requestHeaders[key]}</span>
      </li>
    );
  });

  return (
    <div className="w-full text-sm pb-4">
      <Expandable title={titles.general}>
        <ul>{generalItems}</ul>
      </Expandable>
      <Expandable title={titles.requestHeaders}>
        <ul>{requestHeaders}</ul>
      </Expandable>
      <Expandable title={titles.responseHeaders}>
        <ul>{responseHeaders}</ul>
      </Expandable>
    </div>
  );
}

function parseLog(log) {
  return {
    general: {
      requestUrl: `${log.host}${log.requestUrl}`,
      requestMethod: log.requestMethod,
      statusCode: log.responseStatusCode,
      remoteAddress: `${log.destinationIp}:${log.destinationPort}`,
    },
    responseHeaders: log.responseHeaders,
    requestHeaders: log.requestHeaders,
  };
}
