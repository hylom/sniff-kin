import { useEffect, useState } from 'react';
import caret from './caret.svg';

export function Expandable(props) {
  const [expanded, setExpanded] = useState(true);
  const listItems = [];
  const list = expanded ? <div className="px-6">{props.children}</div> : '';

  const title = props.title || '';
  const rotate = expanded ? 'rotate-90' : '';
  const marker = <img src={caret} className={`w-3 h-3 inline ${rotate}`}/>;

  function toggleOpen() {
    setExpanded(!expanded);
  }

  return (
    <div className={expanded ? 'open' : 'closed'}>
      <div className="bg-slate-100">
        <span>{marker}</span>
        <span className="font-bold" onClick={toggleOpen}>{title}</span>
      </div>
      { list }
    </div>
  );

}
