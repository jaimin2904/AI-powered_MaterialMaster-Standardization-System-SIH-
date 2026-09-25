import React, { useMemo, useState } from 'react';
import {
  GitCompare,
  Sparkles,
  CheckCircle2,
  X,
  Plus,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Package,
  IndianRupee,
  MapPin,
  Layers3,
  ChevronRight
} from 'lucide-react';

import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';

const COLORS = {
  green: '#078A58',
  greenDark: '#056B46',
  greenSoft: '#ECFDF5',
  greenBorder: '#A7F3D0',
  text: '#17211B',
  textSoft: '#667085',
  border: '#E5E7EB',
  borderSoft: '#EEF0F2',
  canvas: '#F7F9F8',
  white: '#FFFFFF',
  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',
  amber: '#B45309',
  amberSoft: '#FFFBEB',
  red: '#DC2626',
  redSoft: '#FEF2F2'
};

const cardStyle = {
  background: COLORS.white,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
};

const buttonBase = {
  height: '38px',
  padding: '0 14px',
  borderRadius: '10px',
  border: `1px solid ${COLORS.border}`,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const PrimaryButton = ({ children, onClick, disabled = false, icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...buttonBase,
      background: disabled ? '#D1D5DB' : COLORS.green,
      color: COLORS.white,
      borderColor: disabled ? '#D1D5DB' : COLORS.green,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}
  >
    {icon}
    {children}
  </button>
);

const SecondaryButton = ({ children, onClick, icon }) => (
  <button
    onClick={onClick}
    style={{
      ...buttonBase,
      background: COLORS.white,
      color: COLORS.text,
      borderColor: COLORS.border
    }}
  >
    {icon}
    {children}
  </button>
);

const StatCard = ({ icon, label, value, tone = 'green' }) => {
  const tones = {
    green: {
      bg: COLORS.greenSoft,
      color: COLORS.green
    },
    blue: {
      bg: COLORS.blueSoft,
      color: COLORS.blue
    },
    purple: {
      bg: COLORS.purpleSoft,
      color: COLORS.purple
    },
    amber: {
      bg: COLORS.amberSoft,
      color: COLORS.amber
    }
  };

  const selected = tones[tone] || tones.green;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: selected.bg,
          color: selected.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '10px',
            color: COLORS.textSoft,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: '3px',
            fontSize: '16px',
            fontWeight: 800,
            color: COLORS.text
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

const MaterialHeader = ({ item, onRemove }) => (
  <div
    style={{
      padding: '16px',
      background: COLORS.white,
      borderLeft: `1px solid ${COLORS.borderSoft}`,
      minWidth: '240px'
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: COLORS.green,
          fontSize: '11px',
          fontWeight: 800
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: COLORS.green
          }}
        />
        {item.cpseName}
      </span>

      <button
        onClick={() => onRemove(item.localCode)}
        title="Remove from comparison"
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          border: `1px solid ${COLORS.border}`,
          background: COLORS.white,
          color: COLORS.textSoft,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        <X size={14} />
      </button>
    </div>

    <div
      style={{
        marginTop: '10px',
        fontSize: '15px',
        fontWeight: 800,
        color: COLORS.text
      }}
    >
      {item.localCode}
    </div>

    <div
      style={{
        marginTop: '5px',
        fontSize: '11px',
        lineHeight: 1.5,
        color: COLORS.textSoft
      }}
    >
      {item.standardDescription || item.rawDescription}
    </div>
  </div>
);

export const MaterialComparisonPage = ({
  comparisonItems,
  setComparisonItems,
  setActiveTab,
  showToast
}) => {
  const [isUnifyModalOpen, setIsUnifyModalOpen] = useState(false);

  const displayItems = comparisonItems || [];

  const handleRemoveItem = (code) => {
    const updated = displayItems.filter((item) => item.localCode !== code);
    setComparisonItems(updated);
    showToast(`Removed item ${code} from comparison`, 'info');
  };

  const handleConfirmUnify = () => {
    setIsUnifyModalOpen(false);

    showToast(
      `Successfully harmonized ${displayItems.length} CPSE items under Unified Master NUMC-401015-0089!`,
      'success'
    );
  };

  const allSpecKeys = useMemo(
    () =>
      Array.from(
        new Set(
          displayItems.flatMap((item) =>
            Object.keys(item.specifications || {})
          )
        )
      ),
    [displayItems]
  );

  const lowestCost = useMemo(() => {
    if (!displayItems.length) return null;
    return Math.min(...displayItems.map((item) => Number(item.unitCost) || 0));
  }, [displayItems]);

  const mismatchCount = useMemo(() => {
    return allSpecKeys.filter((key) => {
      const values = displayItems.map(
        (item) => item.specifications?.[key] || '-'
      );

      return !values.every((value) => value === values[0]);
    }).length;
  }, [allSpecKeys, displayItems]);

  const totalStock = useMemo(() => {
    return displayItems.reduce(
      (sum, item) => sum + (Number(item.stockQty) || 0),
      0
    );
  }, [displayItems]);

  return (
    <div
      style={{
        minHeight: '100%',
        background: COLORS.canvas,
        padding: '2px'
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '18px'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GitCompare size={19} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: COLORS.text
                }}
              >
                Material Comparison
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  fontSize: '12px',
                  color: COLORS.textSoft
                }}
              >
                Compare technical specifications, pricing and inventory
                across CPSE catalogs.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <SecondaryButton
            onClick={() => setActiveTab('search')}
            icon={<Plus size={15} />}
          >
            Add More Items
          </SecondaryButton>

          <PrimaryButton
            onClick={() => setIsUnifyModalOpen(true)}
            disabled={displayItems.length === 0}
            icon={<Sparkles size={15} />}
          >
            Consolidate & Unify
            {displayItems.length > 0 && ` (${displayItems.length})`}
          </PrimaryButton>
        </div>
      </div>

      {/* Empty State */}
      {displayItems.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            minHeight: '430px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <div style={{ maxWidth: '460px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px'
              }}
            >
              <GitCompare size={32} />
            </div>

            <div
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              No Materials Selected
            </div>

            <div
              style={{
                marginTop: '7px',
                fontSize: '12px',
                lineHeight: 1.6,
                color: COLORS.textSoft
              }}
            >
              Select materials from the enterprise catalog and add them here
              to compare technical specifications side-by-side.
            </div>

            <div
              style={{
                marginTop: '18px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <PrimaryButton
                onClick={() => setActiveTab('search')}
                icon={<Plus size={15} />}
              >
                Search Materials
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '14px'
            }}
          >
            <StatCard
              icon={<Layers3 size={17} />}
              label="Materials"
              value={displayItems.length}
              tone="green"
            />

            <StatCard
              icon={<Package size={17} />}
              label="Combined Stock"
              value={totalStock.toLocaleString('en-IN')}
              tone="blue"
            />

            <StatCard
              icon={<IndianRupee size={17} />}
              label="Lowest Unit Cost"
              value={`₹${lowestCost?.toLocaleString('en-IN') || '0'}`}
              tone="green"
            />

            <StatCard
              icon={<AlertTriangle size={17} />}
              label="Specification Mismatches"
              value={mismatchCount}
              tone={mismatchCount > 0 ? 'amber' : 'green'}
            />
          </div>

          {/* AI Recommendation */}
          <div
            style={{
              ...cardStyle,
              padding: '16px 18px',
              marginBottom: '14px',
              background:
                'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 70%)',
              borderColor: '#DDD6FE'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '11px',
                    background: COLORS.purpleSoft,
                    color: COLORS.purple,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Sparkles size={18} />
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#4C1D95'
                      }}
                    >
                      AI Harmonization Verdict
                    </span>

                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '999px',
                        background: '#EDE9FE',
                        color: COLORS.purple,
                        fontSize: '10px',
                        fontWeight: 800
                      }}
                    >
                      96.5% CONFIDENCE
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '11px',
                      lineHeight: 1.55,
                      color: '#6D5AA8',
                      maxWidth: '850px'
                    }}
                  >
                    The selected materials across{' '}
                    <strong>
                      {displayItems.map((item) => item.cpseName).join(', ')}
                    </strong>{' '}
                    match API 600 / ASME Class 150 Gate Valve standards.
                    Unifying these items enables cross-CPSE spare-parts
                    sharing and an estimated{' '}
                    <strong style={{ color: COLORS.green }}>
                      ₹12.4 Lakhs
                    </strong>{' '}
                    inventory holding reduction.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsUnifyModalOpen(true)}
                style={{
                  ...buttonBase,
                  background: COLORS.purple,
                  borderColor: COLORS.purple,
                  color: COLORS.white,
                  flexShrink: 0
                }}
              >
                <Sparkles size={14} />
                Execute Unification
              </button>
            </div>
          </div>

          {/* Comparison Matrix */}
          <div
            style={{
              ...cardStyle,
              overflow: 'hidden'
            }}
          >
            {/* Matrix Header */}
            <div
              style={{
                padding: '15px 18px',
                borderBottom: `1px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck size={16} color={COLORS.green} />

                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      color: COLORS.text
                    }}
                  >
                    Technical Comparison Matrix
                  </span>
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '10px',
                    color: COLORS.textSoft
                  }}
                >
                  Matching values are consistent across materials. Amber
                  highlights indicate specification differences.
                </div>
              </div>

              <Badge variant="info">
                {displayItems.length} CPSE {displayItems.length === 1 ? 'Item' : 'Items'}
              </Badge>
            </div>

            <div
              style={{
                overflowX: 'auto',
                width: '100%'
              }}
            >
              <table
                style={{
                  width: '100%',
                  minWidth: Math.max(
                    850,
                    270 + displayItems.length * 260
                  ),
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  fontSize: '12px'
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        width: '250px',
                        minWidth: '250px',
                        padding: '16px',
                        textAlign: 'left',
                        verticalAlign: 'top',
                        background: '#F8FAFC',
                        borderBottom: `1px solid ${COLORS.border}`,
                        color: COLORS.textSoft,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Attribute / Specification
                    </th>

                    {displayItems.map((item, index) => (
                      <th
                        key={index}
                        style={{
                          width: `${78 / displayItems.length}%`,
                          minWidth: '250px',
                          padding: 0,
                          textAlign: 'left',
                          verticalAlign: 'top',
                          background: COLORS.white,
                          borderBottom: `1px solid ${COLORS.border}`
                        }}
                      >
                        <MaterialHeader
                          item={item}
                          onRemove={handleRemoveItem}
                        />
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {/* NUMC */}
                  <tr>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        padding: '13px 16px',
                        background: '#F8FAFC',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        fontWeight: 700,
                        color: COLORS.textSoft
                      }}
                    >
                      NUMC Unified Code
                    </td>

                    {displayItems.map((item, index) => (
                      <td
                        key={index}
                        style={{
                          padding: '13px 16px',
                          borderLeft: `1px solid ${COLORS.borderSoft}`,
                          borderBottom: `1px solid ${COLORS.borderSoft}`
                        }}
                      >
                        <span
                          style={{
                            display: 'inline-flex',
                            padding: '5px 8px',
                            borderRadius: '7px',
                            background: '#F1F5F9',
                            color: '#475569',
                            fontSize: '10px',
                            fontWeight: 800,
                            fontFamily: 'monospace'
                          }}
                        >
                          {item.numcCode}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Raw Description */}
                  <tr>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        padding: '13px 16px',
                        background: '#F8FAFC',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        fontWeight: 700,
                        color: COLORS.textSoft
                      }}
                    >
                      Raw CPSE Description
                    </td>

                    {displayItems.map((item, index) => (
                      <td
                        key={index}
                        style={{
                          padding: '13px 16px',
                          borderLeft: `1px solid ${COLORS.borderSoft}`,
                          borderBottom: `1px solid ${COLORS.borderSoft}`,
                          color: '#475467',
                          lineHeight: 1.5
                        }}
                      >
                        “{item.rawDescription}”
                      </td>
                    ))}
                  </tr>

                  {/* Standardized Name */}
                  <tr>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        padding: '13px 16px',
                        background: '#F8FAFC',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        fontWeight: 700,
                        color: COLORS.textSoft
                      }}
                    >
                      AI Standardized Name
                    </td>

                    {displayItems.map((item, index) => (
                      <td
                        key={index}
                        style={{
                          padding: '13px 16px',
                          borderLeft: `1px solid ${COLORS.borderSoft}`,
                          borderBottom: `1px solid ${COLORS.borderSoft}`,
                          color: COLORS.text,
                          fontWeight: 700,
                          lineHeight: 1.5
                        }}
                      >
                        {item.standardDescription}
                      </td>
                    ))}
                  </tr>

                  {/* Unit Cost */}
                  <tr>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        padding: '13px 16px',
                        background: '#F8FAFC',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        fontWeight: 700,
                        color: COLORS.textSoft
                      }}
                    >
                      Unit Procurement Cost
                    </td>

                    {displayItems.map((item, index) => {
                      const isLowest =
                        Number(item.unitCost) === lowestCost;

                      return (
                        <td
                          key={index}
                          style={{
                            padding: '13px 16px',
                            borderLeft: `1px solid ${COLORS.borderSoft}`,
                            borderBottom: `1px solid ${COLORS.borderSoft}`,
                            background: isLowest
                              ? COLORS.greenSoft
                              : COLORS.white
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                              color: isLowest
                                ? COLORS.greenDark
                                : COLORS.text,
                              fontSize: '15px',
                              fontWeight: 800
                            }}
                          >
                            <IndianRupee size={13} />
                            {Number(item.unitCost || 0).toLocaleString(
                              'en-IN'
                            )}
                          </div>

                          {isLowest && (
                            <div
                              style={{
                                marginTop: '3px',
                                fontSize: '9px',
                                color: COLORS.green,
                                fontWeight: 800
                              }}
                            >
                              LOWEST BENCHMARK
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Stock */}
                  <tr>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        padding: '13px 16px',
                        background: '#F8FAFC',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        fontWeight: 700,
                        color: COLORS.textSoft
                      }}
                    >
                      Plant Stock Qty
                    </td>

                    {displayItems.map((item, index) => (
                      <td
                        key={index}
                        style={{
                          padding: '13px 16px',
                          borderLeft: `1px solid ${COLORS.borderSoft}`,
                          borderBottom: `1px solid ${COLORS.borderSoft}`
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 800,
                            color: COLORS.text
                          }}
                        >
                          <Package size={14} color={COLORS.green} />
                          {item.stockQty} {item.unit}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px',
                            fontSize: '10px',
                            color: COLORS.textSoft
                          }}
                        >
                          <MapPin size={10} />
                          {item.plantLocation}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Specifications */}
                  {allSpecKeys.map((specKey) => {
                    const values = displayItems.map(
                      (item) => item.specifications?.[specKey] || '-'
                    );

                    const allMatch = values.every(
                      (value) => value === values[0]
                    );

                    return (
                      <tr key={specKey}>
                        <td
                          style={{
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            padding: '13px 16px',
                            background: '#F8FAFC',
                            borderBottom: `1px solid ${COLORS.borderSoft}`,
                            fontWeight: 700,
                            color: COLORS.textSoft
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px'
                            }}
                          >
                            {!allMatch && (
                              <span
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#F59E0B'
                                }}
                              />
                            )}

                            {specKey}
                          </div>
                        </td>

                        {displayItems.map((item, index) => {
                          const value =
                            item.specifications?.[specKey] || 'N/A';

                          return (
                            <td
                              key={index}
                              style={{
                                padding: '13px 16px',
                                borderLeft: `1px solid ${COLORS.borderSoft}`,
                                borderBottom: `1px solid ${COLORS.borderSoft}`,
                                background: !allMatch
                                  ? COLORS.amberSoft
                                  : COLORS.white,
                                color: COLORS.text,
                                fontWeight: 700,
                                lineHeight: 1.5
                              }}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Status */}
                  <tr>
                    <td
                      style={{
                        position: 'sticky',
                        left: 0,
                        zIndex: 2,
                        padding: '13px 16px',
                        background: '#F8FAFC',
                        fontWeight: 700,
                        color: COLORS.textSoft
                      }}
                    >
                      Harmonization Status
                    </td>

                    {displayItems.map((item, index) => (
                      <td
                        key={index}
                        style={{
                          padding: '13px 16px',
                          borderLeft: `1px solid ${COLORS.borderSoft}`
                        }}
                      >
                        <Badge
                          variant={
                            item.status === 'Harmonized'
                              ? 'success'
                              : 'danger'
                          }
                        >
                          {item.status}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div
            style={{
              ...cardStyle,
              marginTop: '14px',
              padding: '13px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '11px',
                color: COLORS.textSoft
              }}
            >
              <ShieldCheck size={15} color={COLORS.green} />
              <span>
                AI-assisted comparison based on technical attributes,
                pricing and catalog metadata.
              </span>
            </div>

            <button
              onClick={() => setIsUnifyModalOpen(true)}
              style={{
                ...buttonBase,
                height: '34px',
                background: COLORS.greenSoft,
                borderColor: COLORS.greenBorder,
                color: COLORS.greenDark
              }}
            >
              Review Unification
              <ArrowRight size={14} />
            </button>
          </div>
        </>
      )}

      {/* Unification Modal */}
      {displayItems.length > 0 && (
        <Modal
          isOpen={isUnifyModalOpen}
          onClose={() => setIsUnifyModalOpen(false)}
          title="Confirm CPSE Master Code Harmonization"
          subtitle="Unify selected local material codes under National Master NUMC-401015-0089"
          maxWidth="620px"
          footer={
            <>
              <SecondaryButton
                onClick={() => setIsUnifyModalOpen(false)}
              >
                Cancel
              </SecondaryButton>

              <PrimaryButton
                onClick={handleConfirmUnify}
                icon={<CheckCircle2 size={15} />}
              >
                Confirm & Publish
              </PrimaryButton>
            </>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Target Master */}
            <div
              style={{
                padding: '15px',
                borderRadius: '12px',
                background: COLORS.greenSoft,
                border: `1px solid ${COLORS.greenBorder}`
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: COLORS.greenDark,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Target National Unified Code
              </div>

              <div
                style={{
                  marginTop: '5px',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  fontWeight: 800,
                  color: COLORS.text
                }}
              >
                NUMC-401015-0089
              </div>

              <div
                style={{
                  marginTop: '3px',
                  fontSize: '11px',
                  lineHeight: 1.5,
                  color: COLORS.textSoft
                }}
              >
                Gate Valve, Flanged Ends, 2 inch (50mm NB), Class 150,
                WCB Body, SS316 Trim
              </div>
            </div>

            {/* Selected Materials */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 800,
                    color: COLORS.text
                  }}
                >
                  CPSE Local Materials
                </div>

                <Badge variant="info">
                  {displayItems.length} selected
                </Badge>
              </div>

              <div
                style={{
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                {displayItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '11px 13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      borderBottom:
                        index < displayItems.length - 1
                          ? `1px solid ${COLORS.borderSoft}`
                          : 'none'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: COLORS.text
                        }}
                      >
                        {item.cpseName}
                      </div>

                      <div
                        style={{
                          marginTop: '2px',
                          fontSize: '10px',
                          color: COLORS.textSoft
                        }}
                      >
                        {item.localCode}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '10px',
                        color: COLORS.textSoft,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.stockQty} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '10px'
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: '11px',
                  background: '#F8FAFC',
                  border: `1px solid ${COLORS.borderSoft}`
                }}
              >
                <div
                  style={{
                    fontSize: '9px',
                    color: COLORS.textSoft,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  Materials Unified
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: COLORS.text
                  }}
                >
                  {displayItems.length}
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '11px',
                  background: COLORS.greenSoft,
                  border: `1px solid ${COLORS.greenBorder}`
                }}
              >
                <div
                  style={{
                    fontSize: '9px',
                    color: COLORS.greenDark,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  Estimated Savings
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '17px',
                    fontWeight: 800,
                    color: COLORS.greenDark
                  }}
                >
                  ₹12.4L
                </div>
              </div>
            </div>

            {/* Warning */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '9px',
                padding: '11px 12px',
                borderRadius: '10px',
                background: COLORS.amberSoft,
                border: '1px solid #FDE68A',
                color: COLORS.amber,
                fontSize: '10px',
                lineHeight: 1.5
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />

              <span>
                Publishing this unification will link the selected CPSE
                local codes to the national master material record.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MaterialComparisonPage;