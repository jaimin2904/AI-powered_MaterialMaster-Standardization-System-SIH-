import React from 'react';
import {
  LayoutDashboard,
  Search,
  GitCompare,
  Copy,
  GitMerge,
  Sparkles,
  BarChart3,
  History,
  Database,
  Building,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'search',
      label: 'Material Search & Matching',
      icon: Search,
      badge: '2.4M',
      badgeType: 'count'
    },
    {
      id: 'comparison',
      label: 'Material Comparison',
      icon: GitCompare,
      badge: null
    },
    {
      id: 'duplicates',
      label: 'Duplicate Detection',
      icon: Copy,
      badge: '42K',
      badgeType: 'count'
    },
    {
      id: 'mapping',
      label: 'CPSE Material Mapping',
      icon: GitMerge,
      badge: '5 Pending',
      badgeType: 'pending'
    },
    {
      id: 'approval',
      label: 'AI Recommendations & Approval',
      icon: Sparkles,
      badge: '12 New',
      badgeType: 'new'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'audit',
      label: 'Audit / History',
      icon: History,
      badge: null
    }
  ];

  const handleNavigation = (id) => {
    setActiveTab(id);
  };

  const getBadgeStyle = (type) => {
    if (type === 'new') {
      return {
        background: 'var(--accent-bg)',
        color: 'var(--accent)',
        border: '1px solid var(--accent-border)'
      };
    }

    if (type === 'pending') {
      return {
        background: 'var(--warning-bg)',
        color: 'var(--warning-text)',
        border: '1px solid var(--warning-border)'
      };
    }

    return {
      background: 'var(--surface-muted)',
      color: 'var(--text)',
      border: '1px solid var(--border)'
    };
  };

  return (
    <aside
      style={{
        position: 'relative',
        width: isCollapsed ? '76px' : '268px',
        height: 'calc(100vh - 24px)',
        margin: '12px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '22px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        transition:
          'width 0.25s ease, background-color 0.25s ease, border-color 0.25s ease',
        color: 'var(--text-h)'
      }}
    >
      {/* =====================================================
          BRAND HEADER
      ====================================================== */}

      <div
        style={{
          height: '78px',
          padding: isCollapsed ? '0 14px' : '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              minWidth: 0
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--accent-border)'
              }}
            >
              <Database size={21} strokeWidth={2.2} />
            </div>

            <div
              style={{
                minWidth: 0,
                lineHeight: 1.1
              }}
            >
              <div
                style={{
                  color: 'var(--text-h)',
                  fontSize: '15px',
                  fontWeight: 800,
                  letterSpacing: '-0.3px'
                }}
              >
                MaterialAI
              </div>

              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '10px',
                  fontWeight: 500,
                  marginTop: '4px'
                }}
              >
                Master Standardization
              </div>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '13px',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--accent-border)'
            }}
          >
            <Database size={21} strokeWidth={2.2} />
          </div>
        )}

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse sidebar"
            style={{
              width: '30px',
              height: '30px',
              border: '1px solid var(--border)',
              background: 'var(--surface-soft)',
              borderRadius: '9px',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-bg)';
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.borderColor = 'var(--accent-border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface-soft)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <PanelLeftClose size={15} />
          </button>
        )}

        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            title="Expand sidebar"
            style={{
              position: 'absolute',
              left: '63px',
              top: '36px',
              width: '26px',
              height: '26px',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: '8px',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              zIndex: 5
            }}
          >
            <PanelLeftOpen size={14} />
          </button>
        )}
      </div>

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div
        style={{
          flex: 1,
          padding: isCollapsed ? '18px 10px' : '20px 12px',
          overflowY: 'auto',
          scrollbarWidth: 'thin'
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              padding: '0 10px 10px',
              color: 'var(--text-light)',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}
          >
            Platform
          </div>
        )}

        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  position: 'relative',
                  width: '100%',
                  minHeight: '46px',
                  padding: isCollapsed
                    ? '9px 0'
                    : '8px 10px 8px 9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed
                    ? 'center'
                    : 'flex-start',
                  gap: '10px',
                  border: 'none',
                  borderRadius: '13px',
                  background: isActive
                    ? 'var(--accent-bg)'
                    : 'transparent',
                  color: isActive
                    ? 'var(--accent)'
                    : 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: isActive ? 700 : 550,
                  textAlign: 'left',
                  transition:
                    'background 0.18s ease, color 0.18s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      'var(--surface-soft)';
                    e.currentTarget.style.color =
                      'var(--text-h)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background =
                      'transparent';
                    e.currentTarget.style.color =
                      'var(--text)';
                  }
                }}
              >
                {/* Active indicator */}
                {isActive && !isCollapsed && (
                  <span
                    style={{
                      position: 'absolute',
                      left: '0px',
                      top: '10px',
                      bottom: '10px',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--accent)'
                    }}
                  />
                )}

                {/* Icon */}
                <span
                  style={{
                    width: '31px',
                    height: '31px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    background: isActive
                      ? 'var(--surface)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--accent)'
                      : 'var(--text-light)',
                    boxShadow: isActive
                      ? 'var(--shadow-sm)'
                      : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                </span>

                {/* Label */}
                {!isCollapsed && (
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Badge */}
                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      flexShrink: 0,
                      padding: '4px 7px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      lineHeight: 1,
                      fontWeight: 750,
                      letterSpacing: '-0.1px',
                      ...getBadgeStyle(item.badgeType)
                    }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed notification dot */}
                {isCollapsed && item.badge && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '7px',
                      right: '12px',
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background:
                        item.badgeType === 'pending'
                          ? 'var(--warning)'
                          : item.badgeType === 'new'
                            ? 'var(--accent)'
                            : 'var(--text-light)',
                      border: '2px solid var(--surface)'
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* =====================================================
          AI STATUS
      ====================================================== */}

      {!isCollapsed && (
        <div style={{ padding: '0 12px 12px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '15px',
              background: 'var(--accent-bg)',
              border: '1px solid var(--accent-border)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                marginBottom: '8px'
              }}
            >
              <div
                style={{
                  width: '29px',
                  height: '29px',
                  borderRadius: '9px',
                  background: 'var(--surface)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--accent-border)'
                }}
              >
                <Sparkles size={15} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    color: 'var(--text-h)',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  AI Harmonizer
                </div>

                <div
                  style={{
                    color: 'var(--text-light)',
                    fontSize: '9px',
                    marginTop: '2px'
                  }}
                >
                  System is active
                </div>
              </div>

              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  boxShadow: '0 0 0 3px var(--success-bg)'
                }}
              />
            </div>

            <div
              style={{
                height: '4px',
                borderRadius: '99px',
                background: 'var(--surface)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: '86%',
                  height: '100%',
                  borderRadius: '99px',
                  background: 'var(--accent)'
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '6px',
                color: 'var(--text-light)',
                fontSize: '9px'
              }}
            >
              <span>Harmonization engine</span>

              <strong style={{ color: 'var(--accent)' }}>
                Active
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div
        style={{
          padding: '12px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0
        }}
      >
        {isCollapsed ? (
          <div
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '11px',
              background: 'var(--surface-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)'
            }}
            title="DPE Standard v2.4"
          >
            <Building size={17} />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              padding: '10px',
              borderRadius: '12px',
              background: 'var(--surface-soft)',
              border: '1px solid var(--border)'
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '9px',
                background: 'var(--surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                flexShrink: 0
              }}
            >
              <Building size={15} />
            </div>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: 'var(--text-h)',
                  fontSize: '10px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                DPE Standard v2.4
              </div>

              <div
                style={{
                  color: 'var(--text-light)',
                  fontSize: '9px',
                  marginTop: '3px',
                  whiteSpace: 'nowrap'
                }}
              >
                NUMC Taxonomies Active
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;