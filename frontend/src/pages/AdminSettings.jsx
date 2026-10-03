import { useEffect, useState } from 'react';
import { ImagePlus, Save } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import { defaults, useUpdateSettings } from '../context/SettingsContext';
import { authClient } from '../services/auth';
import { getSettings, updateSettings, uploadCompanyLogo } from '../services/api';

const fields = [
  { name: 'company_name', label: 'Company name', section: 'Brand' },
  { name: 'tagline', label: 'Tagline', section: 'Brand' },
  { name: 'description', label: 'Short description', section: 'Brand', wide: true },
  { name: 'phone', label: 'Phone', section: 'Contact', type: 'tel' },
  { name: 'whatsapp', label: 'WhatsApp number', section: 'Contact', type: 'tel' },
  { name: 'email', label: 'Email', section: 'Contact', type: 'email' },
  { name: 'address', label: 'Address', section: 'Contact' },
  { name: 'opening_hours', label: 'Opening hours', section: 'Contact' },
];

export default function AdminSettings() {
  const updateGlobalSettings = useUpdateSettings();
  const [values, setValues] = useState(defaults);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(defaults.logo_url);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getSettings()
      .then((saved) => {
        if (!isMounted) return;
        const { storageConfigured = true, ...savedValues } = saved;
        const nextValues = { ...defaults, ...savedValues };
        setIsConfigured(storageConfigured);
        setValues(nextValues);
        setLogoPreview(nextValues.logo_url || '');
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError.message || 'Unable to load company settings.');
      })
      .finally(() => { if (isMounted) setIsLoading(false); });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => () => {
    if (logoPreview.startsWith('blob:')) URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  const update = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage('');
  };

  const accessToken = async () => {
    if (!authClient) throw new Error('Supabase authentication is not configured.');
    const { data, error: sessionError } = await authClient.auth.getSession();
    if (sessionError) throw sessionError;
    if (!data.session?.access_token) throw new Error('Your admin session has expired. Sign in again to save changes.');
    return data.session.access_token;
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const token = await accessToken();
      const saved = await updateSettings(values, token);
      setValues((current) => ({ ...current, ...saved }));
      updateGlobalSettings(saved);
      setMessage('Company details saved.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to save company settings.');
    } finally {
      setSaving(false);
    }
  };

  const upload = async () => {
    if (!logoFile) return;
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const token = await accessToken();
      const saved = await uploadCompanyLogo(logoFile, token);
      setValues((current) => ({ ...current, ...saved }));
      updateGlobalSettings(saved);
      setLogoPreview(saved.logo_url || '');
      setLogoFile(null);
      setMessage('Company logo updated.');
    } catch (requestError) {
      setError(requestError.message || 'Unable to upload the company logo.');
    } finally {
      setUploading(false);
    }
  };

  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Choose a PNG, JPG, or WEBP image.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The logo must be smaller than 5 MB.');
      event.target.value = '';
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError('');
    setMessage('');
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <div className="admin-top"><div><p className="eyebrow">Workspace / Company profile</p><h1>Company <em>details.</em></h1></div></div>
        {error && <p className="admin-settings-alert is-error" role="alert">{error}</p>}
        {message && <p className="admin-settings-alert is-success" role="status">{message}</p>}
        {!isLoading && !isConfigured && <p className="admin-settings-alert is-warning" role="status">Settings storage is not initialized yet. Apply <code>database/settings-migration.sql</code> in Supabase before saving company changes.</p>}
        <div className="admin-settings-layout">
          <section className="settings-panel admin-settings-panel">
            <div className="admin-settings-intro"><h2>Public company profile</h2><p>These details appear across your website and help customers reach your team.</p></div>
            {isLoading ? <p className="admin-list-message">Loading saved company details…</p> : (
              <form className="settings-form" onSubmit={save}>
                {['Brand', 'Contact'].map((section) => (
                  <fieldset className="admin-settings-group" key={section}>
                    <legend>{section}</legend>
                    <div className="settings-grid">
                      {fields.filter((field) => field.section === section).map((field) => (
                        <label className={field.wide ? 'is-wide' : ''} htmlFor={field.name} key={field.name}>
                          {field.label}
                          {field.name === 'description' ? (
                            <textarea id={field.name} name={field.name} rows={3} value={values[field.name] || ''} onChange={update} />
                          ) : (
                            <input id={field.name} type={field.type || 'text'} name={field.name} value={values[field.name] || ''} onChange={update} />
                          )}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <button className="solid-button dark-button" disabled={!isConfigured || saving || uploading}><Save size={16} />{saving ? 'Saving…' : 'Save company details'}</button>
              </form>
            )}
          </section>

          <aside className="admin-logo-panel">
            <div className="admin-settings-intro"><h2>Company logo</h2><p>Used in the public header and browser tab.</p></div>
            <div className="logo-upload">
              <div className="logo-preview">{logoPreview ? <img src={logoPreview} alt="Company logo preview" /> : <ImagePlus size={27} />}</div>
              <div className="admin-logo-copy"><p className="settings-label">Logo image</p><p className="upload-help">PNG, JPG, or WEBP. Maximum 5 MB.</p><label className="admin-file-button" htmlFor="logo-file">Choose image</label><input id="logo-file" className="admin-file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={selectLogo} /></div>
            </div>
            <button type="button" className="solid-button dark-button" onClick={upload} disabled={!isConfigured || !logoFile || uploading || saving}><ImagePlus size={16} />{uploading ? 'Uploading…' : 'Upload logo'}</button>
          </aside>
        </div>
      </main>
    </div>
  );
}
