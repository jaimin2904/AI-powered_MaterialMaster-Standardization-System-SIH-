import React, { useState, useEffect } from 'react';

import {
  Search,
  Bell,
  ShieldCheck,
  ChevronDown,
  Building2,
  Sparkles,
  Check,
  CircleAlert,
  X,
  Moon,
  Sun,
} from 'lucide-react';

import { CPSE_LIST } from '../../data/mockData';
import { getCpses } from '../../services/api';

export const Header = ({
  selectedCpse,
  setSelectedCpse,
  activeRole,
  setActiveRole,
  onGlobalSearch,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showCpseMenu, setShowCpseMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cpses, setCpses] = useState(CPSE_LIST);

  useEffect(() => {
    getCpses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiCpses = [
            {
              id: 'all',
              name: 'All CPSEs & Ministries',
              code: 'ALL',
            },
            ...data.map((c) => ({
              id: c.id,
              name: c.name,
              code: c.id.toUpperCase(),
              category: c.sector,
            })),
          ];

          setCpses(apiCpses);
        }
      })
      .catch(() => {
        // Fallback to static CPSE_LIST if API is offline
      });
  }, []);

  const notifications = [
    {
      id: 1,
      title: 'AI Cluster Alert',
      text: '4 new duplicates detected between ONGC & NTPC',
      time: '10m ago',
      unread: true,
      type: 'warning',
    },
    {
      id: 2,
      title: 'Mapping Approved',
      text: 'Turbine Lube Oil mapped to NUMC-151215-0102',
      time: '1h ago',
      unread: true,
      type: 'success',
    },
    {
      id: 3,
      title: 'Price Divergence',
      text: '17.9% unit cost gap flagged for 75kW Motor',
      time: '3h ago',
      unread: false,
      type: 'info',
    },
  ];

  const roles = [
    'Master Data Admin',
    'CPSE Nodal Officer',
    'AI Reviewer & Custodian',
  ];

  const selectedCpseData =
    cpses.find((cpse) => cpse.id === selectedCpse) || cpses[0];

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (onGlobalSearch) {
      onGlobalSearch(searchTerm);
    }
  };

  const handleCpseSelect = (id) => {
    setSelectedCpse(id);
    setShowCpseMenu(false);
  };

  const closeAllMenus = () => {
    setShowNotifications(false);
    setShowRoleMenu(false);
    setShowCpseMenu(false);
  };

  const getNotificationColors = (type) => {
    if (type === 'warning') {
      return {
        background: 'var(--warning-bg)',
        color: 'var(--warning-text)',
      };
    }

    if (type === 'success') {
      return {
        background: 'var(--success-bg)',
        color: 'var(--success-text)',
      };
    }

    return {
      background: 'var(--info-bg)',
      color: 'var(--info-text)',
    };
  };

  return (
    <header
      style={{
        height: '78px',
        margin: '12px 12px 0 0',
        padding: '0 18px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
        transition:
          'background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* =====================================================
          BRAND
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '11px',
          minWidth: '250px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid var(--accent-border)',
          }}
        >
          <Building2 size={21} strokeWidth={2} />
        </div>

        <div
          style={{
            minWidth: 0,
            lineHeight: 1.15,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--text-h)',
                letterSpacing: '-0.25px',
                whiteSpace: 'nowrap',
              }}
            >
              MaterialAI
            </h1>

            <span
              style={{
                padding: '3px 7px',
                borderRadius: '7px',
                background: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)',
                fontSize: '8px',
                fontWeight: 800,
                letterSpacing: '0.3px',
              }}
            >
              PS-26099
            </span>
          </div>

          <div
            style={{
              marginTop: '4px',
              fontSize: '9px',
              color: 'var(--text-light)',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            National Material Master Platform
          </div>
        </div>
      </div>

      {/* =====================================================
          CPSE SELECTOR
      ====================================================== */}

      <div
        style={{
          position: 'relative',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={() => {
            setShowCpseMenu(!showCpseMenu);
            setShowNotifications(false);
            setShowRoleMenu(false);
          }}
          style={{
            height: '42px',
            minWidth: '190px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            borderRadius: '13px',
            border: '1px solid var(--border)',
            background: 'var(--surface-soft)',
            color: 'var(--text)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span
            style={{
              width: '27px',
              height: '27px',
              borderRadius: '8px',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={14} />
          </span>

          <div
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '8px',
                color: 'var(--text-light)',
                fontWeight: 600,
                marginBottom: '2px',
              }}
            >
              CPSE / ENTERPRISE
            </div>

            <div
              style={{
                fontSize: '10px',
                color: 'var(--text-h)',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {selectedCpseData?.code === 'ALL'
                ? 'All CPSEs & Ministries'
                : selectedCpseData?.code || 'Select CPSE'}
            </div>
          </div>

          <ChevronDown
            size={14}
            style={{
              color: 'var(--text-light)',
              transform: showCpseMenu
                ? 'rotate(180deg)'
                : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        {showCpseMenu && (
          <div
            style={{
              position: 'absolute',
              top: '49px',
              left: 0,
              width: '300px',
              padding: '7px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '15px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 300,
            }}
          >
            <div
              style={{
                padding: '8px 10px',
                color: 'var(--text-light)',
                fontSize: '9px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.7px',
              }}
            >
              Select Enterprise
            </div>

            <div
              style={{
                maxHeight: '300px',
                overflowY: 'auto',
              }}
            >
              {cpses.map((cpse) => {
                const isSelected = selectedCpse === cpse.id;

                return (
                  <button
                    type="button"
                    key={cpse.id}
                    onClick={() => handleCpseSelect(cpse.id)}
                    style={{
                      width: '100%',
                      padding: '9px 10px',
                      border: 'none',
                      borderRadius: '10px',
                      background: isSelected
                        ? 'var(--accent-bg)'
                        : 'transparent',
                      color: isSelected
                        ? 'var(--accent)'
                        : 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Building2 size={14} />

                    <span
                      style={{
                        flex: 1,
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                      }}
                    >
                      {cpse.code === 'ALL'
                        ? 'All CPSEs & Ministries'
                        : `${cpse.code} - ${cpse.name}`}
                    </span>

                    {isSelected && <Check size={14} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          GLOBAL SEARCH
      ====================================================== */}

      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: 1,
          minWidth: '180px',
          maxWidth: '470px',
          position: 'relative',
        }}
      >
        <Search
          size={17}
          style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-light)',
            pointerEvents: 'none',
          }}
        />

        <input
          type="text"
          placeholder="Search materials, codes, descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            height: '42px',
            padding: '0 42px',
            borderRadius: '13px',
            border: '1px solid var(--border)',
            background: 'var(--surface-soft)',
            color: 'var(--text-h)',
            fontSize: '11px',
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
        />

        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '22px',
              height: '22px',
              border: 'none',
              borderRadius: '50%',
              background: 'var(--surface-muted)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={12} />
          </button>
        )}
      </form>

      {/* =====================================================
          RIGHT CONTROLS
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          flexShrink: 0,
        }}
      >
        {/* AI STATUS */}

        <div
          style={{
            height: '38px',
            padding: '0 11px',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            borderRadius: '12px',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent)',
            fontSize: '10px',
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          <span
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '7px',
              background: 'var(--surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={12} />
          </span>

          <span>AI Harmonizer Active</span>

          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 0 3px var(--accent-border)',
            }}
          />
        </div>

        {/* =================================================
            DARK MODE
        ================================================== */}

        <button
          type="button"
          onClick={() => {
            setIsDarkMode((prev) => !prev);
            closeAllMenus();
          }}
          title={
            isDarkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          aria-label={
            isDarkMode
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: isDarkMode
              ? '#fbbf24'
              : 'var(--text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          {isDarkMode ? (
            <Sun size={17} />
          ) : (
            <Moon size={17} />
          )}
        </button>

        {/* =================================================
            NOTIFICATIONS
        ================================================== */}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
              setShowCpseMenu(false);
            }}
            aria-label="Notifications"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            <Bell size={17} />

            <span
              style={{
                position: 'absolute',
                top: '7px',
                right: '7px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'var(--accent)',
                border: '2px solid var(--surface)',
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '49px',
                width: '350px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '17px',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden',
                zIndex: 300,
              }}
            >
              <div
                style={{
                  padding: '15px 16px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: 'var(--text-h)',
                    }}
                  >
                    Notifications
                  </div>

                  <div
                    style={{
                      marginTop: '3px',
                      fontSize: '9px',
                      color: 'var(--text-light)',
                    }}
                  >
                    Recent system activity
                  </div>
                </div>

                <button
                  type="button"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--accent)',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Mark all read
                </button>
              </div>

              <div
                style={{
                  padding: '9px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                {notifications.map((notification) => {
                  const icon =
                    notification.type === 'warning' ? (
                      <CircleAlert size={14} />
                    ) : notification.type === 'success' ? (
                      <Check size={14} />
                    ) : (
                      <Sparkles size={14} />
                    );

                  const colors = getNotificationColors(
                    notification.type
                  );

                  return (
                    <div
                      key={notification.id}
                      style={{
                        padding: '11px',
                        borderRadius: '12px',
                        background: notification.unread
                          ? 'var(--accent-bg)'
                          : 'var(--surface-soft)',
                        border: '1px solid',
                        borderColor: notification.unread
                          ? 'var(--accent-border)'
                          : 'var(--border)',
                        display: 'flex',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '9px',
                          background: colors.background,
                          color: colors.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              color: 'var(--text-h)',
                              fontSize: '10px',
                              fontWeight: 750,
                            }}
                          >
                            {notification.title}
                          </span>

                          <span
                            style={{
                              color: 'var(--text-light)',
                              fontSize: '8px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {notification.time}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: '4px',
                            color: 'var(--text)',
                            fontSize: '9px',
                            lineHeight: 1.45,
                          }}
                        >
                          {notification.text}
                        </div>
                      </div>

                      {notification.unread && (
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            marginTop: '5px',
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            USER / ROLE
        ================================================== */}

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
              setShowCpseMenu(false);
            }}
            style={{
              height: '42px',
              padding: '4px 8px 4px 5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--surface)',
              color: 'var(--text-h)',
              border: '1px solid var(--border)',
              borderRadius: '13px',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background:
                  'linear-gradient(135deg, var(--primary-dark), var(--primary))',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 800,
              }}
            >
              AS
            </div>

            <div
              style={{
                textAlign: 'left',
                maxWidth: '130px',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 750,
                  color: 'var(--text-h)',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                Dr. A. K. Sharma
              </div>

              <div
                style={{
                  marginTop: '3px',
                  fontSize: '8px',
                  color: 'var(--text-light)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {activeRole}
              </div>
            </div>

            <ChevronDown
              size={13}
              style={{
                color: 'var(--text-light)',
                transform: showRoleMenu
                  ? 'rotate(180deg)'
                  : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {showRoleMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '51px',
                width: '245px',
                padding: '8px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 300,
              }}
            >
              <div
                style={{
                  padding: '8px 9px 9px',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '5px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-h)',
                    fontWeight: 800,
                  }}
                >
                  Account & Access
                </div>

                <div
                  style={{
                    fontSize: '8px',
                    color: 'var(--text-light)',
                    marginTop: '3px',
                  }}
                >
                  Select your platform role
                </div>
              </div>

              {roles.map((role) => {
                const isActive = activeRole === role;

                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => {
                      setActiveRole(role);
                      setShowRoleMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '9px',
                      border: 'none',
                      borderRadius: '10px',
                      background: isActive
                        ? 'var(--accent-bg)'
                        : 'transparent',
                      color: isActive
                        ? 'var(--accent)'
                        : 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '9px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        width: '27px',
                        height: '27px',
                        borderRadius: '8px',
                        background: isActive
                          ? 'var(--surface)'
                          : 'var(--surface-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ShieldCheck size={14} />
                    </span>

                    <span
                      style={{
                        flex: 1,
                        fontSize: '10px',
                        fontWeight: isActive ? 750 : 550,
                      }}
                    >
                      {role}
                    </span>

                    {isActive && <Check size={14} />}
                  </button>
                );
              })}

              <div
                style={{
                  marginTop: '5px',
                  padding: '9px',
                  borderRadius: '10px',
                  background: 'var(--surface-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    width: '25px',
                    height: '25px',
                    borderRadius: '8px',
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: 800,
                  }}
                >
                  AS
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: 'var(--text)',
                      fontWeight: 700,
                    }}
                  >
                    Dr. A. K. Sharma
                  </div>

                  <div
                    style={{
                      fontSize: '8px',
                      color: 'var(--text-light)',
                      marginTop: '2px',
                    }}
                  >
                    System Administrator
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;