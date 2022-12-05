import { useEffect, useState } from 'react';
import { getLogs } from './lib/connection-log';

export function LogList(props) {
  const [selectedId, selectId] = useState(0);

  const onSelectLog = props.onSelectLog || (() => {});
  const logs = props.logs || [];

  function selectLog(logId) {
    selectId(logId);
    onSelectLog(logId);
  }

  const cols = logs.map(i => formatLog(i, { selectedId, selectLog }));
  const cellClass = "border-b border-slate-100 p-1 pl-2 text-slate-500";
  const headClass = "bg-slate-100 font-bold";
  return (
    <table className="border-collapse table-auto text-sm w-full">
      <thead className={headClass}>
        <tr>
          <td className={cellClass}>timestamp</td>
          <td className={cellClass}>host</td>
          <td className={cellClass}>dest_port</td>
          <td className={cellClass}>method</td>
          <td className={cellClass}>URL</td>
          <td className={cellClass}>content-type</td>
          <td className={cellClass}>status</td>
        </tr>
      </thead>
      <tbody>
        {cols}
      </tbody>
    </table>
  );
}

function formatLog(item, options) {
  const { selectedId, selectLog } = options;
  const cellClass = "border-b border-slate-100 p-1 pl-2 text-slate-900";
  return (
    <tr
      key={item._id}
      className={(selectedId == item._id) ? 'bg-slate-50' : ''}
      onClick={() => { selectLog(item._id); }}>
      <td className={cellClass}>{formatTimestamp(item.timestamp)}</td>
      <td className={cellClass}>{item.host}</td>
      <td className={cellClass}>{item.destinationPort}</td>
      <td className={cellClass}>{item.requestMethod}</td>
      <td className={cellClass + " max-w-md truncate"}>
        {item.requestUrl}</td>
      <td className={cellClass}>{item.responseHeaders['content-type']}</td>
      <td className={cellClass}>{item.responseStatusCode}</td>
    </tr>
  );
}

function formatTimestamp(ts) {
  const pad = x => ((Number(x) >= 10) ? x : `0${x}`);
  const dt = new Date(ts);
  const date = `${dt.getMonth()+1}/${dt.getDate()}`;
  const time = `${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  return `${date} ${time}`;
}
