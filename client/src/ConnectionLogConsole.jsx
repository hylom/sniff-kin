import { useEffect, useState } from 'react';
import { SourceTab } from './SourceTab';
import { getLogs } from './lib/connection-log';
import { LogList } from './LogList';
import { DetailedLog } from './DetailedLog';

export function ConnectionLogConsole() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollingInterval = 5000;

  useEffect(() => {
    getLogs()
      .then(r => {
        setLogs(r);
        setPolling(true);
      })
      .catch(e => setError(e));
  }, []);

  function updateLogs() {
    const param = {};
    const lastId = logs.length ? logs.at(-1)._id : 0;
    if (lastId) {
      param.lastId = lastId;
    }
    console.log(param);
    getLogs(param)
      .then(r => {
        if (r.length) {
          setLogs(logs.concat(r));
        }
      })
      .catch(e => setError(e));
  }

  useEffect(() => {
    if (polling) {
      const tId = setInterval(updateLogs, pollingInterval);
      return () => clearInterval(tId);
    }
  }, [updateLogs, polling]);

  const onSelectLog = logId => {
    console.log(`${logId} is selected.`);
    const log = logs.find(el => (el._id == logId));
    if (log) {
      setSelectedLog(log);
    }
  };

  const detailedLog = selectedLog ? <DetailedLog log={selectedLog} /> : '';

  return (
    <div className="ConnectionLogConsole container mx-auto px-1 w-auto">
      <div className="sticky top-0 bg-white">
        {detailedLog}
      </div>
      <LogList logs={logs} onSelectLog={onSelectLog}/>
    </div>
  );
}

