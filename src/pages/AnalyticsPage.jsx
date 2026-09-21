import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Download, Building2, Filter, PieChart, Shield, CheckCircle2 } from 'lucide-react';
import Badge from '../components/common/Badge';

export const AnalyticsPage = ({ showToast }) => {
  const [selectedMinistry, setSelectedMinistry] = useState('ALL');

  const priceVarianceData = [
    { numc: 'NUMC-401015-0089', name: 'Gate Valve 2 Inch Class 150 WCB', cpseLow: 'NTPC (₹14,850)', cpseHigh: 'ONGC (₹21,000)', variance: '41.4%', potentialSavings: '₹1.24 Cr' },
    { numc: 'NUMC-311715-0142', name: '3-Phase Motor 75kW 4P 415V IE3', cpseLow: 'BHEL (₹2,45,000)', cpseHigh: 'ONGC (₹2,89,000)', variance: '17.9%', potentialSavings: '₹3.20 Cr' },
    { numc: 'NUMC-311715-0899', name: 'Deep Groove Ball Bearing 6205-2RS', cpseLow: 'NTPC (₹420)', cpseHigh: 'CIL (₹495)', variance: '17.8%', potentialSavings: '₹21.0 Lakhs' },
    { numc: 'NUMC-261216-0410', name: 'XLPE Cable 3.3kV 3C x 240 sqmm', cpseLow: 'GAIL (₹1,850/m)', cpseHigh: 'IOCL (₹2,240/m)', variance: '21.0%', potentialSavings: '₹84.0 Lakhs' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A' }}>National Material Harmonization Analytics</h2>
          <p style={{ fontSize: '12px', color: '#64748B' }}>
            Enterprise procurement price divergence, inventory overlap, and capital savings reports across Central Ministries.
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => showToast('Generating National Material Analytics PDF Report...', 'info')}>
          <Download size={14} /> Download Analytics PDF Report
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid-4">
        <div className="stat-card" style={{ borderTop: '3px solid #2563EB' }}>
          <div className="stat-label">Total Material Overlap</div>
          <div className="stat-value">34.2%</div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Items identical across 2+ CPSEs</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #16A34A' }}>
          <div className="stat-label">Avg Price Variance</div>
          <div className="stat-value">24.5%</div>
          <div style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600, marginTop: '4px' }}>Divergence in identical specs</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #D97706' }}>
          <div className="stat-label">Bulk Rate Savings Potential</div>
          <div className="stat-value">₹1,420.5 Cr</div>
          <div style={{ fontSize: '12px', color: '#D97706', marginTop: '4px' }}>Aggregated DPE Rate Contracts</div>
        </div>

        <div className="stat-card" style={{ borderTop: '3px solid #4F46E5' }}>
          <div className="stat-label">National Catalog Index</div>
          <div className="stat-value">94.8 / 100</div>
          <div style={{ fontSize: '12px', color: '#4F46E5', fontWeight: 600, marginTop: '4px' }}>Quality & Harmonization Rating</div>
        </div>
      </div>

      {/* Price Divergence Heatmap Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title"><TrendingUp size={18} className="text-blue-600" /> Cross-CPSE Procurement Price Divergence Alert</div>
            <div className="card-subtitle">Identical NUMC items purchased at different unit costs across public sector enterprises</div>
          </div>
          <Badge variant="warning">Action Required by Procurement Nodal Officers</Badge>
        </div>

        <div className="table-container">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>NUMC Code</th>
                <th>Standard Material Item</th>
                <th>Lowest Benchmark Price</th>
                <th>Highest Paid Price</th>
                <th>Price Divergence (%)</th>
                <th>Est. Annual Savings</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {priceVarianceData.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="code-tag">{item.numc}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#0F172A', fontSize: '12px' }}>{item.name}</td>
                  <td style={{ fontWeight: 700, color: '#16A34A', fontSize: '12px' }}>{item.cpseLow}</td>
                  <td style={{ fontWeight: 700, color: '#DC2626', fontSize: '12px' }}>{item.cpseHigh}</td>
                  <td>
                    <Badge variant="danger">{item.variance}</Badge>
                  </td>
                  <td style={{ fontWeight: 700, color: '#0F172A' }}>{item.potentialSavings}</td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => showToast(`Initiated Price Standardization inquiry for ${item.numc}`, 'info')}
                    >
                      Align Rate Contract
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Category Distribution & Financial Savings Breakdown */}
      <div className="grid-2">
        {/* Material Category Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><PieChart size={18} /> Catalog Distribution by UNSPSC Class</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { category: 'Mechanical Spares & Valves', count: '842,000 items', share: '33.8%', color: '#2563EB' },
              { category: 'Electrical Motors & Cables', count: '620,000 items', share: '24.9%', color: '#3B82F6' },
              { category: 'Piping, Fittings & Tubes', count: '410,000 items', share: '16.5%', color: '#60A5FA' },
              { category: 'Instrumentation & Sensors', count: '320,000 items', share: '12.8%', color: '#93C5FD' },
              { category: 'Chemicals, Greases & Oils', count: '293,210 items', share: '12.0%', color: '#BFDBFE' },
            ].map((cat, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{cat.category}</span>
                  <span style={{ color: '#64748B' }}>{cat.count} ({cat.share})</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: cat.share, height: '100%', backgroundColor: cat.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estimated Savings Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title"><DollarSign size={18} className="text-green-600" /> Capital Savings Estimation Breakdown</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>Inter-CPSE Stock Sharing & Borrowing</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803D', marginTop: '2px' }}>₹640.20 Crores</div>
              <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '2px' }}>Avoided emergency OEM procurement during plant outages</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF' }}>Aggregated National Rate Contracts</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1D4ED8', marginTop: '2px' }}>₹485.30 Crores</div>
              <div style={{ fontSize: '11px', color: '#2563EB', marginTop: '2px' }}>Bulk purchasing volume discount across DPE PSUs</div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400E' }}>Elimination of Dead / Obsolete Stock</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#B45309', marginTop: '2px' }}>₹295.00 Crores</div>
              <div style={{ fontSize: '11px', color: '#D97706', marginTop: '2px' }}>Depreciation reduction by re-allocating inactive items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
