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
  ChevronLeft,
  ChevronRight,
  Database,
  Building
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'search', label: 'Material Search & Matching', icon: Search, badge: '2.4M' },
    { id: 'comparison', label: 'Material Comparison', icon: GitCompare, badge: null },
    { id: 'duplicates', label: 'Duplicate Detection', icon: Copy, badge: '42K' },
    { id: 'mapping', label: 'CPSE Material Mapping', icon: GitMerge, badge: '5 Pending' },
    { id: 'approval', label: 'AI Recommendations & Approval', icon: Sparkles, badge: '12 New' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'audit', label: 'Audit / History', icon: History, badge: null },
  ];

  return (
    <aside style={{
      width: isCollapsed ? '72px' : '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: '#94A3B8',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease-in-out',
      borderRight: '1px solid #1E293B',
      flexShrink: 0
    }}>
      {/* Sidebar Header & Toggle */}
      <div style={{
        height: '64px',
        padding: isCollapsed ? '0 16px' : '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        borderBottom: '1px solid #1E293B'
      }}>
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} style={{ color: '#3B82F6' }} />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', letterSpacing: '0.3px' }}>
              NATIONAL MASTER
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: '#1E293B',
            border: 'none',
            borderRadius: '6px',
            color: '#94A3B8',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation List */}
      <div style={{ padding: '16px 10px', flex: 1, overflowY: 'auto' }}>
        {!isCollapsed && (
          <div style={{
            padding: '0 10px 10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748B',
            textTransform: 'uppercase',
            letterSpacing: '0.6px'
          }}>
            Platform Navigation
          </div>
        )}

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: isCollapsed ? '10px 0' : '10px 12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  borderRadius: '8px',
                  backgroundColor: isActive ? 'var(--bg-sidebar-active)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease'
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} style={{ color: isActive ? '#FFFFFF' : '#94A3B8', flexShrink: 0 }} />
                {!isCollapsed && (
                  <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                )}
                {!isCollapsed && item.badge && (
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '10px',
                    backgroundColor: item.badge.includes('New') || item.badge.includes('Pending') ? '#2563EB' : '#1E293B',
                    color: '#FFFFFF'
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Info */}
      {!isCollapsed && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #1E293B',
          fontSize: '11px',
          color: '#64748B',
          backgroundColor: '#090D16'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1', fontWeight: 600, marginBottom: '2px' }}>
            <Building size={13} /> DPE Standard v2.4
          </div>
          <div>NUMC Taxonomies Active</div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
