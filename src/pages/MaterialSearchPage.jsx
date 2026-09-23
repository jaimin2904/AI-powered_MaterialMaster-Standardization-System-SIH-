import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Eye,
  GitCompare,
  Sparkles,
  Building2,
  Package,
  Layers,
  RefreshCw,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Drawer from '../components/common/Drawer';
import { CPSE_LIST } from '../data/mockData';
import { getMaterials, matchMaterial, submitApproval } from '../services/api';

const MATCH_STATUS_VARIANTS = {
  Confirmed: 'success',
  'Under Review': 'warning',
  'Duplicate Cluster': 'danger',
  Unmapped: 'neutral'
};

const classifyRecommendation = (score, bestMatch) => {
  if (!bestMatch || !score || score < 50) {
    return { label: 'Different Material', variant: 'danger' };
  }
  if (score >= 75) {
    return { label: 'Potential Equivalent Material', variant: 'success' };
  }
  return { label: 'Possible Near Duplicate', variant: 'warning' };
};

export const MaterialSearchPage = ({ selectedCpse, setSelectedCpse, comparisonItems, setComparisonItems, setActiveTab, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAiSemantic, setIsAiSemantic] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [materials, setMaterials] = useState([]);

  // AI Material Match state
  const [matchingMaterial, setMatchingMaterial] = useState(null);
  const [isMatchOpen, setIsMatchOpen] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState(null);

  // Human Review & Approval state
  const [reviewComment, setReviewComment] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Fetch materials from API whenever filters change
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    getMaterials(selectedCpse, searchTerm, selectedCategory, selectedStatus)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m) => {
            let specs = {};
            try {
              specs = typeof m.specification === 'string' ? JSON.parse(m.specification) : m.specification || {};
            } catch (e) {
              specs = { Description: m.description };
            }
            return {
              id: m.id,
              numcCode: 'NUMC-401015-0089',
              localCode: m.material_code,
              cpseId: m.cpse_id,
              cpseName: m.cpse_name || m.cpse_id.toUpperCase(),
              rawDescription: m.raw_description || m.description,
              standardDescription: m.description,
              unspscCode: '40141600',
              unspscCategory: m.category,
              mescCode: '60.12.34.110.1',
              stockQty: m.stock_qty || 10,
              unit: m.unit,
              unitCost: m.unit_cost || 0,
              manufacturer: m.manufacturer || 'Approved OEM Vendor',
              plantLocation: m.plant_location || 'Central CPSE Complex',
              status: 'Harmonized',
              confidenceScore: 98.4,
              lastUpdated: '2026-09-20',
              specifications: specs
            };
          });
          setMaterials(mapped);
        } else {
          setMaterials([]);
        }
      })
      .catch((err) => {
        setMaterials([]);
        setLoadError(err.message || 'Failed to load materials');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCpse, searchTerm, selectedCategory, selectedStatus, retryKey]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      if (inStockOnly && mat.stockQty <= 0) return false;
      return true;
    });
  }, [materials, inStockOnly]);

  const handleSimulateSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast('AI Semantic Material Search Updated', 'info');
    }, 300);
  };

  const handleMatchMaterial = (mat) => {
    if (!mat.id) {
      showToast('AI Match is available for live catalog items only (sample data has no backend record)', 'warning');
      return;
    }
    setMatchingMaterial(mat);
    setMatchResult(null);
    setMatchError(null);
    setIsMatchLoading(true);
    setIsMatchOpen(true);
    matchMaterial(mat.id)
      .then((data) => setMatchResult(data))
      .catch((err) => setMatchError(err.message || 'AI material matching failed'))
      .finally(() => setIsMatchLoading(false));
  };

  const handleRetryMatch = () => {
    if (!matchingMaterial?.id) return;
    setMatchResult(null);
    setMatchError(null);
    setIsMatchLoading(true);
    matchMaterial(matchingMaterial.id)
      .then((data) => setMatchResult(data))
      .catch((err) => setMatchError(err.message || 'AI material matching failed'))
      .finally(() => setIsMatchLoading(false));
  };

  const handleReviewAction = (materialId, mappingId, decision) => {
    if (!matchingMaterial?.id || !mappingId || isReviewSubmitting) return;
    setIsReviewSubmitting(true);
    setReviewError(null);
    submitApproval(
      mappingId,
      decision,
      reviewComment.trim() || (decision === 'Approved' ? 'Approved via Material Matching review' : 'Rejected via Material Matching review'),
      'Master Data Admin'
    )
      .then(() => {
        const newStatus = decision === 'Approved' ? 'Confirmed' : 'Under Review';
        setMatchResult((prev) => (prev ? { ...prev, match_status: newStatus } : prev));
        setReviewComment('');
        if (decision === 'Approved') {
          showToast(`Approved match for ${matchingMaterial.localCode}. Mapping confirmed & audit logged.`, 'success');
        } else {
          showToast(`Rejected match for ${matchingMaterial.localCode}. Feedback recorded & audit logged.`, 'warning');
        }
      })
      .catch((err) => {
        setReviewError(err.message || 'Review action failed');
        showToast(err.message || 'Review action failed', 'danger');
      })
      .finally(() => setIsReviewSubmitting(false));
  };

  const toggleAddToComparison = (item) => {
    const exists = comparisonItems.some((i) => i.localCode === item.localCode);
    if (exists) {
      setComparisonItems(comparisonItems.filter((i) => i.localCode !== item.localCode));
      showToast(`Removed from comparison`, 'info');
    } else {
      if (comparisonItems.length >= 4) {
        showToast('Maximum 4 items allowed in comparison matrix', 'warning');
        return;
      }
      setComparisonItems([...comparisonItems, item]);
      showToast(`Added ${item.localCode} to comparison selection`, 'success');
    }
  };

  const isSelectedForComparison = (item) => {
    return comparisonItems.some((i) => i.localCode === item.localCode);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Material Search & Semantic AI Matching</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Unified catalog lookup across National Material Master (NUMC) and CPSE local code registers.
          </p>
        </div>

        {comparisonItems.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            padding: '6px 14px',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D4ED8' }}>
              {comparisonItems.length} Material(s) Selected for Comparison
            </span>
            <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('comparison')}>
              Compare Selected Matrix <GitCompare size={13} />
            </button>
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              onClick={() => setComparisonItems([])}
              title="Clear comparison selection"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filter Box */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Top Search Input */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94A3B8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '38px', height: '38px', fontSize: '13px' }}
                placeholder="Search by keywords, NUMC code (NUMC-401015...), CPSE code, or specs e.g. 'Gate Valve 2 inch 150#'"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-primary" onClick={handleSimulateSearch}>
              <Search size={15} /> Search Material
            </button>
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* CPSE Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>CPSE:</span>
              <select
                className="form-control"
                style={{ width: '180px', padding: '5px 8px', fontSize: '12px' }}
                value={selectedCpse}
                onChange={(e) => setSelectedCpse(e.target.value)}
              >
                {CPSE_LIST.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Category:</span>
              <select
                className="form-control"
                style={{ width: '180px', padding: '5px 8px', fontSize: '12px' }}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All UNSPSC Categories</option>
                <option value="Valves">Valves</option>
                <option value="Motors">Motors</option>
                <option value="Bearings">Bearings</option>
                <option value="Pumps & Impellers">Pumps & Impellers</option>
                <option value="Electrical Cables">Electrical Cables</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Status:</span>
              <select
                className="form-control"
                style={{ width: '150px', padding: '5px 8px', fontSize: '12px' }}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Harmonized">Harmonized</option>
                <option value="Duplicate Cluster">Duplicate Cluster</option>
                <option value="Under AI Review">Under AI Review</option>
              </select>
            </div>

            {/* AI Semantic Search Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#4338CA' }}>
              <input
                type="checkbox"
                checked={isAiSemantic}
                onChange={(e) => setIsAiSemantic(e.target.checked)}
              />
              <Sparkles size={14} /> AI Semantic Fuzzy Matching
            </label>

            {/* Stock Availability Toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              Available Stock Only
            </label>
          </div>
        </div>
      </div>

      {/* Results Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
          Showing <strong>{filteredMaterials.length}</strong> material records found
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
          >
            Table View
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid Cards
          </button>
        </div>
      </div>

      {/* Main Results Data Container */}
      {isLoading ? (
        <div className="card empty-state">
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontWeight: 600, color: '#0F172A' }}>Running AI Vector Search Across 2.4 Million Items...</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Normalizing technical specs & indexing CPSE databases</div>
        </div>
      ) : loadError ? (
        <div className="card empty-state">
          <AlertCircle className="empty-state-icon" />
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>Failed to Load Materials</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            {loadError}. Ensure the backend AI service is running at http://localhost:8000.
          </div>
          <button className="btn btn-primary btn-sm" style={{ marginTop: '14px' }} onClick={() => setRetryKey((k) => k + 1)}>
            Retry
          </button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="card empty-state">
          <AlertCircle className="empty-state-icon" />
          <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>No Matching Materials Found</div>
          <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
            Try broadening search terms or clearing CPSE / Category filters.
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '14px' }}
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setSelectedCpse('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Select</th>
                <th>NUMC Master / Local Code</th>
                <th>CPSE & Location</th>
                <th>Standardized Specification Description</th>
                <th>Category / MESC</th>
                <th>Stock & Unit Price</th>
                <th>AI Match</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((mat, idx) => {
                const checked = isSelectedForComparison(mat);
                return (
                  <tr key={idx} style={{ backgroundColor: checked ? '#F0F9FF' : 'transparent' }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAddToComparison(mat)}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '12px' }}>{mat.numcCode}</div>
                      <div className="code-tag" style={{ marginTop: '2px', display: 'inline-block' }}>{mat.localCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{mat.cpseName}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{mat.plantLocation}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A', lineHeight: 1.3 }}>{mat.standardDescription}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', marginTop: '2px' }}>
                        Raw: "{mat.rawDescription}"
                      </div>
                    </td>
                    <td>
                      <Badge variant="neutral">{mat.unspscCategory}</Badge>
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>MESC: {mat.mescCode}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{mat.stockQty} {mat.unit}</div>
                      <div style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600 }}>
                        ₹{mat.unitCost.toLocaleString('en-IN')} / unit
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: mat.confidenceScore > 95 ? '#15803D' : '#D97706' }}>
                        {mat.confidenceScore}%
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>Match Confidence</div>
                    </td>
                    <td>
                      <Badge variant={mat.status === 'Harmonized' ? 'success' : mat.status === 'Duplicate Cluster' ? 'danger' : 'warning'}>
                        {mat.status}
                      </Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedItemDetail(mat)}
                          title="View Full Spec Sheet"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleMatchMaterial(mat)}
                          title="Run AI matching against National standard catalog"
                        >
                          <Sparkles size={13} />
                        </button>
                        <button
                          className={`btn btn-sm ${checked ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => toggleAddToComparison(mat)}
                          title={checked ? 'Selected for comparison' : 'Add to compare'}
                        >
                          <GitCompare size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid-3">
          {filteredMaterials.map((mat, idx) => {
            const checked = isSelectedForComparison(mat);
            return (
              <div key={idx} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', border: checked ? '2px solid #2563EB' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8' }}>{mat.numcCode}</span>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>{mat.cpseName}</h3>
                  </div>
                  <Badge variant={mat.status === 'Harmonized' ? 'success' : 'danger'}>
                    {mat.status}
                  </Badge>
                </div>

                <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 500, flex: 1 }}>
                  {mat.standardDescription}
                </div>

                <div style={{ padding: '8px', backgroundColor: '#F8FAFC', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
                  <div><strong>Manufacturer:</strong> {mat.manufacturer}</div>
                  <div><strong>Available Stock:</strong> {mat.stockQty} {mat.unit} @ ₹{mat.unitCost.toLocaleString('en-IN')}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setSelectedItemDetail(mat)}>
                    <Eye size={13} /> Details Sheet
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleMatchMaterial(mat)} title="Run AI matching">
                    <Sparkles size={13} />
                  </button>
                  <button className={`btn btn-sm ${checked ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleAddToComparison(mat)}>
                    <GitCompare size={13} /> {checked ? 'Selected' : 'Compare'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Material Technical Datasheet Side Drawer */}
      <Drawer
        isOpen={Boolean(selectedItemDetail)}
        onClose={() => setSelectedItemDetail(null)}
        title={selectedItemDetail ? `Material Datasheet: ${selectedItemDetail.numcCode}` : ''}
        footer={
          selectedItemDetail && (
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedItemDetail(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => {
                toggleAddToComparison(selectedItemDetail);
                setSelectedItemDetail(null);
              }}>
                Add to Comparison Matrix
              </button>
            </>
          )
        }
      >
        {selectedItemDetail && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#1D4ED8', textTransform: 'uppercase' }}>National Master Definition</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                {selectedItemDetail.standardDescription}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>CPSE Local Item Code</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{selectedItemDetail.localCode}</div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>UNSPSC Code</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{selectedItemDetail.unspscCode}</div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>CPSE Enterprise</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{selectedItemDetail.cpseName}</div>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Unit Procurement Cost</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#16A34A' }}>₹{selectedItemDetail.unitCost.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Technical Attributes Table */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Standardized Technical Attributes Matrix
              </h4>
              <div className="table-container">
                <table className="enterprise-table">
                  <thead>
                    <tr>
                      <th>Attribute Name</th>
                      <th>Spec Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedItemDetail.specifications).map(([key, val]) => (
                      <tr key={key}>
                        <td style={{ fontWeight: 600, color: '#475569' }}>{key}</td>
                        <td style={{ fontWeight: 700, color: '#0F172A' }}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plant Location & Stock */}
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Inventory Location</h4>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                <strong>Plant:</strong> {selectedItemDetail.plantLocation}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                <strong>Current Physical Stock:</strong> {selectedItemDetail.stockQty} {selectedItemDetail.unit}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                <strong>Approved OEMs / Brands:</strong> {selectedItemDetail.manufacturer}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* AI Material Match Results Drawer */}
      <Drawer
        isOpen={isMatchOpen}
        onClose={() => setIsMatchOpen(false)}
        title={`AI Match Result: ${matchingMaterial?.localCode || ''}`}
        footer={
          <button className="btn btn-secondary" onClick={() => setIsMatchOpen(false)}>
            Close
          </button>
        }
      >
        {isMatchLoading ? (
          <div className="card empty-state">
            <div className="loading-spinner" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontWeight: 600, color: '#0F172A' }}>Running AI Semantic Match...</div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Comparing specs against National Material Master catalog
            </div>
          </div>
        ) : matchError ? (
          <div className="card empty-state">
            <AlertCircle className="empty-state-icon" />
            <div style={{ fontWeight: 600, fontSize: '15px', color: '#0F172A' }}>Match Failed</div>
            <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              {matchError}. Ensure the backend AI service is running at http://localhost:8000.
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '14px' }} onClick={handleRetryMatch}>
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        ) : matchResult ? (
          (() => {
            const recommendation = classifyRecommendation(
              matchResult.best_match?.similarity_score,
              matchResult.best_match
            );
            const recNotes = {
              'Potential Equivalent Material': 'This material strongly matches the National standard below and is recommended for harmonization review.',
              'Possible Near Duplicate': 'Close technical overlap detected. Verify specifications before considering unification with the National standard.',
              'Different Material': 'No sufficiently similar National standard found. This item likely requires a new national classification.'
            };
            const best = matchResult.best_match;
            const matches = matchResult.all_matches || [];
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Original Material */}
                <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Original Material</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>{matchingMaterial.cpseName}</div>
                      <div className="code-tag" style={{ marginTop: '4px', display: 'inline-block' }}>
                        {matchingMaterial.localCode} · CPSE {matchingMaterial.cpseId.toUpperCase()}
                      </div>
                    </div>
                    <Badge variant={MATCH_STATUS_VARIANTS[matchResult.match_status] || 'neutral'}>
                      {matchResult.match_status || 'Unmapped'}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontStyle: 'italic', marginTop: '8px' }}>
                    Raw: "{matchingMaterial.rawDescription}"
                  </div>
                  <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: 500, marginTop: '4px' }}>
                    {matchingMaterial.standardDescription}
                  </div>
                </div>

                {/* Recommendation Banner */}
                <div style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${recommendation.variant === 'success' ? '#BBF7D0' : recommendation.variant === 'warning' ? '#FDE68A' : '#FECACA'}`, backgroundColor: recommendation.variant === 'success' ? '#F0FDF4' : recommendation.variant === 'warning' ? '#FFFBEB' : '#FFF7F7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Badge variant={recommendation.variant}>
                      <Sparkles size={11} /> {recommendation.label}
                    </Badge>
                    {best && (
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                        Best match: {best.national_code}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '8px' }}>{recNotes[recommendation.label]}</div>
                </div>

                {/* Best Match Similarity */}
                {best ? (
                  <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#1D4ED8' }}>AI Similarity Score</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1D4ED8' }}>
                        {best.similarity_score.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: '#DBEAFE', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, Math.max(0, best.similarity_score))}%`,
                          height: '100%',
                          backgroundColor: best.similarity_score >= 75 ? '#16A34A' : best.similarity_score >= 50 ? '#D97706' : '#DC2626',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '6px' }}>
                      Against {best.standard_description}
                    </div>
                  </div>
                ) : (
                  <div className="card empty-state" style={{ padding: '20px' }}>
                    <AlertCircle size={22} className="empty-state-icon" />
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0F172A' }}>No Matching Standards Found</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                      The AI found no National standard above the minimum similarity threshold.
                    </div>
                  </div>
                )}

                {/* Top Matching Materials */}
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '10px' }}>
                    Top Matching Materials ({matches.length})
                  </h4>
                  {matches.length > 0 ? (
                    <div className="table-container">
                      <table className="enterprise-table">
                        <thead>
                          <tr>
                            <th>National Code</th>
                            <th>Standardized Description</th>
                            <th>Category</th>
                            <th>Unit</th>
                            <th>Match Type</th>
                            <th>Similarity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matches.map((match, idx) => (
                            <tr key={idx}>
                              <td>
                                <div style={{ fontWeight: 700, color: '#1D4ED8', fontSize: '12px' }}>{match.national_code}</div>
                              </td>
                              <td style={{ fontSize: '11px', maxWidth: '220px' }}>{match.standard_description}</td>
                              <td><Badge variant="neutral">{match.category}</Badge></td>
                              <td style={{ fontSize: '12px', fontWeight: 600 }}>{match.unit || 'NOS'}</td>
                              <td>
                                <Badge variant={match.is_category_match ? 'success' : 'warning'}>
                                  {match.is_category_match ? 'Same Category' : 'Cross-Category'}
                                </Badge>
                              </td>
                              <td>
                                <Badge variant={match.similarity_score >= 75 ? 'success' : match.similarity_score >= 50 ? 'warning' : 'danger'}>
                                  {match.similarity_score.toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="card empty-state" style={{ padding: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        No candidate matches returned by the AI matcher.
                      </div>
                    </div>
                  )}
                </div>

                {/* Human Review & Approval */}
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      Human Review & Approval
                    </div>
                    <Badge variant={MATCH_STATUS_VARIANTS[matchResult.match_status] || 'neutral'}>
                      {matchResult.match_status || 'Unmapped'}
                    </Badge>
                  </div>

                  {matchResult.mapping_id ? (
                    <>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px', display: 'block' }}>
                        Review Comment (optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Add custodian notes for this AI recommendation..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        disabled={isReviewSubmitting}
                      />

                      {reviewError && (
                        <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '8px' }}>
                          {reviewError}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReviewAction(matchingMaterial.id, matchResult.mapping_id, 'Rejected')}
                          disabled={isReviewSubmitting}
                        >
                          <XCircle size={13} /> {isReviewSubmitting ? 'Submitting...' : 'Reject Match'}
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReviewAction(matchingMaterial.id, matchResult.mapping_id, 'Approved')}
                          disabled={isReviewSubmitting}
                        >
                          <CheckCircle2 size={13} /> {isReviewSubmitting ? 'Submitting...' : 'Approve Match'}
                        </button>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
                        Original material &amp; CPSE code are preserved. Approval confirms the mapping and is recorded in the audit log.
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      No mapping is pending review for this material yet — run matching again to generate one.
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : null}
      </Drawer>
    </div>
  );
};

export default MaterialSearchPage;
