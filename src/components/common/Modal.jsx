import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '650px'
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        padding: '24px',

        background: 'rgba(20, 29, 25, 0.42)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)'
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,

          maxHeight: 'calc(100vh - 48px)',

          display: 'flex',
          flexDirection: 'column',

          background: '#FFFFFF',

          border: '1px solid #E4E9E6',
          borderRadius: '20px',

          boxShadow:
            '0 24px 70px rgba(15, 23, 42, 0.18)',

          overflow: 'hidden',

          animation: 'materialModalIn 0.2s ease-out'
        }}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div
          style={{
            minHeight: '72px',
            padding: '15px 18px 15px 20px',

            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',

            borderBottom: '1px solid #EEF1EF',

            flexShrink: 0
          }}
        >
          <div
            style={{
              minWidth: 0,
              paddingRight: '20px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px'
              }}
            >
              {/* Green title indicator */}
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#078A58',
                  boxShadow:
                    '0 0 0 4px rgba(8, 138, 88, 0.10)',
                  flexShrink: 0
                }}
              />

              <h3
                id="modal-title"
                style={{
                  margin: 0,

                  color: '#18211D',
                  fontSize: '15px',
                  lineHeight: 1.3,
                  fontWeight: 800,
                  letterSpacing: '-0.2px'
                }}
              >
                {title}
              </h3>
            </div>

            {subtitle && (
              <p
                style={{
                  margin: '6px 0 0 16px',

                  color: '#7A847E',
                  fontSize: '10px',
                  lineHeight: 1.45,
                  fontWeight: 500
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
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
            BODY
        ====================================================== */}
        <div
          style={{
            padding: '20px',

            overflowY: 'auto',
            flex: 1,

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
              minHeight: '64px',

              padding: '11px 18px',

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

      {/* Modal animation */}
      <style>
        {`
          @keyframes materialModalIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.985);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Modal;