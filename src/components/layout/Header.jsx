import React, { useState, useEffect } from 'react';
import { Search, Bell, Shield, ChevronDown, Building2, User, Sparkles, SlidersHorizontal } from 'lucide-react';
import { CPSE_LIST } from '../../data/mockData';
import { getCpses } from '../../services/api';

export const Header = ({ selectedCpse, setSelectedCpse, activeRole, setActiveRole, onGlobalSearch }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cpses, setCpses] = useState(CPSE_LIST);

  useEffect(() => {
    getCpses()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const apiCpses = [
            { id: 'all', name: 'All CPSEs & Ministries', code: 'ALL' },
            ...data.map((c) => ({ id: c.id, name: c.name, code: c.id.toUpperCase(), category: c.sector }))
          ];
          setCpses(apiCpses);
        }
      })
      .catch(() => {
        // Fallback to static CPSE_LIST if API offline
      });
  }, []);

  const notifications = [
    { id: 1, title: 'AI Cluster Alert', text: '4 new duplicates detected between ONGC & NTPC', time: '10m ago', unread: true },
    { id: 2, title: 'Mapping Approved', text: 'Turbine Lube Oil mapped to NUMC-151215-0102', time: '1h ago', unread: true },
    { id: 3, title: 'Price Divergence', text: '17.9% unit cost gap flagged for 75kW Motor', time: '3h ago', unread: false },
  ];

  const roles = ['Master Data Admin', 'CPSE Nodal Officer', 'AI Reviewer & Custodian'];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onGlobalSearch) {
      onGlobalSearch(searchTerm);
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
    }}>
      {/* Brand & Emblem Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: '#1E3A8A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '16px',
          letterSpacing: '0.5px'
        }}>
          GOI
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
              National Material Master Platform
            </h1>
            <span style={{
              fontSize: '10px',
              fontWeight: 700,
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid #BFDBFE'
            }}>
              PS-26099
            </span>
          </div>
          <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
            Ministry of Heavy Industries & Public Enterprises • DPE Unified Catalog
          </p>
        </div>
      </div>

      {/* Middle Tools: CPSE Filter & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, maxWidth: '640px', margin: '0 24px' }}>
        {/* CPSE Switcher */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Building2 size={16} style={{ position: 'absolute', left: '10px', color: '#64748B', zIndex: 1 }} />
          <select
            value={selectedCpse}
            onChange={(e) => setSelectedCpse(e.target.value)}
            style={{
              padding: '7px 28px 7px 32px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#F8FAFC',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0F172A',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          >
            {cpses.map((cpse) => (
              <option key={cpse.id} value={cpse.id}>
                {cpse.code === 'ALL' ? '🏢 All CPSEs & Ministries' : `${cpse.code} - ${cpse.name}`}
              </option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '8px', color: '#64748B', pointerEvents: 'none' }} />
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search material code, NUMC, specs or CPSE description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '12px',
              backgroundColor: '#F8FAFC',
              color: '#0F172A',
              outline: 'none'
            }}
          />
        </form>
      </div>

      {/* Right Controls: AI Indicator, Notifications, Role & User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* AI Engine Status Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '20px',
          backgroundColor: '#EEF2FF',
          border: '1px solid #C7D2FE',
          color: '#4338CA',
          fontSize: '11px',
          fontWeight: 600
        }}>
          <Sparkles size={13} className="animate-pulse" />
          <span>AI Harmonizer Active</span>
        </div>

        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: '#F8FAFC',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              color: '#475569'
            }}
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#2563EB'
            }} />
          </button>

          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '320px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontWeight: 600, fontSize: '13px' }}>System Notifications</span>
                <span style={{ fontSize: '11px', color: '#2563EB', cursor: 'pointer' }}>Mark all read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {notifications.map(n => (
                  <div key={n.id} style={{
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: n.unread ? '#EFF6FF' : '#F8FAFC',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 600, color: '#0F172A', display: 'flex', justifyContent: 'space-between' }}>
                      {n.title}
                      <span style={{ fontSize: '10px', color: '#94A3B8', fontWeight: 400 }}>{n.time}</span>
                    </div>
                    <div style={{ color: '#475569', fontSize: '11px', marginTop: '2px' }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Selector & Profile */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 10px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#1E3A8A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 600
            }}>
              AS
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', lineHeight: 1.1 }}>
                Dr. A. K. Sharma
              </div>
              <div style={{ fontSize: '10px', color: '#64748B' }}>
                {activeRole}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: '#94A3B8' }} />
          </button>

          {showRoleMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '200px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              padding: '6px'
            }}>
              <div style={{ padding: '6px 8px', fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                Switch Access Role
              </div>
              {roles.map(r => (
                <div
                  key={r}
                  onClick={() => { setActiveRole(r); setShowRoleMenu(false); }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: activeRole === r ? 600 : 400,
                    backgroundColor: activeRole === r ? '#EFF6FF' : 'transparent',
                    color: activeRole === r ? '#1D4ED8' : '#0F172A',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {r}
                  {activeRole === r && <Shield size={12} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
