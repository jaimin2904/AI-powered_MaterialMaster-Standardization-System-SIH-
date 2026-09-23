import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2, Database, CheckCircle2, AlertTriangle, Clock,
  XCircle, Shield, TrendingUp, BarChart3
} from 'lucide-react';
import Badge from '../components/common/Badge';
import { getAnalyticsSummary } from '../services/api';

const CATEGORY_COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#16A34A', '#D97706', '#8B5CF6'];

function formatNumber(n) {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Number(n).toLocaleString('en-IN');
}

const EmptyState = ({ message }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '24px 0' }}>
    <BarChart3 size={28} color="#CBD5E1" />
    <div style={{ fontSize: '12px', color: '#64748B' }}>{message}</div>
  </div>
);

export const AnalyticsPage = ({ showToast }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (err) {
      setError('Failed to load analytics data. Please ensure the backend API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, refreshKey]);

  const maxCat = summary ? Math.max(1, ...summary.materials_by_category.map((c) => c.count)) : 1;
  const maxCpse = summary ? Math.max(1, ...summary.materials_by_cpse.map((c) => c.count)) : 1;
  const maxSim = summary ? Math.max(1, ...Object.values(summary.similarity_summary.distribution)) : 1;
  const cats = ['<25', '25-49', '50-74', '>=75'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>National Material Harmonization Analytics</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Real-time catalog harmonization, matching, and approval insights across CPSEs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {loading ? (
            <Badge variant="warning">Loading...</Badge>
          ) : error ? (
            <Badge variant="danger">Live Sync Error</Badge>
          ) : (
            <Badge variant="success">Live API Sync</Badge>
          )}
        </div>
      </div>

      {loading && (
        <div className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      )}

      {!loading && error && (
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#B91C1C' }}>{error}</div>
            <button className="btn btn-primary btn-sm" onClick={() => setRefreshKey((k) => k + 1)}>
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && summary && (
        <>
          {/* Top Stat Cards */}
          <div className="grid-4">
            <div className="stat-card" style={{ borderTop: '3px solid #2563EB' }}>
              <div className="stat-label"><Building2 size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Total Materials</div>
              <div className="stat-value">{formatNumber(summary.total_materials)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Records in CPSE catalogs</div>
            </div>

            <div className="stat-card" style={{ borderTop: '3px solid #16A34A' }}>
              <div className="stat-label"><Database size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Standard Materials</div>
              <div className="stat-value">{formatNumber(summary.standard_materials)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>National catalog entries</div>
            </div>

            <div className="stat-card" style={{ borderTop: '3px solid #4F46E5' }}>
              <div className="stat-label"><CheckCircle2 size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Confirmed Matches</div>
              <div className="stat-value">{formatNumber(summary.confirmed_matches)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Approved mappings</div>
            </div>

            <div className="stat-card" style={{ borderTop: '3px solid #D97706' }}>
              <div className="stat-label"><AlertTriangle size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Potential Duplicates</div>
              <div className="stat-value">{formatNumber(summary.potential_duplicates)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>From latest detection scan</div>
            </div>
          </div>

          <div className="grid-4">
            <div className="stat-card" style={{ borderTop: '3px solid #DC2626' }}>
              <div className="stat-label"><Clock size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Under Review</div>
              <div className="stat-value">{formatNumber(summary.under_review)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Mappings awaiting review</div>
            </div>

            <div className="stat-card" style={{ borderTop: '3px solid #B91C1C' }}>
              <div className="stat-label"><XCircle size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Rejected Matches</div>
              <div className="stat-value">{formatNumber(summary.rejected_matches)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Rejected approval decisions</div>
            </div>

            <div className="stat-card" style={{ borderTop: '3px solid #059669' }}>
              <div className="stat-label"><Shield size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Total CPSEs</div>
              <div className="stat-value">{formatNumber(summary.total_cpses)}</div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Participating enterprises</div>
            </div>

            <div className="stat-card" style={{ borderTop: '3px solid #7C3AED' }}>
              <div className="stat-label"><TrendingUp size={14} style={{ marginRight: '4px', verticalAlign: '-2px' }} /> Avg Match Similarity</div>
              <div className="stat-value">
                {summary.similarity_summary.avg_score !== null && summary.similarity_summary.avg_score !== undefined
                  ? `${summary.similarity_summary.avg_score}%` : 'N/A'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                {summary.similarity_summary.scored} scored mapping{summary.similarity_summary.scored === 1 ? '' : 's'}
              </div>
            </div>
          </div>

          {/* Grid: Category Distribution & CPSE Distribution */}
          <div className="grid-2">
            {/* Materials by Category */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><BarChart3 size={18} /> Materials by Category</div>
                <div className="card-subtitle">Distribution of catalog items across material categories</div>
              </div>

              {summary.materials_by_category.length === 0 ? (
                <EmptyState message="No material records available for category breakdown." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {summary.materials_by_category.map((cat, idx) => (
                    <div key={cat.category || `cat-${idx}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{cat.category || 'Uncategorized'}</span>
                        <span style={{ color: '#64748B' }}>{formatNumber(cat.count)} items</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${(cat.count / maxCat) * 100}%`,
                            height: '100%',
                            backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CPSE Material Distribution */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><Building2 size={18} /> CPSE Material Distribution</div>
                <div className="card-subtitle">Catalog item counts per public sector enterprise</div>
              </div>

              {summary.materials_by_cpse.length === 0 ? (
                <EmptyState message="No CPSE material records available." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {summary.materials_by_cpse.map((cpse, idx) => (
                    <div key={cpse.cpse_id || `cpse-${idx}`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#0F172A' }}>{cpse.cpse_name}</span>
                        <span style={{ color: '#64748B' }}>{formatNumber(cpse.count)} items</span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${(cpse.count / maxCpse) * 100}%`,
                            height: '100%',
                            backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grid: Approval Activity & Similarity Breakdown */}
          <div className="grid-2">
            {/* Approval Activity */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title"><CheckCircle2 size={18} className="text-green-600" /> Approval Activity</div>
                  <div className="card-subtitle">Human review decisions on AI mapping recommendations</div>
                </div>
                <Badge variant={summary.approval_summary.total > 0 ? 'success' : 'neutral'}>
                  {summary.approval_summary.total} decision{summary.approval_summary.total === 1 ? '' : 's'}
                </Badge>
              </div>

              {summary.approval_summary.total === 0 ? (
                <EmptyState message="No approval decisions recorded yet." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803D' }}>{formatNumber(summary.approval_summary.approved)}</div>
                      <div style={{ fontSize: '11px', color: '#16A34A' }}>Approved</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#B91C1C' }}>{formatNumber(summary.approval_summary.rejected)}</div>
                      <div style={{ fontSize: '11px', color: '#DC2626' }}>Rejected</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#B45309' }}>{formatNumber(summary.approval_summary.modified)}</div>
                      <div style={{ fontSize: '11px', color: '#D97706' }}>Modified</div>
                    </div>
                  </div>

                  {summary.approval_summary.by_reviewer.length > 0 && (
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Reviews by Officer
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {summary.approval_summary.by_reviewer.map((rv, idx) => (
                          <div key={rv.reviewed_by || `rv-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: '#0F172A', fontWeight: 500 }}>{rv.reviewed_by}</span>
                            <span style={{ color: '#64748B' }}>{rv.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Recent Decisions
                    </div>
                    <div className="table-container">
                      <table className="enterprise-table">
                        <thead>
                          <tr>
                            <th>Decision</th>
                            <th>Reviewer</th>
                            <th>Comment</th>
                            <th>Timestamp</th>
                          </tr>
                        </thead>
                        <tbody>
                          {summary.approval_summary.recent.map((a) => (
                            <tr key={a.id}>
                              <td>
                                <Badge variant={a.decision === 'Approved' ? 'success' : a.decision === 'Rejected' ? 'danger' : 'warning'}>
                                  {a.decision}
                                </Badge>
                              </td>
                              <td style={{ fontWeight: 500, color: '#0F172A', fontSize: '12px' }}>{a.reviewed_by}</td>
                              <td style={{ color: '#475569', fontSize: '12px' }}>{a.comment || '—'}</td>
                              <td style={{ color: '#64748B', fontSize: '12px' }}>{new Date(a.timestamp).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* AI Match Similarity */}
            <div className="card">
              <div className="card-header">
                <div className="card-title"><TrendingUp size={18} className="text-blue-600" /> AI Match Similarity Distribution</div>
                <div className="card-subtitle">Similarity scores of recorded material mappings</div>
              </div>

              {summary.similarity_summary.scored === 0 ? (
                <EmptyState message="No scored mappings recorded yet. Apply matching to generate similarity scores." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
                        {summary.similarity_summary.min_score !== null ? `${summary.similarity_summary.min_score}%` : 'N/A'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>Min Score</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#1D4ED8' }}>
                        {summary.similarity_summary.avg_score !== null ? `${summary.similarity_summary.avg_score}%` : 'N/A'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#2563EB' }}>Avg Score</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803D' }}>
                        {summary.similarity_summary.max_score !== null ? `${summary.similarity_summary.max_score}%` : 'N/A'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#16A34A' }}>Max Score</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Score Buckets ({summary.similarity_summary.scored} scored of {summary.similarity_summary.total} total)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {cats.map((key) => {
                        const count = summary.similarity_summary.distribution[key] || 0;
                        return (
                          <div key={key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                              <span style={{ fontWeight: 600, color: '#0F172A' }}>{key}%</span>
                              <span style={{ color: '#64748B' }}>{formatNumber(count)} mapping{count === 1 ? '' : 's'}</span>
                            </div>
                            <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${(count / maxSim) * 100}%`,
                                  height: '100%',
                                  backgroundColor: key === '>=75' ? '#16A34A' : key === '50-74' ? '#2563EB' : key === '25-49' ? '#D97706' : '#DC2626',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;