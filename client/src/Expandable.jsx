import { useEffect, useState } from 'react';

export function Expandable(props) {
  const [expanded, setExpanded] = useState(true);
  const listItems = [];
  const list = expanded ? props.children : '';

  const title = props.title || '';
  const marker = expanded ? '-' : '+';

  return (
    <div>
      <span>{marker}</span>
      <span className="font-bold">{title}</span>
      {list}
    </div>
  );

}
