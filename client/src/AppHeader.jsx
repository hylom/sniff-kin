import { useEffect, useState } from 'react';
import { DropDown, DropDownTitle, DropDownContainer } from './DropDown';
import { baseUrl } from './lib/base-url';

export function AppHeader() {
  
  return (
    <header className="w-full p-0 m-0 mb-4 border px-2 z-50">
      <div className="flex flex-row text-slate-500">
        <div className="grow-0 font-mono font-black text-xl">SNIFF-KIN</div>
        <div className="grow text-right">
          <DropDown justify="right" title="Root CA Certificate" className="z-50">
            <div className="drop-shadow-md bg-slate-50 border-solid text-center border border-slate-800 p-2 w-48">
              <img src={`${baseUrl()}img/qr/ca_url`}
                   className="w-fit m-auto" />
              <a href="/ca.pem">Download</a>
            </div>
          </DropDown>
        </div>
      </div>
    </header>
  );
}
