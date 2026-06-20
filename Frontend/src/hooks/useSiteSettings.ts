// src/hooks/useSiteSettings.ts
import { useEffect, useState } from 'react';
import { getSiteSettings } from '../services/headlessCms';

export function useSiteSettings() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings);
  }, []);

  return settings;
}