/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";

export function Logo({ className = "h-5" }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex items-center select-none ${className}`}>
      {!hasError ? (
        <img
          src="https://i.imgur.com/8D0XQM9.png"
          alt="NUVA Logo"
          onError={() => setHasError(true)}
          className="h-full w-auto object-contain max-h-[48px]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-sans text-lg sm:text-xl font-medium tracking-[0.4em] uppercase text-black">
          NUVA
        </span>
      )}
    </div>
  );
}

export function MiniLogo({ className = "h-4" }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`flex items-center select-none ${className}`}>
      {!hasError ? (
        <img
          src="https://i.imgur.com/8D0XQM9.png"
          alt="NUVA Mini Logo"
          onError={() => setHasError(true)}
          className="h-full w-auto object-contain max-h-[32px]"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-sans tracking-widest text-xs uppercase font-medium text-black">
          NUVA
        </span>
      )}
    </div>
  );
}
