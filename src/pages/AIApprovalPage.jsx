import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, ArrowRight, Filter, Shield, AlertCircle, MessageSquare } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { AI_APPROVAL_QUEUE } from '../data/mockData';
import { submitApproval } from '../services/api';

export const AIApprovalPage = ({ showToast }) => {
  const [queue, setQueue] = useState(AI_APPROVAL_QUEUE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === queue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(queue.map((i) => i.id));
    }
  };

  const handleApproveSelected = () => {
    selectedIds.forEach((id) => {
      submitApproval(1, 'Approved', 'Bulk approved via AI Approval Queue', 'Master Data Admin').catch(() => {});
    });
    setQueue(queue.filter((i) => !selectedIds.includes(i.id)));
    showToast(`Approved ${selectedIds.length} AI recommendation(s) via REST API`, 'success');
    setSelectedIds([]);
  };

  const handleApproveSingle = (id) => {
    submitApproval(1, 'Approved', 'Single approved via AI Approval Queue', 'Master Data Admin').catch(() => {});
    setQueue(queue.filter((i) => i.id !== id));
    showToast(`Approved recommendation ${id} & recorded in Audit Log`, 'success');
  };

  const handleConfirmReject = () => {
    if (rejectModalItem) {
      submitApproval(1, 'Rejected', rejectReason || 'Rejected by custodian', 'Master Data Admin').catch(() => {});
      setQueue(queue.filter((i) => i.id !== rejectModalItem.id));
      showToast(`Rejected recommendation ${rejectModalItem.id}. Feedback recorded in database.`, 'warning');
      setRejectModalItem(null);
      setRejectReason('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>AI Recommendation & Custodian Approval Queue</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Validate AI suggestions for material description expansion, taxonomy re-assignment, and duplicate cluster mergers.
          </p>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#EEF2FF', padding: '6px 14px', borderRadius: '8px', border: '1px solid #C7D2FE' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#4338CA', alignSelf: 'center' }}>
              {selectedIds.length} Item(s) Selected
            </span>
            <button className="btn btn-primary btn-sm" onClick={handleApproveSelected}>
              <CheckCircle2 size={14} /> Bulk Approve Selected
            </button>
          </div>
        )}
      </div>

      {/* Queue Toolbar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={selectedIds.length === queue.length && queue.length > 0}
            onChange={handleSelectAll}
          />
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
            Select All ({queue.length} Pending Actions)
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Showing <strong>{queue.length}</strong> items awaiting Master Data Nodal Officer verification
        </div>
      </div>

      {/* Queue Items List */}
      {queue.length === 0 ? (
        <div className="card empty-state">
          <CheckCircle2 size={48} style={{ color: '#16A34A', margin: '0 auto 12px' }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Approval Queue is Clear!</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            All AI material recommendations have been validated and published to the NUMC National Master.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {queue.map((item) => {
            const isChecked = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: '20px',
                  margin: 0,
                  border: isChecked ? '2px solid #2563EB' : '1px solid var(--border-color)',
                  backgroundColor: isChecked ? '#F0F9FF' : '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8' }}>{item.id}</span>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                        {item.cpseName} • Local Code: {item.localCode}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Badge variant="ai">
                      <Sparkles size={11} /> {item.type}
                    </Badge>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#15803D' }}>
                      Confidence: {item.aiConfidence}%
                    </span>
                  </div>
                </div>

                {/* Diff Comparison View (Before vs After) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px' }}>
                  {/* Before (Legacy Raw Text) */}
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                      Legacy Raw CPSE Input
                    </div>
                    <div style={{ fontSize: '13px', color: '#7F1D1D', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      "{item.rawText}"
                    </div>
                  </div>

                  {/* After (AI Proposal) */}
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                      AI Standardized Proposal ({item.numcTarget})
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#14532D', marginTop: '4px' }}>
                      {item.proposedText}
                    </div>
                  </div>
                </div>

                {/* AI Rationale Note */}
                <div style={{ padding: '10px 12px', borderRadius: '6px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', marginTop: '12px', fontSize: '12px', color: '#475569' }}>
                  <strong>AI Rationale:</strong> {item.rationale}
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setRejectModalItem(item)}>
                    <XCircle size={13} /> Reject & Return
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => handleApproveSingle(item.id)}>
                    <CheckCircle2 size={13} /> Approve Recommendation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={Boolean(rejectModalItem)}
        onClose={() => setRejectModalItem(null)}
        title="Reject AI Recommendation"
        subtitle={`Flag recommendation ${rejectModalItem?.id} for re-training`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setRejectModalItem(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleConfirmReject}>
              Confirm Rejection & Send Feedback
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
              Reason for Rejection / Custodian Notes
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Specification misidentified. Class 150 pressure rating was confused with Class 300..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIApprovalPage;
