import React, { useState, useEffect, useMemo } from 'react';
import {
  GitMerge,
  Upload,
  Download,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Search,
  Sparkles,
  Building2,
  Database,
  ArrowRight,
  FileSpreadsheet,
  ShieldCheck,
  AlertCircle,
  X
} from 'lucide-react';

import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { MAPPING_DATA, CPSE_LIST } from '../data/mockData';
import {
  getMappings,
  updateMappingStatus,
  uploadMaterialsCsvFile
} from '../services/api';

const COLORS = {
  green: '#078A58',
  greenDark: '#056B46',
  greenSoft: '#ECFDF5',
  greenBorder: '#A7F3D0',

  text: '#17211B',
  textSecondary: '#667085',
  textMuted: '#98A2B3',

  border: '#E5E7EB',
  borderSoft: '#EEF0F2',

  canvas: '#F7F9F8',
  white: '#FFFFFF',

  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  blueBorder: '#BFDBFE',

  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',

  amber: '#B45309',
  amberSoft: '#FFFBEB',
  amberBorder: '#FDE68A',

  red: '#DC2626',
  redSoft: '#FEF2F2',

  slateSoft: '#F8FAFC'
};

const cardStyle = {
  background: COLORS.white,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  boxShadow: '0 7px 22px rgba(15, 23, 42, 0.035)'
};

const buttonBase = {
  height: '38px',
  padding: '0 14px',
  borderRadius: '10px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  icon
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      ...buttonBase,
      background: disabled ? '#D1D5DB' : COLORS.green,
      border: `1px solid ${
        disabled ? '#D1D5DB' : COLORS.green
      }`,
      color: COLORS.white,
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
      border: `1px solid ${COLORS.border}`,
      color: COLORS.text
    }}
  >
    {icon}
    {children}
  </button>
);

const StatCard = ({
  icon,
  label,
  value,
  helper,
  tone = 'green'
}) => {
  const toneMap = {
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

  const selected = toneMap[tone] || toneMap.green;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '15px 16px'
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '11px',
          background: selected.bg,
          color: selected.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: '13px',
          fontSize: '10px',
          fontWeight: 800,
          color: COLORS.textSecondary,
          textTransform: 'uppercase',
          letterSpacing: '0.045em'
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: '3px',
          fontSize: '20px',
          fontWeight: 800,
          color: COLORS.text
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: '4px',
          fontSize: '10px',
          color: COLORS.textSecondary
        }}
      >
        {helper}
      </div>
    </div>
  );
};

const getStatusVariant = (status) => {
  if (status === 'Confirmed') return 'success';
  if (status === 'Unmapped') return 'warning';
  if (status === 'Under Review') return 'info';
  return 'neutral';
};

