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
  BarChart2
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { SYSTEM_STATS, AI_APPROVAL_QUEUE, AUDIT_LOGS } from '../data/mockData';
import { getDashboardStats, getAuditLogs } from '../services/api';

export const DashboardPage = ({ setActiveTab, showToast }) => {
  const [stats, setStats] = useState({
    totalMaterials: SYSTEM_STATS.totalMaterialsCataloged,
    harmonizedMaterials: SYSTEM_STATS.totalHarmonizedMasters,
    duplicateClusters: SYSTEM_STATS.duplicateClustersFound,
    estimatedSavingsCr: SYSTEM_STATS.estimatedCostSavingsCr,
    aiAccuracyPercent: SYSTEM_STATS.aiAccuracyPercent,
    pendingApprovals: SYSTEM_STATS.pendingApprovals,
  });

  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  useEffect(() => {
    // Fetch stats from backend API
    getDashboardStats()
      .then((data) => {
        if (data) {
          setStats({
            totalMaterials: data.total_materials.toLocaleString('en-IN'),
            harmonizedMaterials: data.harmonized_materials.toLocaleString('en-IN'),
            duplicateClusters: data.duplicate_clusters.toLocaleString('en-IN'),
            estimatedSavingsCr: data.estimated_savings_cr,
            aiAccuracyPercent: `${data.ai_accuracy_percent}%`,
            pendingApprovals: data.pending_approvals,
          });
        }
      })
      .catch(() => {});

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
  }, []);

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
            Review Pending AI Recommendations ({stats.pendingApprovals})
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Cards (5 Columns) */}
      <div className="grid-5">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Catalog Items</span>
            <div className="stat-icon" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
              <Database size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.totalMaterials}</div>
          <div className="stat-change" style={{ color: '#16A34A' }}>
            <TrendingUp size={13} /> Across 48 Active CPSEs
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Harmonized Masters</span>
            <div className="stat-icon" style={{ backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.harmonizedMaterials}</div>
          <div className="stat-change" style={{ color: '#16A34A' }}>
            74.1% Catalog Coverage
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Duplicate Clusters</span>
            <div className="stat-icon" style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
              <Copy size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.duplicateClusters}</div>
          <div className="stat-change" style={{ color: '#DC2626' }}>
            High Value Inventory Overlap
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Est. Capital Savings</span>
            <div className="stat-icon" style={{ backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <Zap size={18} />
            </div>
          </div>
          <div className="stat-value">₹{stats.estimatedSavingsCr} Cr</div>
          <div className="stat-change" style={{ color: '#D97706' }}>
            Bulk Procurement Power
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-label">AI Matching Accuracy</span>
            <div className="stat-icon" style={{ backgroundColor: '#EEF2FF', color: '#4F46E5' }}>
              <Sparkles size={18} />
            </div>
          </div>
          <div className="stat-value">{stats.aiAccuracyPercent}</div>
          <div className="stat-change" style={{ color: '#4F46E5' }}>
            Validated by Nodal Experts
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
            {SYSTEM_STATS.harmonizationRateByCPSE.map((cpse, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{cpse.name}</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    <strong>{cpse.harmonized.toLocaleString()}</strong> / {cpse.totalItems.toLocaleString()} items ({cpse.rate}%)
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  backgroundColor: '#F1F5F9',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${cpse.rate}%`,
                    height: '100%',
                    backgroundColor: cpse.rate > 90 ? '#2563EB' : '#3B82F6',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
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
              Review Queue ({AI_APPROVAL_QUEUE.length})
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {AI_APPROVAL_QUEUE.map((item) => (
              <div key={item.id} style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge variant="ai">{item.type}</Badge>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>{item.cpseName}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>
                  Raw Text: <span style={{ color: '#475569', fontWeight: 400 }}>"{item.rawText}"</span>
                </div>
                <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 500 }}>
                  AI Proposal: {item.proposedText}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                    Confidence Score: {item.aiConfidence}%
                  </span>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => showToast(`Approved recommendation for ${item.localCode}`, 'success')}
                  >
                    Quick Approve
                  </button>
                </div>
              </div>
            ))}
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
