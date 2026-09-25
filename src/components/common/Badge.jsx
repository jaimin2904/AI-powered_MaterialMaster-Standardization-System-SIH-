import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  className = ''
}) => {
  const variantStyles = {
    neutral: {
      background: '#F3F5F4',
      color: '#5F6963',
      border: '#E3E8E5',
      dot: '#8A938E'
    },

    success: {
      background: '#EAF7F1',
      color: '#087A50',
      border: '#CDEBDD',
      dot: '#16A163'
    },

    warning: {
      background: '#FFF6DF',
      color: '#A86F00',
      border: '#F3E2B2',
      dot: '#F59E0B'
    },

    danger: {
      background: '#FFF0F0',
      color: '#C53D3D',
      border: '#F3D2D2',
      dot: '#EF4444'
    },

    info: {
      background: '#EEF5FF',
      color: '#3567A8',
      border: '#D6E4FA',
      dot: '#4F83CC'
    },

    ai: {
      background: '#F0ECFF',
      color: '#6941C6',
      border: '#DED5FA',
      dot: '#8B5CF6'
    }
  };

  const currentStyle =
    variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',

        minHeight: '24px',
        padding: '4px 9px',

        borderRadius: '8px',

        background: currentStyle.background,
        color: currentStyle.color,
        border: `1px solid ${currentStyle.border}`,

        fontSize: '10px',
        lineHeight: 1,
        fontWeight: 700,
        letterSpacing: '-0.05px',

        whiteSpace: 'nowrap',
        verticalAlign: 'middle',

        transition:
          'background 0.18s ease, border-color 0.18s ease',

        boxSizing: 'border-box'
      }}
    >
      {/* Status indicator */}
      <span
        aria-hidden="true"
        style={{
          width: '6px',
          height: '6px',
          minWidth: '6px',
          borderRadius: '50%',
          background: currentStyle.dot,
          boxShadow: `0 0 0 2px ${currentStyle.background}`
        }}
      />

      <span>{children}</span>
    </span>
  );
};

export default Badge;