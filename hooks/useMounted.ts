'use client';

import { useEffect, useState } from 'react';

/** True after hydration. Use it for values read from localStorage (cart) so server and client HTML match. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}