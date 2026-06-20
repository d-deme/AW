import React from 'react';

export const Skeleton = ({ className }: { className?: string; key?: any }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);
