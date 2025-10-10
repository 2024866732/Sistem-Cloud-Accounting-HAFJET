// LoyverseConnectButton: OAuth2 connect button for Loyverse POS
import React from 'react';

interface LoyverseConnectButtonProps {
  onConnect: () => void;
  connected: boolean;
}

const LoyverseConnectButton: React.FC<LoyverseConnectButtonProps> = ({ onConnect, connected }) => (
  <button
    onClick={onConnect}
    style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', borderRadius: 8, padding: '12px 24px', fontWeight: 600 }}
    aria-label={connected ? 'Connected to Loyverse POS' : 'Connect Loyverse POS'}
    disabled={connected}
  >
    {connected ? 'Connected' : 'Connect Loyverse POS'}
  </button>
);

export default LoyverseConnectButton;