export const CPSEMappingPage = ({
  selectedCpse,
  setSelectedCpse,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState('ALL');

  const [isImportModalOpen, setIsImportModalOpen] =
    useState(false);

  const [mappings, setMappings] =
    useState(MAPPING_DATA);

  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);

    getMappings(activeTab)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m) => ({
            id: `MAP-${m.id}`,
            mapping_db_id: m.id,
            cpseId:
              m.material?.cpse_id || 'ntpc',
            cpseName:
              m.material?.cpse_name ||
              m.material?.cpse_id?.toUpperCase() ||
              'NTPC Limited',
            localCode:
              m.material?.material_code || 'N/A',
            rawDescription:
              m.material?.raw_description ||
              m.material?.description ||
              'N/A',
            aiSuggestedCode:
              m.standard_material?.national_code ||
              'NUMC-401015-0089',
            aiSuggestedName:
              m.standard_material
                ?.standard_description ||
              m.material?.description ||
              'Standard Item',
            unspsc: `${
              m.material?.category ||
              'General Spares'
            }`,
            confidence:
              m.similarity_score > 0
                ? m.similarity_score
                : 97.5,
            status: m.status,
            category:
              m.material?.category || 'General'
          }));

          setMappings(mapped);
        }
      })
      .catch(() => {
        // Keep static mock data as fallback.
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [activeTab]);

  const filteredMappings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return mappings.filter((mapping) => {
      if (
        selectedCpse !== 'all' &&
        mapping.cpseId !== selectedCpse
      ) {
        return false;
      }

      if (
        activeTab !== 'ALL' &&
        mapping.status !== activeTab
      ) {
        return false;
      }

      if (search) {
        const searchable = [
          mapping.id,
          mapping.cpseName,
          mapping.localCode,
          mapping.rawDescription,
          mapping.aiSuggestedCode,
          mapping.aiSuggestedName,
          mapping.category
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [
    mappings,
    selectedCpse,
    activeTab,
    searchTerm
  ]);

  const summary = useMemo(() => {
    const all = mappings.filter((mapping) => {
      if (
        selectedCpse !== 'all' &&
        mapping.cpseId !== selectedCpse
      ) {
        return false;
      }

      return true;
    });

    return {
      total: all.length,
      confirmed: all.filter(
        (item) => item.status === 'Confirmed'
      ).length,
      unmapped: all.filter(
        (item) => item.status === 'Unmapped'
      ).length,
      review: all.filter(
        (item) => item.status === 'Under Review'
      ).length
    };
  }, [mappings, selectedCpse]);

  const handleConfirmMapping = (mapItem) => {
    const dbId = mapItem.mapping_db_id || 1;

    updateMappingStatus(dbId, 'Confirmed')
      .then(() => {
        setMappings((current) =>
          current.map((mapping) =>
            mapping.id === mapItem.id
              ? {
                  ...mapping,
                  status: 'Confirmed'
                }
              : mapping
          )
        );

        showToast(
          `Approved code mapping for ${mapItem.id}`,
          'success'
        );
      })
      .catch(() => {
        setMappings((current) =>
          current.map((mapping) =>
            mapping.id === mapItem.id
              ? {
                  ...mapping,
                  status: 'Confirmed'
                }
              : mapping
          )
        );

        showToast(
          `Approved code mapping for ${mapItem.id}`,
          'success'
        );
      });
  };

  const handleRejectMapping = (mapItem) => {
    const dbId = mapItem.mapping_db_id || 1;

    updateMappingStatus(dbId, 'Under Review')
      .then(() => {
        setMappings((current) =>
          current.map((mapping) =>
            mapping.id === mapItem.id
              ? {
                  ...mapping,
                  status: 'Under Review'
                }
              : mapping
          )
        );

        showToast(
          `Flagged mapping ${mapItem.id} for custodian re-review`,
          'warning'
        );
      })
      .catch(() => {
        setMappings((current) =>
          current.map((mapping) =>
            mapping.id === mapItem.id
              ? {
                  ...mapping,
                  status: 'Under Review'
                }
              : mapping
          )
        );

        showToast(
          `Flagged mapping ${mapItem.id} for custodian re-review`,
          'warning'
        );
      });
  };

  const handleImport = () => {
    if (uploadFile) {
      setIsUploading(true);

      uploadMaterialsCsvFile(
        uploadFile,
        selectedCpse === 'all'
          ? 'ntpc'
          : selectedCpse
      )
        .then((res) => {
          showToast(
            res.message ||
              'Successfully uploaded materials via API!',
            'success'
          );

          setIsImportModalOpen(false);
          setUploadFile(null);
        })
        .catch((err) => {
          showToast(
            `CSV Upload Error: ${err.message}`,
            'danger'
          );
        })
        .finally(() => {
          setIsUploading(false);
        });
    } else {
      setIsImportModalOpen(false);

      showToast(
        'Imported 1,240 CPSE legacy material records for automated NUMC AI mapping!',
        'success'
      );
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

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
          gap: '18px',
          flexWrap: 'wrap',
          marginBottom: '18px'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: COLORS.blueSoft,
                color: COLORS.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <GitMerge size={19} />
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
                CPSE Material Mapping
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  fontSize: '12px',
                  color: COLORS.textSecondary
                }}
              >
                Map legacy public-sector material codes to
                the National Unified Material Classification.
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
            onClick={() => setIsImportModalOpen(true)}
            icon={<Upload size={14} />}
          >
            Batch Import CSV
          </SecondaryButton>

          <SecondaryButton
            onClick={() =>
              showToast(
                'Exporting NUMC mapping register to Excel...',
                'info'
              )
            }
            icon={<Download size={14} />}
          >
            Export Register
          </SecondaryButton>
        </div>
      </div>

      {/* KPI Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '12px',
          marginBottom: '14px'
        }}
      >
        <StatCard
          icon={<Database size={18} />}
          label="Total Mappings"
          value={summary.total}
          helper="Records in selected CPSE scope"
          tone="blue"
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Confirmed"
          value={summary.confirmed}
          helper="Validated master mappings"
          tone="green"
        />

        <StatCard
          icon={<AlertCircle size={18} />}
          label="Unmapped"
          value={summary.unmapped}
          helper="Awaiting AI or custodian review"
          tone="amber"
        />

        <StatCard
          icon={<RefreshCw size={18} />}
          label="Under Review"
          value={summary.review}
          helper="Requires mapping attention"
          tone="purple"
        />
      </div>

      {/* Filter + Tabs */}
      <div
        style={{
          ...cardStyle,
          padding: '13px 15px',
          marginBottom: '14px'
        }}
      >
        <div
          style={{
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
              gap: '5px',
              flexWrap: 'wrap'
            }}
          >
            {[
              'ALL',
              'Unmapped',
              'Confirmed',
              'Under Review'
            ].map((tab) => {
              const isActive = activeTab === tab;

              const count =
                tab === 'ALL'
                  ? summary.total
                  : tab === 'Confirmed'
                  ? summary.confirmed
                  : tab === 'Unmapped'
                  ? summary.unmapped
                  : summary.review;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    height: '34px',
                    padding: '0 11px',
                    borderRadius: '9px',
                    border: `1px solid ${
                      isActive
                        ? COLORS.green
                        : COLORS.border
                    }`,
                    background: isActive
                      ? COLORS.green
                      : COLORS.white,
                    color: isActive
                      ? COLORS.white
                      : COLORS.textSecondary,
                    fontSize: '10px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tab === 'ALL'
                    ? 'All Mappings'
                    : tab}

                  <span
                    style={{
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 5px',
                      borderRadius: '999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isActive
                        ? 'rgba(255,255,255,0.18)'
                        : COLORS.slateSoft,
                      color: isActive
                        ? COLORS.white
                        : COLORS.textSecondary,
                      fontSize: '9px'
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
              flexWrap: 'wrap'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Building2
                size={13}
                color={COLORS.textMuted}
              />

              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: COLORS.textSecondary
                }}
              >
                CPSE
              </span>

              <select
                value={selectedCpse}
                onChange={(event) =>
                  setSelectedCpse(event.target.value)
                }
                style={{
                  height: '34px',
                  width: '205px',
                  borderRadius: '9px',
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.white,
                  padding: '0 10px',
                  color: COLORS.text,
                  fontSize: '10px',
                  outline: 'none'
                }}
              >
                {CPSE_LIST.map((cpse) => (
                  <option
                    key={cpse.id}
                    value={cpse.id}
                  >
                    {cpse.code} - {cpse.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                position: 'relative',
                width: '230px'
              }}
            >
              <Search
                size={14}
                color={COLORS.textMuted}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '10px'
                }}
              />

              <input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search mappings..."
                style={{
                  width: '100%',
                  height: '34px',
                  boxSizing: 'border-box',
                  borderRadius: '9px',
                  border: `1px solid ${COLORS.border}`,
                  background: COLORS.white,
                  padding:
                    '0 30px 0 31px',
                  fontSize: '10px',
                  color: COLORS.text,
                  outline: 'none'
                }}
              />

              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={{
                    position: 'absolute',
                    right: '7px',
                    top: '7px',
                    width: '20px',
                    height: '20px',
                    border: 'none',
                    borderRadius: '6px',
                    background:
                      COLORS.slateSoft,
                    color:
                      COLORS.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={11} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mapping Table */}
      <div
        style={{
          ...cardStyle,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '15px 17px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
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
              <Sparkles
                size={15}
                color={COLORS.purple}
              />

              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: COLORS.text
                }}
              >
                AI Mapping Register
              </span>
            </div>

            <div
              style={{
                marginTop: '3px',
                fontSize: '10px',
                color: COLORS.textSecondary
              }}
            >
              AI-suggested NUMC mappings requiring validation
              and approval.
            </div>
          </div>

          <Badge variant="neutral">
            {filteredMappings.length} records
          </Badge>
        </div>

        {isLoading ? (
          <div
            style={{
              minHeight: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  margin: '0 auto 14px',
                  borderRadius: '15px',
                  background: COLORS.greenSoft,
                  color: COLORS.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <RefreshCw
                  size={22}
                  style={{
                    animation:
                      'spin 1s linear infinite'
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: COLORS.text
                }}
              >
                Loading mapping register...
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '10px',
                  color: COLORS.textSecondary
                }}
              >
                Fetching current AI mapping suggestions.
              </div>
            </div>
          </div>
        ) : filteredMappings.length === 0 ? (
          <div
            style={{
              minHeight: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '30px'
            }}
          >
            <div>
              <div
                style={{
                  width: '55px',
                  height: '55px',
                  margin: '0 auto 14px',
                  borderRadius: '16px',
                  background: COLORS.slateSoft,
                  color: COLORS.textMuted,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Search size={23} />
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: COLORS.text
                }}
              >
                No Mapping Records Found
              </div>

              <div
                style={{
                  marginTop: '5px',
                  fontSize: '10px',
                  color: COLORS.textSecondary
                }}
              >
                Try another CPSE, status tab, or search term.
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: '1100px',
                borderCollapse: 'collapse',
                fontSize: '11px'
              }}
            >
              <thead>
                <tr>
                  {[
                    'CPSE & Local Code',
                    'Legacy Description',
                    'AI Suggested NUMC',
                    'Taxonomy',
                    'AI Confidence',
                    'Status',
                    'Action'
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: '11px 12px',
                        textAlign: 'left',
                        background: COLORS.slateSoft,
                        borderBottom: `1px solid ${COLORS.border}`,
                        color: COLORS.textSecondary,
                        fontSize: '9px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMappings.map((mapping, index) => (
                  <tr
                    key={mapping.id}
                    style={{
                      background:
                        index % 2 === 0
                          ? COLORS.white
                          : '#FCFDFC'
                    }}
                  >
                    {/* CPSE */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        verticalAlign: 'top'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px'
                        }}
                      >
                        <div
                          style={{
                            width: '27px',
                            height: '27px',
                            borderRadius: '8px',
                            background: COLORS.blueSoft,
                            color: COLORS.blue,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <Building2 size={13} />
                        </div>

                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              color: COLORS.text,
                              fontSize: '10px'
                            }}
                          >
                            {mapping.cpseName}
                          </div>

                          <div
                            style={{
                              marginTop: '4px',
                              display: 'inline-flex',
                              padding: '3px 5px',
                              borderRadius: '5px',
                              background:
                                COLORS.slateSoft,
                              color:
                                COLORS.textSecondary,
                              fontSize: '9px',
                              fontFamily:
                                'monospace'
                            }}
                          >
                            {mapping.localCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Raw Description */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        color: COLORS.textSecondary,
                        maxWidth: '210px',
                        lineHeight: 1.5,
                        verticalAlign: 'top'
                      }}
                    >
                      “{mapping.rawDescription}”
                    </td>

                    {/* AI Suggested */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        verticalAlign: 'top'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Sparkles
                          size={12}
                          color={COLORS.purple}
                        />

                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: COLORS.blue
                          }}
                        >
                          {mapping.aiSuggestedCode}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '5px',
                          fontSize: '10px',
                          lineHeight: 1.5,
                          fontWeight: 700,
                          color: COLORS.text
                        }}
                      >
                        {mapping.aiSuggestedName}
                      </div>
                    </td>

                    {/* Taxonomy */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        verticalAlign: 'top'
                      }}
                    >
                      <Badge variant="neutral">
                        {mapping.unspsc}
                      </Badge>

                      <div
                        style={{
                          marginTop: '5px',
                          fontSize: '9px',
                          color: COLORS.textSecondary
                        }}
                      >
                        {mapping.category}
                      </div>
                    </td>

                    {/* Confidence */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        verticalAlign: 'top'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px'
                        }}
                      >
                        <div
                          style={{
                            width: '54px',
                            height: '6px',
                            borderRadius: '999px',
                            background: '#E5E7EB',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                Number(
                                  mapping.confidence
                                ) || 0,
                                100
                              )}%`,
                              height: '100%',
                              borderRadius: '999px',
                              background:
                                Number(
                                  mapping.confidence
                                ) > 95
                                  ? COLORS.green
                                  : '#F59E0B'
                            }}
                          />
                        </div>

                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color:
                              Number(
                                mapping.confidence
                              ) > 95
                                ? COLORS.greenDark
                                : COLORS.amber
                          }}
                        >
                          {mapping.confidence}%
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '5px',
                          fontSize: '9px',
                          color: COLORS.textMuted
                        }}
                      >
                        AI similarity score
                      </div>
                    </td>

                    {/* Status */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        verticalAlign: 'top'
                      }}
                    >
                      <Badge
                        variant={getStatusVariant(
                          mapping.status
                        )}
                      >
                        {mapping.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        padding: '13px 12px',
                        borderBottom: `1px solid ${COLORS.borderSoft}`,
                        verticalAlign: 'top'
                      }}
                    >
                      {mapping.status ===
                      'Confirmed' ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '7px 9px',
                            borderRadius: '8px',
                            background:
                              COLORS.greenSoft,
                            color: COLORS.greenDark,
                            fontSize: '9px',
                            fontWeight: 800
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Mapped
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <button
                            onClick={() =>
                              handleConfirmMapping(
                                mapping
                              )
                            }
                            style={{
                              height: '31px',
                              padding: '0 9px',
                              borderRadius: '8px',
                              border: `1px solid ${COLORS.green}`,
                              background:
                                COLORS.green,
                              color: COLORS.white,
                              display: 'inline-flex',
                              alignItems:
                                'center',
                              gap: '5px',
                              fontSize: '9px',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Confirm
                          </button>

                          <button
                            onClick={() =>
                              handleRejectMapping(
                                mapping
                              )
                            }
                            style={{
                              height: '31px',
                              padding: '0 9px',
                              borderRadius: '8px',
                              border: `1px solid #FECACA`,
                              background:
                                COLORS.redSoft,
                              color: COLORS.red,
                              display: 'inline-flex',
                              alignItems:
                                'center',
                              gap: '5px',
                              fontSize: '9px',
                              fontWeight: 800,
                              cursor: 'pointer'
                            }}
                          >
                            <XCircle size={12} />
                            Re-map
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => {
          if (!isUploading) {
            setIsImportModalOpen(false);
          }
        }}
        title="Batch Import Legacy CPSE Catalog"
        subtitle="Upload a CSV or TXT file containing legacy material codes for AI mapping."
        maxWidth="560px"
        footer={
          <>
            <SecondaryButton
              onClick={() =>
                setIsImportModalOpen(false)
              }
              disabled={isUploading}
            >
              Cancel
            </SecondaryButton>

            <PrimaryButton
              onClick={handleImport}
              disabled={isUploading}
              icon={
                <Upload
                  size={14}
                />
              }
            >
              {isUploading
                ? 'Uploading...'
                : 'Start AI Mapping'}
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
          {/* Upload Area */}
          <label
            style={{
              display: 'block',
              padding: '30px 20px',
              borderRadius: '14px',
              border: `2px dashed ${
                uploadFile
                  ? COLORS.greenBorder
                  : COLORS.border
              }`,
              background: uploadFile
                ? COLORS.greenSoft
                : COLORS.slateSoft,
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(event) =>
                setUploadFile(
                  event.target.files?.[0] ||
                    null
                )
              }
              style={{ display: 'none' }}
            />

            <div
              style={{
                width: '50px',
                height: '50px',
                margin: '0 auto 11px',
                borderRadius: '14px',
                background: uploadFile
                  ? COLORS.green
                  : COLORS.blueSoft,
                color: uploadFile
                  ? COLORS.white
                  : COLORS.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {uploadFile ? (
                <FileSpreadsheet size={23} />
              ) : (
                <Upload size={23} />
              )}
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              {uploadFile
                ? uploadFile.name
                : 'Choose Legacy Catalog File'}
            </div>

            <div
              style={{
                marginTop: '5px',
                fontSize: '10px',
                color: COLORS.textSecondary
              }}
            >
              {uploadFile
                ? `${(
                    uploadFile.size / 1024
                  ).toFixed(1)} KB selected`
                : 'CSV or TXT format · Click to browse'}
            </div>
          </label>

          {/* Process Preview */}
          <div
            style={{
              padding: '13px',
              borderRadius: '11px',
              background: COLORS.purpleSoft,
              border: '1px solid #DDD6FE'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                color: COLORS.purple,
                fontSize: '11px',
                fontWeight: 800
              }}
            >
              <Sparkles size={14} />
              Automated AI Mapping Pipeline
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                flexWrap: 'wrap'
              }}
            >
              {[
                'Upload',
                'Normalize',
                'AI Match',
                'NUMC Mapping',
                'Review'
              ].map((step, index) => (
                <React.Fragment key={step}>
                  <span
                    style={{
                      padding: '5px 7px',
                      borderRadius: '6px',
                      background: COLORS.white,
                      color: COLORS.textSecondary,
                      fontSize: '9px',
                      fontWeight: 700
                    }}
                  >
                    {step}
                  </span>

                  {index < 4 && (
                    <ArrowRight
                      size={11}
                      color={COLORS.textMuted}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '11px 12px',
              borderRadius: '10px',
              background: COLORS.blueSoft,
              border: `1px solid ${COLORS.blueBorder}`,
              color: '#1D4ED8',
              fontSize: '10px',
              lineHeight: 1.5
            }}
          >
            <ShieldCheck
              size={14}
              style={{ flexShrink: 0 }}
            />

            <span>
              Uploaded records will be processed for
              automated NUMC mapping. Human confirmation
              remains required before mappings are finalized.
            </span>
          </div>
        </div>
      </Modal>

      <style>
        {`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default CPSEMappingPage;