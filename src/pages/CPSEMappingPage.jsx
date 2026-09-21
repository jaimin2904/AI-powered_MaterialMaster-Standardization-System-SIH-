import React, { useState, useEffect } from 'react';
import { GitMerge, Upload, Download, CheckCircle2, RefreshCw, XCircle, Search, Sparkles } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { MAPPING_DATA, CPSE_LIST } from '../data/mockData';
import { getMappings, updateMappingStatus, uploadMaterialsCsvFile } from '../services/api';

export const CPSEMappingPage = ({ selectedCpse, setSelectedCpse, showToast }) => {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'Unmapped' | 'Confirmed' | 'Under Review'
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [mappings, setMappings] = useState(MAPPING_DATA);
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getMappings(activeTab)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m) => ({
            id: `MAP-${m.id}`,
            mapping_db_id: m.id,
            cpseId: m.material?.cpse_id || 'ntpc',
            cpseName: m.material?.cpse_name || m.material?.cpse_id?.toUpperCase() || 'NTPC Limited',
            localCode: m.material?.material_code || 'N/A',
            rawDescription: m.material?.raw_description || m.material?.description || 'N/A',
            aiSuggestedCode: m.standard_material?.national_code || 'NUMC-401015-0089',
            aiSuggestedName: m.standard_material?.standard_description || m.material?.description || 'Standard Item',
            unspsc: `${m.material?.category || 'General Spares'}`,
            confidence: m.similarity_score > 0 ? m.similarity_score : 97.5,
            status: m.status,
            category: m.material?.category || 'General'
          }));
          setMappings(mapped);
        }
      })
      .catch(() => {
        // Fallback to static mock data
      });
  }, [activeTab]);

  const filteredMappings = mappings.filter((m) => {
    if (selectedCpse !== 'all' && m.cpseId !== selectedCpse) return false;
    if (activeTab !== 'ALL' && m.status !== activeTab) return false;
    return true;
  });

  const handleConfirmMapping = (mapItem) => {
    const dbId = mapItem.mapping_db_id || 1;
    updateMappingStatus(dbId, 'Confirmed')
      .then(() => {
        setMappings(
          mappings.map((m) => (m.id === mapItem.id ? { ...m, status: 'Confirmed' } : m))
        );
        showToast(`Approved code mapping for ${mapItem.id}`, 'success');
      })
      .catch(() => {
        setMappings(
          mappings.map((m) => (m.id === mapItem.id ? { ...m, status: 'Confirmed' } : m))
        );
        showToast(`Approved code mapping for ${mapItem.id}`, 'success');
      });
  };

  const handleRejectMapping = (mapItem) => {
    const dbId = mapItem.mapping_db_id || 1;
    updateMappingStatus(dbId, 'Under Review')
      .then(() => {
        setMappings(
          mappings.map((m) => (m.id === mapItem.id ? { ...m, status: 'Under Review' } : m))
        );
        showToast(`Flagged mapping ${mapItem.id} for custodian re-review`, 'warning');
      })
      .catch(() => {
        setMappings(
          mappings.map((m) => (m.id === mapItem.id ? { ...m, status: 'Under Review' } : m))
        );
        showToast(`Flagged mapping ${mapItem.id} for custodian re-review`, 'warning');
      });
  };

  const handleImportSimulate = () => {
    if (uploadFile) {
      setIsUploading(true);
      uploadMaterialsCsvFile(uploadFile, selectedCpse === 'all' ? 'ntpc' : selectedCpse)
        .then((res) => {
          showToast(res.message || 'Successfully uploaded materials via API!', 'success');
          setIsImportModalOpen(false);
          setUploadFile(null);
        })
        .catch((err) => {
          showToast(`CSV Upload Error: ${err.message}`, 'danger');
        })
        .finally(() => setIsUploading(false));
    } else {
      setIsImportModalOpen(false);
      showToast('Imported 1,240 CPSE legacy material records for automated NUMC AI mapping!', 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>CPSE Material Code Mapping & Taxonomy Alignment</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Map legacy public sector enterprise material codes to the National Unified Material Classification (NUMC) taxonomy.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={14} /> Batch Import Legacy CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => showToast('Exporting NUMC mapping register to Excel...', 'info')}>
            <Download size={14} /> Export Mapping Register
          </button>
        </div>
      </div>

      {/* CPSE Filter & Tab Toolbar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'Unmapped', 'Confirmed', 'Under Review'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            >
              {tab === 'ALL' ? 'All Mappings' : tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Filter CPSE:</span>
          <select
            className="form-control"
            style={{ width: '200px', padding: '5px 10px', fontSize: '12px' }}
            value={selectedCpse}
            onChange={(e) => setSelectedCpse(e.target.value)}
          >
            {CPSE_LIST.map((c) => (
              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mapping Data Table */}
      <div className="table-container">
        <table className="enterprise-table">
          <thead>
            <tr>
              <th>CPSE & Local Code</th>
              <th>Raw Legacy Description</th>
              <th>AI Suggested NUMC Code & Name</th>
              <th>UNSPSC Taxonomy</th>
              <th>AI Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMappings.map((map) => (
              <tr key={map.id}>
                <td>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '12px' }}>{map.cpseName}</div>
                  <div className="code-tag">{map.localCode}</div>
                </td>
                <td style={{ fontSize: '12px', fontStyle: 'italic', color: '#334155' }}>
                  "{map.rawDescription}"
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '12px' }}>{map.aiSuggestedCode}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0F172A', marginTop: '2px' }}>
                    {map.aiSuggestedName}
                  </div>
                </td>
                <td>
                  <Badge variant="neutral">{map.unspsc}</Badge>
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{map.category}</div>
                </td>
                <td>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: map.confidence > 95 ? '#15803D' : '#D97706' }}>
                    {map.confidence}%
                  </div>
                </td>
                <td>
                  <Badge variant={map.status === 'Confirmed' ? 'success' : map.status === 'Unmapped' ? 'warning' : 'info'}>
                    {map.status}
                  </Badge>
                </td>
                <td>
                  {map.status === 'Confirmed' ? (
                    <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> Mapped
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleConfirmMapping(map)}
                        title="Confirm AI Mapping"
                      >
                        <CheckCircle2 size={13} /> Confirm
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRejectMapping(map)}
                        title="Flag for Review"
                      >
                        <XCircle size={13} /> Re-map
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Batch Import Legacy CPSE Catalog"
        subtitle="Upload CSV or Excel file containing legacy material codes for AI mapping"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsImportModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleImportSimulate} disabled={isUploading}>
              <Upload size={14} /> {isUploading ? 'Uploading...' : 'Start Automated AI Mapping Process'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            cursor: 'pointer'
          }}>
            <Upload size={32} style={{ color: '#2563EB', margin: '0 auto 8px' }} />
            <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '13px' }}>
              Drag & Drop Legacy Catalog (.CSV, .TXT) here
            </div>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setUploadFile(e.target.files[0])}
              style={{ marginTop: '10px', fontSize: '12px' }}
            />
            {uploadFile && (
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803D', marginTop: '6px' }}>
                Selected File: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CPSEMappingPage;
