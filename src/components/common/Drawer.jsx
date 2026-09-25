import React from 'react';
import { X, PanelRight } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  footer
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,

        background: 'rgba(20, 29, 25, 0.38)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          bottom: '12px',

          width: 'min(500px, calc(100vw - 24px))',

          display: 'flex',
          flexDirection: 'column',

          background: '#FFFFFF',

          border: '1px solid #E4E9E6',
          borderRadius: '22px',

          boxShadow:
            '-12px 0 50px rgba(15, 23, 42, 0.14)',

          overflow: 'hidden',

          animation: 'materialDrawerIn 0.22s ease-out'
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div
          style={{
            minHeight: '74px',
            padding: '14px 16px 14px 18px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            borderBottom: '1px solid #EEF1EF',

            background: '#FFFFFF',

            flexShrink: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: 0
            }}
          >
            {/* Drawer icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '11px',

                background: '#E8F7F0',
                color: '#078A58',

                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                flexShrink: 0
              }}
            >
              <PanelRight size={17} strokeWidth={2} />
            </div>

            <div
              style={{
                minWidth: 0
              }}
            >
              <h3
                style={{
                  margin: 0,

                  color: '#18211D',
                  fontSize: '14px',
                  lineHeight: 1.25,
                  fontWeight: 800,
                  letterSpacing: '-0.15px',

                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {title}
              </h3>

              <div
                style={{
                  marginTop: '4px',

                  color: '#8A938E',
                  fontSize: '9px',
                  fontWeight: 500
                }}
              >
                Material Master Platform
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              width: '34px',
              height: '34px',

              border: '1px solid #E7EBE8',
              borderRadius: '10px',

              background: '#F8FAF9',
              color: '#68736C',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',

              cursor: 'pointer',
              flexShrink: 0,

              transition:
                'background 0.18s ease, color 0.18s ease, border-color 0.18s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FFF0F0';
              e.currentTarget.style.color = '#C53D3D';
              e.currentTarget.style.borderColor = '#F3D2D2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F8FAF9';
              e.currentTarget.style.color = '#68736C';
              e.currentTarget.style.borderColor = '#E7EBE8';
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* =====================================================
            CONTENT
        ====================================================== */}
        <div
          style={{
            flex: 1,
            minHeight: 0,

            padding: '18px',

            overflowY: 'auto',

            color: '#34413A',

            scrollbarWidth: 'thin'
          }}
        >
          {children}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}
        {footer && (
          <div
            style={{
              minHeight: '66px',

              padding: '11px 16px',

              borderTop: '1px solid #EEF1EF',

              background: '#FAFBFA',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',

              gap: '9px',

              flexShrink: 0
            }}
          >
            {footer}
          </div>
        )}
      </div>

      {/* Drawer animation */}
      <style>
        {`
          @keyframes materialDrawerIn {
            from {
              opacity: 0;
              transform: translateX(24px);
            }

            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Drawer;