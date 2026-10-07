import React, { useState } from 'react';
import { X, Key, Check, Info, RefreshCw, ExternalLink } from 'lucide-react';
import { getWixClientId, setWixClientIdOverride } from '../api/wixClient';

export function ConfigModal({ isOpen, onClose, onSaved }) {
  const currentId = getWixClientId();
  const [inputValue, setInputValue] = useState(currentId);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setWixClientIdOverride(inputValue.trim());
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onSaved();
      onClose();
    }, 400);
  };

  const handleClear = () => {
    setWixClientIdOverride(null);
    setInputValue(import.meta.env.VITE_WIX_CLIENT_ID || '');
    onSaved();
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="config-modal">
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close configuration"
          id="btn-close-config"
        >
          <X size={20} />
        </button>

        <div className="config-modal-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div className="step-icon" style={{ margin: 0 }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Wix Headless Credentials</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Configure your Wix OAuth Client ID for dynamic API calls
              </p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="config-input-group">
              <label htmlFor="wix-client-id-input">
                Wix Headless Client ID (OAuth App ID)
              </label>
              <input
                id="wix-client-id-input"
                type="text"
                className="config-input"
                placeholder="e.g. 12345678-abcd-1234-ef00-123456789abc"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
                <div>
                  <strong>Where to find this in Wix:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '4px', lineHeight: 1.5 }}>
                    <li>Open <strong>Wix Studio / Dashboard</strong>.</li>
                    <li>Go to <strong>Settings → Headless Settings</strong> (or <strong>Developer Center → OAuth Apps</strong>).</li>
                    <li>Copy your <strong>Client ID (App ID)</strong> and paste it here or into your project's <code>.env</code> file as <code>VITE_WIX_CLIENT_ID</code>.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClear}
                title="Reset to .env defaults"
              >
                Reset to .env
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm" id="btn-save-credentials">
                  {successNotice ? <Check size={14} /> : <Key size={14} />}
                  Save &amp; Connect
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
