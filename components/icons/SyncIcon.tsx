import React from 'react';

interface SyncIconProps {
  spinning?: boolean;
}

export const SyncIcon: React.FC<SyncIconProps> = ({ spinning = false }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${spinning ? 'animate-spin' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0121.5 13.5M20 20l-1.5-1.5A9 9 0 002.5 10.5"
    />
  </svg>
);