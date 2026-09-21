import React, { useState } from 'react';
import { GitCompare, Sparkles, AlertTriangle, CheckCircle2, X, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { MATERIALS_DATA } from '../data/mockData';

export const MaterialComparisonPage = ({ comparisonItems, setComparisonItems, setActiveTab, showToast }) => {
  const [isUnifyModalOpen, setIsUnifyModalOpen] = useState(false);

  // If no items in comparison, default to first 3 items from mock data for instant preview
  const displayItems = comparisonItems.length > 0 ? comparisonItems : MATERIALS_DATA.slice(0, 3);

  const handleRemoveItem = (code) => {
    const updated = displayItems.filter((i) => i.localCode !== code);
    setComparisonItems(updated);
    showToast(`Removed item ${code} from comparison`, 'info');
  };

  const handleConfirmUnify = () => {
    setIsUnifyModalOpen(false);
    showToast(`Successfully harmonized ${displayItems.length} CPSE items under Unified Master NUMC-401015-0089!`, 'success');
  };

  // Collect all unique spec keys across compared items
  const allSpecKeys = Array.from(
    new Set(displayItems.flatMap((item) => Object.keys(item.specifications || {})))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>Side-by-Side Technical Material Comparison</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Compare technical specifications, unit prices, and OEM details across CPSE catalogs to establish equivalence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('search')}>
            <Plus size={14} /> Add More Items
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setIsUnifyModalOpen(true)}>
            <Sparkles size={14} /> Consolidate & Unify ({displayItems.length})
          </button>
        </div>
      </div>

      {/* AI Harmonization Recommendation Banner */}
      <div className="card" style={{
        backgroundColor: '#EEF2FF',
        borderColor: '#C7D2FE',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#4338CA',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#312E81' }}>
              AI Harmonization Verdict: High Technical Equivalency (96.5% Confidence)
            </div>
            <div style={{ fontSize: '12px', color: '#4338CA', marginTop: '2px' }}>
              The selected materials across {displayItems.map((i) => i.cpseName).join(', ')} match API 600 / ASME Class 150 Gate Valve standards.
              Unifying these items enables cross-CPSE spare parts sharing & <strong>₹12.4 Lakhs</strong> inventory holding reduction.
            </div>
          </div>
        </div>

        <button className="btn btn-ai" onClick={() => setIsUnifyModalOpen(true)}>
          Execute Master Unification
        </button>
      </div>

      {/* Comparison Matrix Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="enterprise-table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th style={{ width: '220px', backgroundColor: '#F8FAFC' }}>Attribute / Spec</th>
                {displayItems.map((item, idx) => (
                  <th key={idx} style={{ width: `${78 / displayItems.length}%`, backgroundColor: '#FFFFFF', borderLeft: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#1D4ED8', fontSize: '12px', fontWeight: 700 }}>{item.cpseName}</span>
                      <button
                        onClick={() => handleRemoveItem(item.localCode)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                        title="Remove from comparison"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                      {item.localCode}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Row: NUMC Code */}
              <tr>
                <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>NUMC Unified Code</td>
                {displayItems.map((item, idx) => (
                  <td key={idx} style={{ borderLeft: '1px solid var(--border-light)' }}>
                    <div className="code-tag">{item.numcCode}</div>
                  </td>
                ))}
              </tr>

              {/* Row: Raw Item Description */}
              <tr>
                <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>Raw CPSE Description</td>
                {displayItems.map((item, idx) => (
                  <td key={idx} style={{ borderLeft: '1px solid var(--border-light)', fontSize: '12px', color: '#334155' }}>
                    "{item.rawDescription}"
                  </td>
                ))}
              </tr>

              {/* Row: AI Standardized Description */}
              <tr>
                <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>AI Standardized Name</td>
                {displayItems.map((item, idx) => (
                  <td key={idx} style={{ borderLeft: '1px solid var(--border-light)', fontSize: '12px', fontWeight: 600, color: '#0F172A' }}>
                    {item.standardDescription}
                  </td>
                ))}
              </tr>

              {/* Row: Unit Procurement Cost */}
              <tr>
                <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>Unit Cost (₹)</td>
                {displayItems.map((item, idx) => {
                  const costs = displayItems.map((i) => i.unitCost);
                  const minCost = Math.min(...costs);
                  const isLowest = item.unitCost === minCost;
                  return (
                    <td key={idx} style={{
                      borderLeft: '1px solid var(--border-light)',
                      backgroundColor: isLowest ? '#F0FDF4' : 'transparent'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: isLowest ? '#15803D' : '#0F172A' }}>
                        ₹{item.unitCost.toLocaleString('en-IN')}
                      </div>
                      {isLowest && <span style={{ fontSize: '10px', color: '#16A34A', fontWeight: 600 }}>Lowest Benchmark Price</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Row: Available Stock */}
              <tr>
                <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>Plant Stock Qty</td>
                {displayItems.map((item, idx) => (
                  <td key={idx} style={{ borderLeft: '1px solid var(--border-light)', fontWeight: 600 }}>
                    {item.stockQty} {item.unit}
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>{item.plantLocation}</div>
                  </td>
                ))}
              </tr>

              {/* Dynamic Technical Specs Rows */}
              {allSpecKeys.map((specKey) => {
                // Check if values across all items match
                const vals = displayItems.map((item) => item.specifications?.[specKey] || '-');
                const allMatch = vals.every((v) => v === vals[0]);

                return (
                  <tr key={specKey}>
                    <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>{specKey}</td>
                    {displayItems.map((item, idx) => {
                      const val = item.specifications?.[specKey] || 'N/A';
                      return (
                        <td key={idx} style={{
                          borderLeft: '1px solid var(--border-light)',
                          backgroundColor: !allMatch ? '#FFFBEB' : 'transparent',
                          fontWeight: 600,
                          fontSize: '12px'
                        }}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Row: Status */}
              <tr>
                <td style={{ fontWeight: 600, color: '#475569', backgroundColor: '#F8FAFC' }}>Harmonization Status</td>
                {displayItems.map((item, idx) => (
                  <td key={idx} style={{ borderLeft: '1px solid var(--border-light)' }}>
                    <Badge variant={item.status === 'Harmonized' ? 'success' : 'danger'}>
                      {item.status}
                    </Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Unification */}
      <Modal
        isOpen={isUnifyModalOpen}
        onClose={() => setIsUnifyModalOpen(false)}
        title="Confirm CPSE Master Code Harmonization"
        subtitle="Unify selected local material codes under National Master NUMC-401015-0089"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsUnifyModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleConfirmUnify}>
              <CheckCircle2 size={15} /> Confirm & Publish Master Unification
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
            <div style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 600 }}>Target National Unified Code</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
              NUMC-401015-0089: Gate Valve, Flanged Ends, 2 inch (50mm NB), Class 150, WCB Body, SS316 Trim
            </div>
          </div>

          <div style={{ fontSize: '13px', color: '#334155' }}>
            The following CPSE local codes will be linked and harmonized:
          </div>

          <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#0F172A', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {displayItems.map((item, i) => (
              <li key={i}>
                <strong>{item.cpseName}:</strong> {item.localCode} (Stock Qty: {item.stockQty} {item.unit})
              </li>
            ))}
          </ul>

          <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', fontSize: '12px', color: '#15803D' }}>
            <strong>Financial Impact:</strong> Est. ₹12,40,000 cost savings from inter-CPSE stock sharing & standardized API 600 bulk rate contract.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MaterialComparisonPage;
