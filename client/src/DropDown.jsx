import {useState } from 'react';

export function DropDown(props) {
  const [visibility, setVisibility] = useState(false);
  
  function toggleDropDown() {
    setVisibility(!visibility);
  }

  let pos = 'left-0';
  if (props.justify === 'right') {
    pos = 'right-0';
  }
  const children = visibility ? (<div className={`absolute top-0 ${pos}`}>{props.children}</div>) : '';
  
  return (
    <div className="inline-block">
      <div className="cursor-pointer" onClick={toggleDropDown}>
        {props.title}
      </div>
      <div className={"relative " + props.className}>
        {children}
      </div>
    </div>
  );
}

