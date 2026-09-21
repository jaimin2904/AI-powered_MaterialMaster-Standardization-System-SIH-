import React, { useState, useEffect } from 'react';
import { History, Search, Download, Filter, Eye, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import Badge from '../components/common/Badge';
import Drawer from '../components/common/Drawer';
import { AUDIT_LOGS, CPSE_LIST } from '../data/mockData';
import { getAuditLogs } from '../services/api';

export const AuditHistoryPage = ({ selectedCpse, setSelectedCpse, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [logs, setLogs] = useState(AUDIT_LOGS);

  useEffect(() => {
    getAuditLogs()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((l) => ({
            id: `AUD-${l.id}`,
            timestamp: new Date(l.timestamp).toLocaleString(),
            eventType: l.action,
            cpse: 'NTPC & CPSEs',
            numcCode: 'NUMC-401015-0089',
            actor: l.user,
            description: l.new_value ? (l.new_value.length > 90 ? l.new_value.substring(0, 90) + '...' : l.new_value) : l.action,
            status: 'Verified',
            rawLog: l
          }));
          setLogs(mapped);
        }
      })
      .catch(() => {
        // Fallback to static mock logs
      });
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (selectedEventType !== 'ALL' && !log.eventType.includes(selectedEventType)) return false;
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.id.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.cpse.toLowerCase().includes(q) ||
      log.numcCode.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Immutable Master Data Audit Log & History</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Complete audit trail of material master edits, approvals, duplicate mergers, code re-assignments, and AI agent actions.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => showToast('Exporting Audit Trail to CSV / PDF...', 'info')}>
          <Download size={14} /> Export Immutable Audit Log
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '34px', fontSize: '12px' }}
            placeholder="Search audit ID, actor name, NUMC code, or event text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Event Type:</span>
          <select
            className="form-control"
            style={{ width: '180px', padding: '5px 8px', fontSize: '12px' }}
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
          >
            <option value="ALL">All Event Types</option>
            <option value="DUPLICATE_MERGE">Duplicate Merge</option>
            <option value="MAPPING_APPROVE">Mapping Approve</option>
            <option value="SPEC_AUGMENTATION">Spec Augmentation</option>
            <option value="PRICE_VARIANCE">Price Variance Alert</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>Audit Log ID</th>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>CPSE Unit</th>
              <th>NUMC / Local Code</th>
              <th>Actor / System Agent</th>
              <th>Description</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>
                  <span className="code-tag">{log.id}</span>
                </td>
                <td style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap' }}>{log.timestamp}</td>
                <td>
                  <Badge variant={log.eventType.includes('MERGE') ? 'info' : log.eventType.includes('APPROVE') ? 'success' : 'warning'}>
                    {log.eventType}
                  </Badge>
                </td>
                <td style={{ fontWeight: 600, fontSize: '12px' }}>{log.cpse}</td>
                <td>
                  <span style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '12px' }}>{log.numcCode}</span>
                </td>
                <td style={{ fontSize: '12px', color: '#334155' }}>{log.actor}</td>
                <td style={{ fontSize: '12px' }}>{log.description}</td>
                <td>
                  <Badge variant="success"><CheckCircle2 size={10} /> {log.status}</Badge>
                </td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedLogDetail(log)}
                    title="View Audit Snapshot JSON"
                  >
                    <Eye size={13} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Snapshot Drawer */}
      <Drawer
        isOpen={Boolean(selectedLogDetail)}
        onClose={() => setSelectedLogDetail(null)}
        title={selectedLogDetail ? `Audit Log Record: ${selectedLogDetail.id}` : ''}
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedLogDetail(null)}>Close</button>
        }
      >
        {selectedLogDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div><strong>Event ID:</strong> {selectedLogDetail.id}</div>
              <div><strong>Timestamp:</strong> {selectedLogDetail.timestamp}</div>
              <div><strong>Action Performed By:</strong> {selectedLogDetail.actor}</div>
              <div><strong>CPSE Scope:</strong> {selectedLogDetail.cpse}</div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                Immutable Audit Trail JSON Snapshot
              </h4>
              <pre style={{
                backgroundColor: '#0F172A',
                color: '#F8FAFC',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto'
              }}>
                {JSON.stringify(
                  selectedLogDetail.rawLog || {
                    auditId: selectedLogDetail.id,
                    event: selectedLogDetail.eventType,
                    timestamp: selectedLogDetail.timestamp,
                    numcCode: selectedLogDetail.numcCode,
                    actor: selectedLogDetail.actor,
                    signatureHash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AuditHistoryPage;
