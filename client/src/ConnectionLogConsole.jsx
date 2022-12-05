import { useEffect, useState } from 'react';
import { SourceTab } from './SourceTab';
import { getLogs } from './lib/connection-log';
import { LogList } from './LogList';
import { DetailedLog } from './DetailedLog';

export function ConnectionLogConsole() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    getLogs().then(r => setLogs(r))
      .catch(e => setError(e));
  }, []);

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

