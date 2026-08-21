import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { safeStorageGet, safeStorageSet } from './utils/safeStorage';
import './SupportSidebar.scss';

const CONSENT_STORAGE_KEY = 'mtg-token-generator:cookie-consent';
const ADSENSE_PUBLISHER_ID = process.env.REACT_APP_ADSENSE_PUBLISHER_ID;

type Consent = 'accepted' | 'declined' | null;

function loadConsent(): Consent {
  const stored = safeStorageGet(CONSENT_STORAGE_KEY);
  return stored === 'accepted' || stored === 'declined' ? stored : null;
}

// AdSense's script must only load after the user consents (legal
// requirement, not just a nicety) — see issue #19.
function AdSlot() {
  useEffect(() => {
    if (!ADSENSE_PUBLISHER_ID) return;

    if (!document.querySelector('script[data-adsbygoogle-loader]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-adsbygoogle-loader', 'true');
      document.head.appendChild(script);
    }

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense failed to load', e);
    }
  }, []);

  return (
    <div className="support-sidebar__ad-slot">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export default function SupportSidebar() {
  // No Publisher ID configured (e.g. local dev without the build var set) —
  // still show the donation link, just skip the ad slot entirely.
  const [consent, setConsent] = useState<Consent>(() => loadConsent());

  const handleConsent = (value: 'accepted' | 'declined') => {
    setConsent(value);
    safeStorageSet(CONSENT_STORAGE_KEY, value);
  };

  return (
    <div className="support-sidebar">
      <a
        href="https://buymeacoffee.com/marquesgabriel"
        target="_blank"
        rel="noreferrer"
        className="support-sidebar__bmc-link"
      >
        <img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy me a coffee"
          height={36}
        />
      </a>

      {ADSENSE_PUBLISHER_ID && consent === 'accepted' && <AdSlot />}

      {ADSENSE_PUBLISHER_ID && consent === null && (
        <div className="support-sidebar__consent">
          <Typography variant="caption" display="block" gutterBottom>
            This site can show ads to help support development. Accept cookies to enable them.
          </Typography>
          <div className="support-sidebar__consent-actions">
            <Button size="small" variant="contained" onClick={() => handleConsent('accepted')}>
              Accept
            </Button>
            <Button size="small" variant="outlined" onClick={() => handleConsent('declined')}>
              Decline
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
