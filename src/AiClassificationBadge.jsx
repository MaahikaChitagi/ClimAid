import React from 'react';

const TYPE_LABELS = {
  flood: 'Flood',
  wildfire: 'Wildfire',
  storm: 'Storm',
};

const SEVERITY_STYLES = {
  low: 'bg-[#E0FCCE] text-[#123524]',
  moderate: 'bg-[#FCEEB5] text-[#5c4a12]',
  severe: 'bg-[#FFD0C8] text-[#7a2418]',
};

export default function AiClassificationBadge({ classification, compact = false }) {
  if (!classification?.disasterType) return null;

  const typeLabel = TYPE_LABELS[classification.disasterType] || classification.disasterType;
  const severity = classification.severity || 'unknown';
  const confidence = Math.round((classification.disasterConfidence || 0) * 100);

  if (compact) {
    return (
      <span className={`px-2 py-1 text-[11px] font-semibold rounded-full ${SEVERITY_STYLES[severity] || 'bg-white/80 text-gray-700'}`}>
        AI {typeLabel} · {severity} · {confidence}%
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-[#5B7A8A]/15 text-[#123524]">
        AI {typeLabel} {confidence}%
      </span>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${SEVERITY_STYLES[severity] || 'bg-gray-100 text-gray-600'}`}>
        {severity} damage
      </span>
    </div>
  );
}
