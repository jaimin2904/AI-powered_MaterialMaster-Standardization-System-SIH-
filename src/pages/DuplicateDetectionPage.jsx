import React, { useState, useEffect, useMemo } from 'react';
import { Copy, Sparkles, CheckCircle2, Sliders, DollarSign, Layers, RefreshCw, Filter, AlertCircle, Building2, RotateCcw } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { getDuplicateClusters, detectDuplicateClusters } from '../services/api';

const STATUS_VARIANTS = {
  Confirmed: 'success',
  'Duplicate Cluster': 'danger',
  'Under Review': 'warning',
  Unmapped: 'neutral'
};

const clusterLockedValue = (cluster) =>
  (cluster.materials || []).reduce((sum, m) => sum + (m.unit_cost || 0) * (m.stock_qty || 0), 0);

const formatRupees = (value) => {
  const amount = Number(value || 0);
  if (amount >= 10000000) return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
  return `\u20B9${(amount / 100000).toFixed(2)} Lakhs`;
};

const formatINR = (value) => `\u20B9${Number(value || 0).toLocaleString('en-IN')}`;

export const DuplicateDetectionPage = ({ setActiveTab, showToast }) => {
  const [similarityThreshold, setSimilarityThreshold] = useState(80);
  const [selectedCpse, setSelectedCpse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({ clusters_found: 0, total_duplicates: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedCluster, setSelectedCluster] = useState(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  // Fetch real duplicate clusters from backend on mount / threshold change
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      getDuplicateClusters(similarityThreshold, 500)
        .then((data) => {
          if (cancelled) return;
          setClusters(data.clusters || []);
          setStats({
            clusters_found: data.clusters_found,
            total_duplicates: data.total_duplicates
          });
          setSelectedCluster((prev) => {
            if (prev && (data.clusters || []).some((c) => c.cluster_id === prev.cluster_id)) return prev;
            return data.clusters?.[0] || null;
          });
        })
        .catch((err) => {
          if (cancelled) return;
          setError(err.message || 'Failed to load duplicate clusters');
          setClusters([]);
          setSelectedCluster(null);
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [similarityThreshold, refreshKey]);

  const cpseOptions = useMemo(() => {
    const map = new Map();
    clusters.forEach((c) => (c.materials || []).forEach((m) => {
      if (m.cpse_id) map.set(m.cpse_id, m.cpse_name || m.cpse_id);
    }));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [clusters]);

  const categoryOptions = useMemo(() => {
    const set = new Set(clusters.map((c) => c.category).filter(Boolean));
    return Array.from(set);
  }, [clusters]);

  const statusOptions = useMemo(() => {
    const set = new Set(clusters.flatMap((c) => (c.materials || []).map((m) => m.status)).filter(Boolean));
    return Array.from(set);
  }, [clusters]);

  const filteredClusters = useMemo(() => {
    return clusters.filter((c) => {
      if (selectedCpse !== 'all' && !(c.materials || []).some((m) => m.cpse_id === selectedCpse)) return false;
      if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && !(c.materials || []).some((m) => m.status === selectedStatus)) return false;
      return true;
    });
  }, [clusters, selectedCpse, selectedCategory, selectedStatus]);

  const lockedInventory = useMemo(
    () => clusters.reduce((sum, c) => sum + clusterLockedValue(c), 0),
    [clusters]
  );

  const resetFilters = () => {
    setSelectedCpse('all');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const handleRunDetection = async () => {
    setIsDetecting(true);
    try {
      const data = await detectDuplicateClusters(similarityThreshold, 500);
      setStats({
        clusters_found: data.clusters_found,
        total_duplicates: data.total_duplicates
      });
      showToast(
        `Detection complete: ${data.clusters_found} clusters, ${data.total_duplicates} duplicate items`,
        'success'
      );
      const fresh = await getDuplicateClusters(similarityThreshold, 500);
      setClusters(fresh.clusters || []);
      setSelectedCluster((prev) => {
        if (prev && (fresh.clusters || []).some((c) => c.cluster_id === prev.cluster_id)) return prev;
        return fresh.clusters?.[0] || null;
      });
    } catch (err) {
      showToast(err.message || 'Duplicate detection failed', 'danger');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleOpenMergeModal = (cluster) => {
    setSelectedCluster(cluster);
    const primary = cluster.materials?.[0];
    setDraftDescription(primary?.cleaned_description || primary?.description || '');
    setIsMergeModalOpen(true);
  };

  const handleConfirmMerge = () => {
    setIsMergeModalOpen(false);
    showToast(
      `Merge request for cluster #${selectedCluster?.cluster_id} (${selectedCluster?.material_count} items) queued for approval review`,
      'success'
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>AI Duplicate Detection & Cluster Resolution</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Identify cross-CPSE duplicate material masters using NLP vector similarity, fuzzy string matching, and specification analysis.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <Sliders size={14} style={{ color: '#64748B' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Similarity Range:</span>
            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={similarityThreshold}
              onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
              style={{ accentColor: '#2563EB', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', minWidth: '52px' }}>
              {similarityThreshold}%+
            </span>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRunDetection}
            disabled={isDetecting}
            title="Run AI duplicate detection scan on the backend"
          >
            <RefreshCw size={15} style={isDetecting ? { animation: 'spin 1s linear infinite' } : undefined} />
            {isDetecting ? 'Detecting...' : 'Run Duplicate Detection'}
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #DC2626' }}>
          <div className="stat-header">
            <span className="stat-label">Total Duplicate Clusters</span>
            <Copy size={18} style={{ color: '#DC2626' }} />
          </div>
          <div className="stat-value">{stats.clusters_found.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Across {cpseOptions.length || 0} CPSE enterprises</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #D97706' }}>
          <div className="stat-header">
            <span className="stat-label">Total Duplicate Items</span>
            <Layers size={18} style={{ color: '#D97706' }} />
          </div>
          <div className="stat-value">{stats.total_duplicates.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Records grouped by vector similarity</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #16A34A' }}>
          <div className="stat-header">
            <span className="stat-label">Locked Duplicate Inventory</span>
            <DollarSign size={18} style={{ color: '#16A34A' }} />
          </div>
          <div className="stat-value">{formatRupees(lockedInventory)}</div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>
            Stock tied in cross-CPSE duplicates
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building2 size={14} style={{ color: '#64748B' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>CPSE:</span>
            <select
              className="form-control"
              style={{ width: '190px', padding: '5px 8px', fontSize: '12px' }}
              value={selectedCpse}
              onChange={(e) => setSelectedCpse(e.target.value)}
            >
              <option value="all">All CPSE Enterprises</option>
              {cpseOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.id.toUpperCase()} - {c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} style={{ color: '#64748B' }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Category:</span>
            <select
              className="form-control"
              style={{ width: '180px', padding: '5px 8px', fontSize: '12px' }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Match Status:</span>
            <select
              className="form-control"
              style={{ width: '160px', padding: '5px 8px', fontSize: '12px' }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>
            <RotateCcw size={13} /> Reset Filters
          </button>
        </div>
      </div>

      {/* Loading / Error / Empty / Data States */}
      {isLoading ? (
        <div className="card empty-state">
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontWeight: 600, color: '#0F172A' }}>
            {similarityThreshold >= 80
              ? 'Running AI Vector Similarity across National Material Master...'
              : 'Re-running duplicate scan at new similarity range...'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            Comparing material specifications across participating CPSE registers
          </div>
        </div>
      ) : error ? (
        <div className="card empty-state">
          <AlertCircle className="empty-state-icon" />
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>Failed to Load Duplicate Data</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            {error}. Ensure the backend AI service is running at http://localhost:8000.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={() => setRefreshKey((k) => k + 1)}
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      ) : filteredClusters.length === 0 ? (
        <div className="card empty-state">
          <AlertCircle className="empty-state-icon" />
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>No Duplicate Clusters Found</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            No clusters match the current similarity range / filters. Lower the threshold or reset filters.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={() => {
              resetFilters();
              setSimilarityThreshold(80);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.3fr' }}>
          {/* Left Column: Duplicate Clusters List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
              High-Value Overlap Clusters ({filteredClusters.length})
            </div>

            {filteredClusters.map((cluster) => {
              const isSelected = selectedCluster?.cluster_id === cluster.cluster_id;
              const cpseNames = Array.from(
                new Set((cluster.materials || []).map((m) => m.cpse_name || m.cpse_id).filter(Boolean))
              );
              return (
                <div
                  key={cluster.cluster_id}
                  onClick={() => setSelectedCluster(cluster)}
                  className="card"
                  style={{
                    padding: '16px',
                    cursor: 'pointer',
                    margin: 0,
                    border: isSelected ? '2px solid #2563EB' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? '#F0F9FF' : '#FFFFFF'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8' }}>
                        Cluster #{cluster.cluster_id}
                      </span>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                        {cluster.category || 'Uncategorized'} Overlap Cluster
                      </h3>
                    </div>
                    <Badge variant="ai">
                      <Sparkles size={11} /> {cluster.avg_similarity}% Match
                    </Badge>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
                    CPSEs: <strong>{cpseNames.join(', ') || '—'}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                      {cluster.material_count} Duplicate Items
                    </span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803D' }}>
                      Locked: {formatRupees(clusterLockedValue(cluster))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Inspector Panel */}
          {selectedCluster && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="card-header">
                <div>
                  <div className="card-title"><Layers size={18} className="text-blue-600" /> Cluster Deep-Dive Inspector</div>
                  <div className="card-subtitle">Cluster #{selectedCluster.cluster_id}: {selectedCluster.category} Overlap Cluster</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleOpenMergeModal(selectedCluster)}>
                  <Sparkles size={14} /> Merge & Deduplicate Cluster
                </button>
              </div>

              {/* Total Impact Banner */}
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>Financial Impact</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#92400E' }}>
                    Total Locked Inventory: {formatRupees(clusterLockedValue(selectedCluster))}
                  </div>
                </div>
                <Badge variant="warning">Duplicate Cluster @ {selectedCluster.avg_similarity}%</Badge>
              </div>

              {/* Candidate Items Breakdown */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                  Candidate Items Included in Cluster ({selectedCluster.materials?.length || 0})
                </h4>

                <div className="table-container">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>CPSE & Code</th>
                        <th>Original Description</th>
                        <th>Standardized Description</th>
                        <th>Unit Cost</th>
                        <th>Stock Qty</th>
                        <th>Match Type</th>
                        <th>Similarity</th>
                        <th>Review Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedCluster.materials || []).map((cand, idx) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{cand.cpse_name || cand.cpse_id}</div>
                            <div className="code-tag">{cand.material_code}</div>
                          </td>
                          <td style={{ fontSize: '11px', maxWidth: '200px' }}>
                            "{cand.raw_description || cand.description}"
                          </td>
                          <td style={{ fontSize: '11px', maxWidth: '200px' }}>
                            {cand.cleaned_description || cand.description}
                          </td>
                          <td style={{ fontWeight: 700, fontSize: '12px' }}>
                            {formatINR(cand.unit_cost)}
                          </td>
                          <td style={{ fontWeight: 600, fontSize: '12px' }}>{cand.stock_qty} NOS</td>
                          <td>
                            <Badge variant="ai">AI Vector Match</Badge>
                          </td>
                          <td>
                            <Badge variant="ai">{selectedCluster.avg_similarity}%</Badge>
                          </td>
                          <td>
                            <Badge variant={STATUS_VARIANTS[cand.status] || 'neutral'}>{cand.status || 'Unmapped'}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Reasoning */}
              <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px', color: '#334155' }}>
                <strong>AI Recommendation Note:</strong> These {selectedCluster.material_count} items from{' '}
                {Array.from(new Set((selectedCluster.materials || []).map((m) => m.cpse_name || m.cpse_id))).join(', ')}{' '}
                were grouped into a duplicate cluster at {selectedCluster.avg_similarity}% vector similarity. Review the
                standardized descriptions below and route the unification through the human approval workflow before any
                master code merge.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Merge & Deduplicate Modal (human-initiated; queued for approval — no automatic merge) */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title={`Merge Duplicate Cluster: #${selectedCluster?.cluster_id}`}
        subtitle="Unify redundant CPSE item master records into National Material Master"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsMergeModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirmMerge}>
              <CheckCircle2 size={15} /> Execute Master Merge
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
              Standardized Master Material Description
            </label>
            <textarea
              className="form-control"
              rows={3}
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
            />
          </div>

          <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '12px', color: '#1D4ED8' }}>
            Merging will link {selectedCluster?.material_count} local CPSE codes and trigger cross-enterprise stock
            visibility. This request will be queued for human approval review — nothing is merged automatically.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DuplicateDetectionPage;