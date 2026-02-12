import React from 'react';

const KoalaIcon = ({ size = 24, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="12" cy="12" r="5.2" stroke={color} strokeWidth="1.5" />
    <circle cx="8.2" cy="9.8" r="1.1" fill={color} />
    <circle cx="15.8" cy="9.8" r="1.1" fill={color} />
    <path d="M11 13.5c0 .6.9 1.5 1 1.5s1-1 1-1.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6.2" cy="7.8" r="2.2" stroke={color} strokeWidth="1.3" />
    <circle cx="17.8" cy="7.8" r="2.2" stroke={color} strokeWidth="1.3" />
  </svg>
);

export default KoalaIcon;
