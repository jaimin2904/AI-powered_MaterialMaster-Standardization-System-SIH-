import React, { useState } from 'react';
import { Copy, Sparkles, AlertTriangle, ArrowRight, CheckCircle2, Sliders, DollarSign, Layers } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { DUPLICATE_CLUSTERS } from '../data/mockData';

export const DuplicateDetectionPage = ({ setActiveTab, showToast }) => {
  const [similarityThreshold, setSimilarityThreshold] = useState(85);
  const [selectedCluster, setSelectedCluster] = useState(DUPLICATE_CLUSTERS[0]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [draftDescription, setDraftDescription] = useState('');

  const filteredClusters = DUPLICATE_CLUSTERS.filter(
    (c) => c.similarityAvg >= similarityThreshold
  );

  const handleOpenMergeModal = (cluster) => {
    setSelectedCluster(cluster);
    setDraftDescription(cluster.primaryItem.description);
    setIsMergeModalOpen(true);
  };

  const handleConfirmMerge = () => {
    setIsMergeModalOpen(false);
    showToast(`Merged ${selectedCluster.clusterId} (${selectedCluster.itemCount} items) into Unified Master!`, 'success');
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FFFFFF', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Similarity Threshold:</span>
          <input
            type="range"
            min="70"
            max="100"
            step="1"
            value={similarityThreshold}
            onChange={(e) => setSimilarityThreshold(Number(e.target.value))}
            style={{ accentColor: '#2563EB', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#1D4ED8', minWidth: '42px' }}>
            {similarityThreshold}%+
          </span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid-3">
        <div className="stat-card" style={{ borderLeft: '4px solid #DC2626' }}>
          <div className="stat-header">
            <span className="stat-label">Total Duplicate Clusters</span>
            <Copy size={18} style={{ color: '#DC2626' }} />
          </div>
          <div className="stat-value">42,890</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Across 7 Central Ministries</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #D97706' }}>
          <div className="stat-header">
            <span className="stat-label">Locked Duplicate Inventory</span>
            <DollarSign size={18} style={{ color: '#D97706' }} />
          </div>
          <div className="stat-value">₹1,420.5 Cr</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>In redundant spares stock</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid #16A34A' }}>
          <div className="stat-header">
            <span className="stat-label">Estimated Unification Savings</span>
            <CheckCircle2 size={18} style={{ color: '#16A34A' }} />
          </div>
          <div className="stat-value">₹385.2 Cr</div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>Immediate Inter-CPSE Sharing</div>
        </div>
      </div>

      {/* Main Grid: Clusters List & Inspector Panel */}
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.3fr' }}>
        {/* Left Column: Duplicate Clusters List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>
            High-Value Overlap Clusters ({filteredClusters.length})
          </div>

          {filteredClusters.map((cluster) => {
            const isSelected = selectedCluster?.clusterId === cluster.clusterId;
            return (
              <div
                key={cluster.clusterId}
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
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8' }}>{cluster.clusterId}</span>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                      {cluster.title}
                    </h3>
                  </div>
                  <Badge variant="ai">
                    <Sparkles size={11} /> {cluster.similarityAvg}% Match
                  </Badge>
                </div>

                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '8px' }}>
                  CPSEs: <strong>{cluster.cpseInvolved.join(', ')}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                    {cluster.itemCount} Duplicate Items
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803D' }}>
                    Est. Saving: ₹{(cluster.potentialSaving / 100000).toFixed(2)} Lakhs
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
                <div className="card-subtitle">{selectedCluster.clusterId}: {selectedCluster.title}</div>
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
                  Total Locked Inventory: ₹{(selectedCluster.totalStockValue / 100000).toFixed(2)} Lakhs
                </div>
              </div>
              <Badge variant="warning">Price Divergence Detected</Badge>
            </div>

            {/* Candidate Items Breakdown */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                Candidate Items Included in Cluster ({selectedCluster.clusterCandidates.length})
              </h4>

              <div className="table-container">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>CPSE & Code</th>
                      <th>Raw Item Description</th>
                      <th>Unit Cost</th>
                      <th>Stock Qty</th>
                      <th>Similarity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCluster.clusterCandidates.map((cand, idx) => (
                      <tr key={idx}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{cand.cpseName}</div>
                          <div className="code-tag">{cand.localCode}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>"{cand.rawDescription}"</td>
                        <td style={{ fontWeight: 700, color: cand.unitCost === Math.min(...selectedCluster.clusterCandidates.map(c=>c.unitCost)) ? '#16A34A' : '#0F172A' }}>
                          ₹{cand.unitCost.toLocaleString('en-IN')}
                        </td>
                        <td style={{ fontWeight: 600 }}>{cand.stockQty} NOS</td>
                        <td>
                          <Badge variant="ai">{cand.similarity}%</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Reasoning */}
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '12px', color: '#334155' }}>
              <strong>AI Recommendation Note:</strong> These items share identical API / ASME standards and nominal dimensional attributes. Unifying them into single master code <strong>{selectedCluster.numcSuggested}</strong> allows NTPC and Coal India to cross-borrow inventory during overhaul outages.
            </div>
          </div>
        )}
      </div>

      {/* Merge & Deduplicate Modal */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title={`Merge Duplicate Cluster: ${selectedCluster?.clusterId}`}
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
              National Unified Master Code (NUMC)
            </label>
            <input
              type="text"
              className="form-control"
              value={selectedCluster?.numcSuggested}
              readOnly
              style={{ fontWeight: 700, backgroundColor: '#F8FAFC' }}
            />
          </div>

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
            Merging will link {selectedCluster?.itemCount} local CPSE codes and trigger automated stock visibility across participating public sector units.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DuplicateDetectionPage;
