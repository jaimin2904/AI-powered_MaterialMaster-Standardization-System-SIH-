import React, { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X
} from 'lucide-react';

export const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 4000
}) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const toastStyles = {
    success: {
      icon: CheckCircle2,
      background: '#F4FBF7',
      border: '#CDEBDD',
      iconBackground: '#DDF4E8',
      iconColor: '#078A58',
      accent: '#16A163',
      title: 'Success'
    },

    warning: {
      icon: AlertTriangle,
      background: '#FFFBF1',
      border: '#F1E1B8',
      iconBackground: '#FFF1C9',
      iconColor: '#B77900',
      accent: '#F59E0B',
      title: 'Warning'
    },

    danger: {
      icon: XCircle,
      background: '#FFF7F7',
      border: '#F1D1D1',
      iconBackground: '#FFE4E4',
      iconColor: '#C53D3D',
      accent: '#EF4444',
      title: 'Action required'
    },

    info: {
      icon: Info,
      background: '#F6F9FE',
      border: '#D7E3F5',
      iconBackground: '#E6EFFC',
      iconColor: '#416FA8',
      accent: '#4F83CC',
      title: 'Information'
    }
  };

  const currentStyle =
    toastStyles[type] || toastStyles.info;

  const Icon = currentStyle.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        right: '24px',
        bottom: '24px',

        zIndex: 9999,

        width: 'min(390px, calc(100vw - 32px))',

        display: 'flex',
        alignItems: 'center',
        gap: '11px',

        padding: '11px 12px 11px 10px',

        background: currentStyle.background,

        border: `1px solid ${currentStyle.border}`,

        borderRadius: '15px',

        boxShadow:
          '0 16px 40px rgba(15, 23, 42, 0.12)',

        fontSize: '11px',
        fontWeight: 500,
        color: '#34413A',

        animation: 'materialToastIn 0.25s ease-out'
      }}
    >
      {/* Accent line */}
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: '10px',
          bottom: '10px',

          width: '3px',

          borderRadius: '0 4px 4px 0',

          background: currentStyle.accent
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: '34px',
          height: '34px',

          borderRadius: '10px',

          background: currentStyle.iconBackground,
          color: currentStyle.iconColor,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          flexShrink: 0
        }}
      >
        <Icon size={17} strokeWidth={2.2} />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minWidth: 0
        }}
      >
        <div
          style={{
            color: '#27332D',
            fontSize: '10px',
            fontWeight: 800,
            marginBottom: '3px'
          }}
        >
          {currentStyle.title}
        </div>

        <div
          style={{
            color: '#68736C',
            fontSize: '10px',
            lineHeight: 1.4,
            wordBreak: 'break-word'
          }}
        >
          {message}
        </div>
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        style={{
          width: '27px',
          height: '27px',

          border: 'none',
          borderRadius: '8px',

          background: 'transparent',
          color: '#7D8781',

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          cursor: 'pointer',

          flexShrink: 0,

          transition:
            'background 0.18s ease, color 0.18s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FFFFFF';
          e.currentTarget.style.color = '#34413A';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#7D8781';
        }}
      >
        <X size={15} />
      </button>

      <style>
        {`
          @keyframes materialToastIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;