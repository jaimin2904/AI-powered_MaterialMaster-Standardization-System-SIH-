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
  AlertCircle
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Drawer from '../components/common/Drawer';
import { MATERIALS_DATA, CPSE_LIST } from '../data/mockData';
import { getMaterials } from '../services/api';

export const MaterialSearchPage = ({ selectedCpse, setSelectedCpse, comparisonItems, setComparisonItems, setActiveTab, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAiSemantic, setIsAiSemantic] = useState(true);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [isLoading, setIsLoading] = useState(false);
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [materials, setMaterials] = useState(MATERIALS_DATA);

  // Fetch materials from API whenever filters change
  useEffect(() => {
    setIsLoading(true);
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
        } else if (!searchTerm && selectedCategory === 'ALL' && selectedCpse === 'all') {
          setMaterials(MATERIALS_DATA);
        } else {
          setMaterials([]);
        }
      })
      .catch(() => {
        // Fallback to local mock data filtering on network error
        setMaterials(MATERIALS_DATA);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCpse, searchTerm, selectedCategory, selectedStatus]);

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
    </div>
  );
};

export default MaterialSearchPage;
