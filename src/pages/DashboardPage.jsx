import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  TrendingUp,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  BarChart2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { AUDIT_LOGS } from '../data/mockData';
import { getDashboardStats, getAuditLogs } from '../services/api';

export const DashboardPage = ({ setActiveTab, showToast }) => {
  const [stats, setStats] = useState({
    total_materials: 0,
    standard_materials: 0,
    total_cpses: 0,
    confirmed_matches: 0,
    under_review: 0,
    rejected_matches: 0,
    potential_duplicates: 0,
    ai_accuracy_percent: null,
    estimated_savings_cr: null,
    cpses: [],
    pending_recommendations: [],
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  useEffect(() => {
    // Fetch stats from backend API
    setIsStatsLoading(true);
    setStatsError(null);
    getDashboardStats()
      .then((data) => {
        if (data) {
          setStats({
            total_materials: data.total_materials || 0,
            standard_materials: data.standard_materials || 0,
            total_cpses: data.total_cpses || 0,
            confirmed_matches: data.confirmed_matches || 0,
            under_review: data.under_review || 0,
            rejected_matches: data.rejected_matches || 0,
            potential_duplicates: data.potential_duplicates || 0,
            ai_accuracy_percent: data.ai_accuracy_percent ?? null,
            estimated_savings_cr: data.estimated_savings_cr ?? null,
            cpses: data.cpses || [],
            pending_recommendations: data.pending_recommendations || [],
          });
        }
      })
      .catch((err) => {
        setStatsError(err.message || 'Failed to load dashboard statistics');
      })
      .finally(() => setIsStatsLoading(false));

    // Fetch audit logs from backend API
    getAuditLogs()
      .then((logs) => {
        if (Array.isArray(logs) && logs.length > 0) {
          setAuditLogs(
            logs.map((l) => ({
              id: `AUD-${l.id}`,
              timestamp: new Date(l.timestamp).toLocaleString(),
              eventType: l.action,
              cpse: 'NTPC & CPSEs',
              actor: l.user,
              description: l.new_value ? (l.new_value.length > 80 ? l.new_value.substring(0, 80) + '...' : l.new_value) : l.action,
              status: 'Verified'
            }))
          );
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  const confirmedRate = stats.total_materials > 0
    ? ((stats.confirmed_matches / stats.total_materials) * 100).toFixed(1)
    : '0.0';
  const activeCpses = stats.cpses.filter((c) => c.material_count > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner / Welcome Bar */}
      <div className="card" style={{
        backgroundColor: '#FFFFFF',
        borderLeft: '4px solid var(--primary-blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>
              National Material Harmonization & Master Data Hub
            </h2>
            <Badge variant="ai"><Sparkles size={12} /> Live API Sync</Badge>
            {isStatsLoading && (
              <div className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            Cross-CPSE Material Master Catalogues Standardized under NUMC Architecture (FastAPI & PostgreSQL Backend Connected).
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('search')}
            className="btn btn-secondary"
          >
            Explore Catalog
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            className="btn btn-primary"
          >
            Review Pending AI Recommendations ({stats.under_review})
          </button>
        </div>
      </div>

      {/* Dashboard Error State */}
      {statsError && (
        <div className="card empty-state" style={{ padding: '16px' }}>
          <AlertCircle size={20} className="empty-state-icon" />
          <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600 }}>
            Dashboard statistics unavailable
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            {statsError}. Ensure the backend AI service is running at http://localhost:8000.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '10px' }}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Top KPI Metrics Cards */}
      <div className="grid-5">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Materials</span>
            <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Database size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.total_materials.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#16A34A' }}>
            <TrendingUp size={13} /> Active in {activeCpses} CPSEs
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Standard Materials</span>
            <div className="stat-icon" style={{ backgroundColor: '#F8FAFC', color: '#475569' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.standard_materials.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#475569' }}>
            National master catalog items
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Potential Duplicates</span>
            <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <Copy size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.potential_duplicates.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#DC2626' }}>
            From latest AI detection scan
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Confirmed Matches</span>
            <div className="stat-icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.confirmed_matches.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#16A34A' }}>
            {confirmedRate}% of catalog confirmed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Under Review</span>
            <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.under_review.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#D97706' }}>
            Awaiting custodian review
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Rejected Matches</span>
            <div className="stat-icon" style={{ backgroundColor: '#FFF7F7', color: '#DC2626' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.rejected_matches.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#DC2626' }}>
            Review decisions recorded
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total CPSEs</span>
            <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <Building2 size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.total_cpses.toLocaleString('en-IN')}</div>
          <div className="stat-change" style={{ color: '#4F46E5' }}>
            Registered CPSE enterprises
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">AI Matching Accuracy</span>
            <div className="stat-icon" style={{ backgroundColor: '#F8FAFC', color: '#64748B' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="stat-value">
            {stats.ai_accuracy_percent == null ? 'N/A' : `${stats.ai_accuracy_percent}%`}
          </div>
          <div className="stat-change" style={{ color: '#64748B' }}>
            No ground-truth dataset
          </div>
        </div>
      </div>

      {/* Main Grid: CPSE Harmonization Progress & AI Recommendations */}
      <div className="grid-2">
        {/* CPSE Harmonization Status */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><Building2 size={18} className="text-blue-600" /> CPSE Material Master Harmonization Rate</div>
              <div className="card-subtitle">Harmonization progress across major public sector undertakings</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('analytics')}>
              Full Analytics <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.cpses.length === 0 ? (
              <div className="card empty-state" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  No CPSE material data available yet.
                </div>
              </div>
            ) : (
              stats.cpses.map((cpse, idx) => {
                const rate = cpse.material_count > 0
                  ? Math.round((cpse.confirmed_matches / cpse.material_count) * 100)
                  : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: '#0F172A' }}>{cpse.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        <strong>{cpse.confirmed_matches.toLocaleString()}</strong> / {cpse.material_count.toLocaleString()} items ({rate}%)
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      backgroundColor: '#F1F5F9',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, rate)}%`,
                        height: '100%',
                        backgroundColor: rate > 90 ? '#2563EB' : '#3B82F6',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending AI Recommendation Highlights */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><Sparkles size={18} style={{ color: '#4F46E5' }} /> AI Recommendation Engine Queue</div>
              <div className="card-subtitle">Automated standardization suggestions awaiting custodian approval</div>
            </div>
            <button className="btn btn-ai btn-sm" onClick={() => setActiveTab('approval')}>
              Review Queue ({stats.pending_recommendations.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.pending_recommendations.length === 0 ? (
              <div className="card empty-state" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  No recommendations awaiting review.
                </div>
              </div>
            ) : (
              stats.pending_recommendations.map((item) => (
                <div key={item.mapping_id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Badge variant={item.status === 'Under Review' ? 'warning' : 'neutral'}>{item.status}</Badge>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                      {item.cpse_name} · {item.material_code}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                    Raw Text: <span style={{ color: '#475569', fontWeight: 400 }}>"{item.raw_description}"</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 500 }}>
                    AI Proposal: {item.standard_description || 'No standard candidate yet'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                      Confidence Score: {item.similarity_score?.toFixed(1) || '0.0'}%
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => showToast(`Approved recommendation for ${item.material_code}`, 'success')}
                    >
                      Quick Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Modules & Audit History Activity */}
      <div className="grid-3">
        {/* Quick Workflow Action Shortcuts */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><Layers size={16} /> Harmonization Workflows</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('duplicates')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>Duplicate Clusters Resolution</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Resolve inventory overlap across CPSEs</div>
              </div>
              <ArrowRight size={14} style={{ color: '#2563EB' }} />
            </button>

            <button
              onClick={() => setActiveTab('mapping')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>CPSE Material Code Mapping</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Map legacy item codes to NUMC / UNSPSC</div>
              </div>
              <ArrowRight size={14} style={{ color: '#2563EB' }} />
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>Material Spec Comparison</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Side-by-side technical attribute comparison</div>
              </div>
              <ArrowRight size={14} style={{ color: '#2563EB' }} />
            </button>
          </div>
        </div>

        {/* Live System Activity Feed */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <div>
              <div className="card-title"><Clock size={16} /> Recent Audit Activity Log</div>
              <div className="card-subtitle">Real-time record of catalog updates, approvals and mergers</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('audit')}>
              View Full Audit Log
            </button>
          </div>

          <div className="table-container">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>CPSE Involved</th>
                  <th>Actor / Agent</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                    <td>
                      <Badge variant={log.eventType.includes('MERGE') ? 'info' : log.eventType.includes('APPROVE') ? 'success' : 'warning'}>
                        {log.eventType}
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '12px' }}>{log.cpse}</td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>{log.actor}</td>
                    <td style={{ fontSize: '12px' }}>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
