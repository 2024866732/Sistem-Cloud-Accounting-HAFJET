// LoyverseManualSyncButton: Manual sync trigger for Loyverse POS integration
import React from 'react';

interface LoyverseManualSyncButtonProps {
  onSync: () => void;
  disabled?: boolean;
}

const LoyverseManualSyncButton: React.FC<LoyverseManualSyncButtonProps> = ({ onSync, disabled }) => (
  <button
    onClick={onSync}
    style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))', borderRadius: 8, padding: '12px 24px', fontWeight: 600 }}
    aria-label="Manual Sync Loyverse POS"
    disabled={disabled}
  >
    Manual Sync
  </button>
);

export default LoyverseManualSyncButton;
