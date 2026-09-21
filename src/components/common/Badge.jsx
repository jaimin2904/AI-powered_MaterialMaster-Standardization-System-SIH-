import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success':
        return 'badge-success';
      case 'warning':
        return 'badge-warning';
      case 'danger':
        return 'badge-danger';
      case 'info':
        return 'badge-info';
      case 'ai':
        return 'badge-ai';
      case 'neutral':
      default:
        return 'badge-neutral';
    }
  };

  return (
    <span className={`badge ${getVariantClass()} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
