import { createContext, useContext, useEffect, useState } from "react";
import { getSettings } from "../services/api";

const defaults = {
  company_name: "Impact Construction",
  tagline: "Considered spaces. Precise craft. Dependable delivery.",
  phone: "+233 24 000 0000",
  whatsapp: "233240000000",
  email: "hello@impactconstruction.co",
  address: "Accra, Ghana",
  opening_hours: "Mon-Sat, 8am-6pm",
  description:
    "Construction, renovation, and handy-work delivered with discipline.",
  logo_url: "",
};
const SettingsContext = createContext(defaults);
const SettingsUpdateContext = createContext(() => {});
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaults);
  const updateSettings = (updates) => setSettings((current) => ({ ...current, ...updates }));
  useEffect(() => { const favicon = document.querySelector('link[rel="icon"]') || document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' })); if (settings.logo_url) favicon.href = settings.logo_url; document.title = `${settings.company_name} | Built To Last`; }, [settings.company_name, settings.logo_url]);
  useEffect(() => {
    getSettings()
      .then((data) => setSettings({ ...defaults, ...data }))
      .catch(() => {});
  }, []);
  return (
    <SettingsContext.Provider value={settings}>
      <SettingsUpdateContext.Provider value={updateSettings}>
        {children}
      </SettingsUpdateContext.Provider>
    </SettingsContext.Provider>
  );
}
export function useSettings() {
  return useContext(SettingsContext);
}
export function useUpdateSettings() {
  return useContext(SettingsUpdateContext);
}
export { defaults };
