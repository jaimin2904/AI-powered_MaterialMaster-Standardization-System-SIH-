import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Eye,
  GitCompare,
  Sparkles,
  Package,
  Layers,
  RefreshCw,
  FileText,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  SlidersHorizontal,
  Building2,
  MapPin,
  IndianRupee,
  Boxes,
  ChevronRight,
  Database,
  ShieldCheck,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';

import Badge from '../components/common/Badge';
import Drawer from '../components/common/Drawer';
import { CPSE_LIST } from '../data/mockData';
import {
  getMaterials,
  matchMaterial,
  submitApproval
} from '../services/api';

const MATCH_STATUS_VARIANTS = {
  Confirmed: 'success',
  'Under Review': 'warning',
  'Duplicate Cluster': 'danger',
  Unmapped: 'neutral'
};

const classifyRecommendation = (score, bestMatch) => {
  if (!bestMatch || !score || score < 50) {
    return {
      label: 'Different Material',
      variant: 'danger'
    };
  }

  if (score >= 75) {
    return {
      label: 'Potential Equivalent Material',
      variant: 'success'
    };
  }

  return {
    label: 'Possible Near Duplicate',
    variant: 'warning'
  };
};

/* =========================================================
   SMALL REUSABLE UI COMPONENTS
========================================================= */

const SectionTitle = ({
  icon: Icon,
  title,
  subtitle,
  tone = 'green',
  right
}) => {
  const tones = {
    green: ['#EAF7F1', '#078A58'],
    purple: ['#F1EDFF', '#7048C8'],
    blue: ['#EEF5FF', '#416FA8'],
    gray: ['#F2F5F3', '#64716A']
  };

  const [background, color] =
    tones[tone] || tones.green;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '14px'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '9px',
          minWidth: 0
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background,
            color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={16} />
        </div>

        <div style={{ minWidth: 0 }}>
          <h3
            style={{
              margin: 0,
              color: '#25322B',
              fontSize: '12px',
              fontWeight: 800
            }}
          >
            {title}
          </h3>

          {subtitle && (
            <p
              style={{
                margin: '3px 0 0',
                color: '#89938D',
                fontSize: '9px',
                lineHeight: 1.4
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {right}
    </div>
  );
};

const ActionButton = ({
  children,
  onClick,
  icon: Icon,
  variant = 'secondary',
  disabled = false,
  title,
  fullWidth = false
}) => {
  const variants = {
    primary: {
      background: '#078A58',
      border: '#078A58',
      color: '#FFFFFF'
    },
    secondary: {
      background: '#FFFFFF',
      border: '#E0E7E2',
      color: '#526059'
    },
    soft: {
      background: '#EAF7F1',
      border: '#CDEBDD',
      color: '#087A50'
    },
    danger: {
      background: '#FFF3F3',
      border: '#F0D1D1',
      color: '#B83D3D'
    },
    purple: {
      background: '#F3EFFF',
      border: '#DDD4F8',
      color: '#7048C8'
    }
  };

  const current =
    variants[variant] || variants.secondary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        height: '34px',
        width: fullWidth ? '100%' : 'auto',
        padding: '0 11px',
        borderRadius: '9px',
        border: `1px solid ${current.border}`,
        background: current.background,
        color: current.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '9px',
        fontWeight: 750,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        whiteSpace: 'nowrap'
      }}
    >
      {Icon && <Icon size={13} />}
      {children}
    </button>
  );
};

const InfoBox = ({
  label,
  value,
  icon: Icon,
  tone = 'gray'
}) => {
  const tones = {
    gray: ['#F6F8F7', '#66736B'],
    green: ['#EAF7F1', '#078A58'],
    blue: ['#EEF5FF', '#416FA8'],
    purple: ['#F3EFFF', '#7048C8'],
    orange: ['#FFF7E8', '#B77900']
  };

  const [background, color] =
    tones[tone] || tones.gray;

  return (
    <div
      style={{
        padding: '11px',
        borderRadius: '11px',
        border: '1px solid #E7ECE9',
        background: '#FFFFFF'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          color: '#8A938E',
          fontSize: '8px',
          fontWeight: 700,
          textTransform: 'uppercase'
        }}
      >
        {Icon && (
          <span
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '7px',
              background,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={11} />
          </span>
        )}

        {label}
      </div>

      <div
        style={{
          marginTop: '7px',
          color: '#26332C',
          fontSize: '11px',
          fontWeight: 750,
          wordBreak: 'break-word'
        }}
      >
        {value}
      </div>
    </div>
  );
};

/* =========================================================
   MAIN PAGE
========================================================= */

export const MaterialSearchPage = ({
  selectedCpse,
  setSelectedCpse,
  comparisonItems,
  setComparisonItems,
  setActiveTab,
  showToast
}) => {
  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('ALL');

  const [selectedStatus, setSelectedStatus] =
    useState('ALL');

  const [isAiSemantic, setIsAiSemantic] =
    useState(true);

  const [inStockOnly, setInStockOnly] =
    useState(false);

  const [viewMode, setViewMode] =
    useState('table');

  const [isLoading, setIsLoading] =
    useState(false);

  const [loadError, setLoadError] =
    useState(null);

  const [retryKey, setRetryKey] =
    useState(0);

  const [selectedItemDetail, setSelectedItemDetail] =
    useState(null);

  const [materials, setMaterials] =
    useState([]);

  /* AI matching */
  const [matchingMaterial, setMatchingMaterial] =
    useState(null);

  const [isMatchOpen, setIsMatchOpen] =
    useState(false);

  const [isMatchLoading, setIsMatchLoading] =
    useState(false);

  const [matchResult, setMatchResult] =
    useState(null);

  const [matchError, setMatchError] =
    useState(null);

  /* Human review */
  const [reviewComment, setReviewComment] =
    useState('');

  const [isReviewSubmitting, setIsReviewSubmitting] =
    useState(false);

  const [reviewError, setReviewError] =
    useState(null);

  /* =========================================================
     FETCH MATERIALS
  ========================================================== */

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    getMaterials(
      selectedCpse,
      searchTerm,
      selectedCategory,
      selectedStatus
    )
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((m) => {
            let specs = {};

            try {
              specs =
                typeof m.specification === 'string'
                  ? JSON.parse(m.specification)
                  : m.specification || {};
            } catch (e) {
              specs = {
                Description: m.description
              };
            }

            return {
              id: m.id,
              numcCode:
                'NUMC-401015-0089',
              localCode: m.material_code,
              cpseId: m.cpse_id,
              cpseName:
                m.cpse_name ||
                m.cpse_id?.toUpperCase(),
              rawDescription:
                m.raw_description ||
                m.description,
              standardDescription:
                m.description,
              unspscCode: '40141600',
              unspscCategory: m.category,
              mescCode:
                '60.12.34.110.1',
              stockQty: m.stock_qty || 10,
              unit: m.unit,
              unitCost: m.unit_cost || 0,
              manufacturer:
                m.manufacturer ||
                'Approved OEM Vendor',
              plantLocation:
                m.plant_location ||
                'Central CPSE Complex',
              status: 'Harmonized',
              confidenceScore: 98.4,
              lastUpdated:
                '2026-09-20',
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
        setLoadError(
          err.message ||
            'Failed to load materials'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [
    selectedCpse,
    searchTerm,
    selectedCategory,
    selectedStatus,
    retryKey
  ]);

  /* =========================================================
     FILTER
  ========================================================== */

  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      if (
        inStockOnly &&
        mat.stockQty <= 0
      ) {
        return false;
      }

      return true;
    });
  }, [materials, inStockOnly]);

  /* =========================================================
     HANDLERS
  ========================================================== */

  const handleSimulateSearch = () => {
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      showToast(
        'AI Semantic Material Search Updated',
        'info'
      );
    }, 300);
  };

  const handleMatchMaterial = (mat) => {
    if (!mat.id) {
      showToast(
        'AI Match is available for live catalog items only (sample data has no backend record)',
        'warning'
      );
      return;
    }

    setMatchingMaterial(mat);
    setMatchResult(null);
    setMatchError(null);
    setReviewComment('');
    setReviewError(null);
    setIsMatchLoading(true);
    setIsMatchOpen(true);

    matchMaterial(mat.id)
      .then((data) => {
        setMatchResult(data);
      })
      .catch((err) => {
        setMatchError(
          err.message ||
            'AI material matching failed'
        );
      })
      .finally(() => {
        setIsMatchLoading(false);
      });
  };

  const handleRetryMatch = () => {
    if (!matchingMaterial?.id) return;

    setMatchResult(null);
    setMatchError(null);
    setIsMatchLoading(true);

    matchMaterial(matchingMaterial.id)
      .then((data) => {
        setMatchResult(data);
      })
      .catch((err) => {
        setMatchError(
          err.message ||
            'AI material matching failed'
        );
      })
      .finally(() => {
        setIsMatchLoading(false);
      });
  };

  const handleReviewAction = (
    materialId,
    mappingId,
    decision
  ) => {
    if (
      !matchingMaterial?.id ||
      !mappingId ||
      isReviewSubmitting
    ) {
      return;
    }

    setIsReviewSubmitting(true);
    setReviewError(null);

    submitApproval(
      mappingId,
      decision,
      reviewComment.trim() ||
        (decision === 'Approved'
          ? 'Approved via Material Matching review'
          : 'Rejected via Material Matching review'),
      'Master Data Admin'
    )
      .then(() => {
        const newStatus =
          decision === 'Approved'
            ? 'Confirmed'
            : 'Under Review';

        setMatchResult((prev) =>
          prev
            ? {
                ...prev,
                match_status: newStatus
              }
            : prev
        );

        setReviewComment('');

        if (decision === 'Approved') {
          showToast(
            `Approved match for ${matchingMaterial.localCode}. Mapping confirmed & audit logged.`,
            'success'
          );
        } else {
          showToast(
            `Rejected match for ${matchingMaterial.localCode}. Feedback recorded & audit logged.`,
            'warning'
          );
        }
      })
      .catch((err) => {
        setReviewError(
          err.message ||
            'Review action failed'
        );

        showToast(
          err.message ||
            'Review action failed',
          'danger'
        );
      })
      .finally(() => {
        setIsReviewSubmitting(false);
      });
  };

  const toggleAddToComparison = (item) => {
    const exists = comparisonItems.some(
      (i) =>
        i.localCode === item.localCode
    );

    if (exists) {
      setComparisonItems(
        comparisonItems.filter(
          (i) =>
            i.localCode !== item.localCode
        )
      );

      showToast(
        'Removed from comparison',
        'info'
      );
    } else {
      if (comparisonItems.length >= 4) {
        showToast(
          'Maximum 4 items allowed in comparison matrix',
          'warning'
        );
        return;
      }

      setComparisonItems([
        ...comparisonItems,
        item
      ]);

      showToast(
        `Added ${item.localCode} to comparison selection`,
        'success'
      );
    }
  };

  const isSelectedForComparison = (
    item
  ) => {
    return comparisonItems.some(
      (i) =>
        i.localCode === item.localCode
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setSelectedCpse('all');
    setInStockOnly(false);
  };

  /* =========================================================
     RENDER
  ========================================================== */

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        paddingBottom: '28px'
      }}
    >
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              marginBottom: '5px'
            }}
          >
            <span
              style={{
                color: '#8A938E',
                fontSize: '9px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.7px'
              }}
            >
              MATERIAL INTELLIGENCE
            </span>

            <Badge variant="ai">
              <Sparkles size={10} />
              AI Enabled
            </Badge>
          </div>

          <h2
            style={{
              margin: 0,
              color: '#1D2923',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.5px'
            }}
          >
            Material Search & Matching
          </h2>

          <p
            style={{
              margin: '5px 0 0',
              color: '#7E8982',
              fontSize: '10px'
            }}
          >
            Unified catalogue lookup across
            the National Material Master and
            CPSE local registers.
          </p>
        </div>

        {comparisonItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '12px',
              background: '#EAF7F1',
              border: '1px solid #CDEBDD'
            }}
          >
            <GitCompare
              size={14}
              color="#078A58"
            />

            <span
              style={{
                color: '#087A50',
                fontSize: '9px',
                fontWeight: 750
              }}
            >
              {comparisonItems.length}{' '}
              selected
            </span>

            <ActionButton
              variant="primary"
              icon={GitCompare}
              onClick={() =>
                setActiveTab('comparison')
              }
            >
              Compare
            </ActionButton>

            <button
              onClick={() =>
                setComparisonItems([])
              }
              title="Clear comparison selection"
              style={{
                width: '27px',
                height: '27px',
                border: 'none',
                borderRadius: '7px',
                background:
                  'rgba(255,255,255,0.7)',
                color: '#64716A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          SEARCH PANEL
      ====================================================== */}

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7EBE8',
          borderRadius: '18px',
          padding: '16px',
          boxShadow:
            '0 3px 14px rgba(15, 23, 42, 0.035)'
        }}
      >
        <SectionTitle
          icon={Search}
          title="Search Catalogue"
          subtitle="Search by material code, description, CPSE or technical specifications."
          tone="green"
          right={
            <Badge variant="success">
              Semantic Search Active
            </Badge>
          }
        />

        {/* Search */}
        <div
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative'
            }}
          >
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color: '#9AA49E'
              }}
            />

            <input
              type="text"
              placeholder="Search keywords, NUMC code, CPSE code or technical specifications..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              style={{
                width: '100%',
                height: '40px',
                boxSizing: 'border-box',
                padding:
                  '0 12px 0 36px',
                borderRadius: '10px',
                border:
                  '1px solid #DDE5E0',
                background: '#FAFBFA',
                color: '#26332C',
                outline: 'none',
                fontSize: '10px'
              }}
            />
          </div>

          <ActionButton
            variant="primary"
            icon={Search}
            onClick={handleSimulateSearch}
          >
            Search Material
          </ActionButton>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            flexWrap: 'wrap',
            marginTop: '12px',
            paddingTop: '12px',
            borderTop:
              '1px solid #EFF2F0'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Building2
              size={12}
              color="#8A938E"
            />

            <select
              value={selectedCpse}
              onChange={(e) =>
                setSelectedCpse(
                  e.target.value
                )
              }
              style={{
                height: '31px',
                minWidth: '165px',
                padding: '0 8px',
                borderRadius: '8px',
                border:
                  '1px solid #E0E7E2',
                background: '#FFFFFF',
                color: '#56635B',
                fontSize: '9px',
                outline: 'none'
              }}
            >
              {CPSE_LIST.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Layers
              size={12}
              color="#8A938E"
            />

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
              style={{
                height: '31px',
                minWidth: '155px',
                padding: '0 8px',
                borderRadius: '8px',
                border:
                  '1px solid #E0E7E2',
                background: '#FFFFFF',
                color: '#56635B',
                fontSize: '9px',
                outline: 'none'
              }}
            >
              <option value="ALL">
                All UNSPSC Categories
              </option>
              <option value="Valves">
                Valves
              </option>
              <option value="Motors">
                Motors
              </option>
              <option value="Bearings">
                Bearings
              </option>
              <option value="Pumps & Impellers">
                Pumps & Impellers
              </option>
              <option value="Electrical Cables">
                Electrical Cables
              </option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(
                e.target.value
              )
            }
            style={{
              height: '31px',
              minWidth: '130px',
              padding: '0 8px',
              borderRadius: '8px',
              border:
                '1px solid #E0E7E2',
              background: '#FFFFFF',
              color: '#56635B',
              fontSize: '9px',
              outline: 'none'
            }}
          >
            <option value="ALL">
              All Statuses
            </option>
            <option value="Harmonized">
              Harmonized
            </option>
            <option value="Duplicate Cluster">
              Duplicate Cluster
            </option>
            <option value="Under AI Review">
              Under AI Review
            </option>
          </select>

          <label
            style={{
              height: '31px',
              padding: '0 9px',
              borderRadius: '8px',
              border:
                '1px solid #DDD4F8',
              background: '#F8F5FF',
              color: '#7048C8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 700
            }}
          >
            <input
              type="checkbox"
              checked={isAiSemantic}
              onChange={(e) =>
                setIsAiSemantic(
                  e.target.checked
                )
              }
              style={{
                accentColor: '#7048C8'
              }}
            />
            <Sparkles size={12} />
            AI Semantic Matching
          </label>

          <label
            style={{
              height: '31px',
              padding: '0 9px',
              borderRadius: '8px',
              border:
                '1px solid #E0E7E2',
              background: '#FFFFFF',
              color: '#64716A',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 700
            }}
          >
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) =>
                setInStockOnly(
                  e.target.checked
                )
              }
              style={{
                accentColor: '#078A58'
              }}
            />
            Available Stock Only
          </label>

          <button
            onClick={resetFilters}
            style={{
              height: '31px',
              marginLeft: 'auto',
              padding: '0 9px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              color: '#7C8780',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
              fontSize: '9px',
              fontWeight: 700
            }}
          >
            <RefreshCw size={11} />
            Reset
          </button>
        </div>
      </section>

      {/* =====================================================
          RESULTS TOOLBAR
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <span
            style={{
              color: '#34413A',
              fontSize: '10px',
              fontWeight: 800
            }}
          >
            {filteredMaterials.length}
          </span>

          <span
            style={{
              color: '#8A938E',
              fontSize: '9px',
              marginLeft: '4px'
            }}
          >
            material records found
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px',
            borderRadius: '9px',
            background: '#EEF2EF'
          }}
        >
          <button
            onClick={() =>
              setViewMode('table')
            }
            style={{
              height: '27px',
              padding: '0 9px',
              borderRadius: '7px',
              border: 'none',
              background:
                viewMode === 'table'
                  ? '#FFFFFF'
                  : 'transparent',
              color:
                viewMode === 'table'
                  ? '#078A58'
                  : '#7B867F',
              boxShadow:
                viewMode === 'table'
                  ? '0 2px 5px rgba(0,0,0,0.06)'
                  : 'none',
              fontSize: '8px',
              fontWeight: 750,
              cursor: 'pointer'
            }}
          >
            Table View
          </button>

          <button
            onClick={() =>
              setViewMode('grid')
            }
            style={{
              height: '27px',
              padding: '0 9px',
              borderRadius: '7px',
              border: 'none',
              background:
                viewMode === 'grid'
                  ? '#FFFFFF'
                  : 'transparent',
              color:
                viewMode === 'grid'
                  ? '#078A58'
                  : '#7B867F',
              boxShadow:
                viewMode === 'grid'
                  ? '0 2px 5px rgba(0,0,0,0.06)'
                  : 'none',
              fontSize: '8px',
              fontWeight: 750,
              cursor: 'pointer'
            }}
          >
            Grid Cards
          </button>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ====================================================== */}

      {isLoading ? (
        <div
          style={{
            minHeight: '260px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            border:
              '1px solid #E7EBE8',
            borderRadius: '18px',
            boxShadow:
              '0 3px 14px rgba(15,23,42,0.035)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border:
                '3px solid #DDEDE5',
              borderTopColor:
                '#078A58',
              animation:
                'materialSearchSpin 0.8s linear infinite'
            }}
          />

          <div
            style={{
              marginTop: '14px',
              color: '#34413A',
              fontSize: '11px',
              fontWeight: 750
            }}
          >
            Running AI Vector Search...
          </div>

          <div
            style={{
              marginTop: '5px',
              color: '#929C96',
              fontSize: '9px'
            }}
          >
            Normalizing technical specifications
            and indexing CPSE catalogues
          </div>
        </div>
      ) : loadError ? (
        /* ===================================================
           ERROR
        ==================================================== */
        <div
          style={{
            minHeight: '230px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            border:
              '1px solid #E7EBE8',
            borderRadius: '18px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#FFF0F0',
              color: '#C53D3D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertCircle size={20} />
          </div>

          <div
            style={{
              marginTop: '10px',
              color: '#35423B',
              fontSize: '11px',
              fontWeight: 750
            }}
          >
            Failed to Load Materials
          </div>

          <div
            style={{
              marginTop: '4px',
              color: '#89938D',
              fontSize: '9px',
              maxWidth: '500px',
              textAlign: 'center'
            }}
          >
            {loadError}
          </div>

          <div style={{ marginTop: '13px' }}>
            <ActionButton
              variant="primary"
              icon={RefreshCw}
              onClick={() =>
                setRetryKey((k) => k + 1)
              }
            >
              Retry
            </ActionButton>
          </div>
        </div>
      ) : filteredMaterials.length === 0 ? (
        /* ===================================================
           EMPTY
        ==================================================== */
        <div
          style={{
            minHeight: '230px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFFFFF',
            border:
              '1px solid #E7EBE8',
            borderRadius: '18px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: '#F2F5F3',
              color: '#7B867F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Package size={20} />
          </div>

          <div
            style={{
              marginTop: '10px',
              color: '#35423B',
              fontSize: '11px',
              fontWeight: 750
            }}
          >
            No Matching Materials Found
          </div>

          <div
            style={{
              marginTop: '4px',
              color: '#89938D',
              fontSize: '9px'
            }}
          >
            Try broadening your search or clearing
            filters.
          </div>

          <div style={{ marginTop: '13px' }}>
            <ActionButton
              onClick={resetFilters}
              icon={RefreshCw}
            >
              Reset Filters
            </ActionButton>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ===================================================
           TABLE VIEW
        ==================================================== */
        <div
          style={{
            background: '#FFFFFF',
            border:
              '1px solid #E7EBE8',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow:
              '0 3px 14px rgba(15,23,42,0.035)'
          }}
        >
          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: '1050px',
                borderCollapse:
                  'collapse'
              }}
            >
              <thead>
                <tr>
                  {[
                    '',
                    'Material',
                    'CPSE & Location',
                    'Standardized Description',
                    'Classification',
                    'Inventory',
                    'AI Match',
                    'Status',
                    'Actions'
                  ].map((heading, index) => (
                    <th
                      key={index}
                      style={{
                        padding:
                          '10px 11px',
                        background:
                          '#F8FAF9',
                        borderBottom:
                          '1px solid #E9EEEB',
                        textAlign: 'left',
                        color:
                          '#8A938E',
                        fontSize: '8px',
                        fontWeight: 800,
                        textTransform:
                          'uppercase',
                        letterSpacing:
                          '0.4px',
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMaterials.map(
                  (mat, idx) => {
                    const checked =
                      isSelectedForComparison(
                        mat
                      );

                    return (
                      <tr
                        key={
                          mat.id || idx
                        }
                        style={{
                          background:
                            checked
                              ? '#F2FAF6'
                              : '#FFFFFF',
                          transition:
                            'background 0.15s ease'
                        }}
                      >
                        {/* SELECT */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1',
                            width: '35px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleAddToComparison(
                                mat
                              )
                            }
                            style={{
                              accentColor:
                                '#078A58',
                              cursor:
                                'pointer'
                            }}
                          />
                        </td>

                        {/* MATERIAL */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <div
                            style={{
                              color:
                                '#078A58',
                              fontSize:
                                '9px',
                              fontWeight:
                                800
                            }}
                          >
                            {mat.numcCode}
                          </div>

                          <div
                            style={{
                              marginTop:
                                '4px',
                              display:
                                'inline-block',
                              padding:
                                '3px 6px',
                              borderRadius:
                                '5px',
                              background:
                                '#F1F4F2',
                              color:
                                '#68736C',
                              fontSize:
                                '8px',
                              fontWeight:
                                700
                            }}
                          >
                            {mat.localCode}
                          </div>
                        </td>

                        {/* CPSE */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '5px',
                              color:
                                '#34413A',
                              fontSize:
                                '9px',
                              fontWeight:
                                750
                            }}
                          >
                            <Building2
                              size={11}
                              color="#078A58"
                            />
                            {mat.cpseName}
                          </div>

                          <div
                            style={{
                              marginTop:
                                '4px',
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '4px',
                              color:
                                '#909A94',
                              fontSize:
                                '8px'
                            }}
                          >
                            <MapPin
                              size={10}
                            />
                            {
                              mat.plantLocation
                            }
                          </div>
                        </td>

                        {/* DESCRIPTION */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1',
                            maxWidth:
                              '245px'
                          }}
                        >
                          <div
                            style={{
                              color:
                                '#35423B',
                              fontSize:
                                '9px',
                              fontWeight:
                                700,
                              lineHeight:
                                1.4
                            }}
                          >
                            {
                              mat.standardDescription
                            }
                          </div>

                          <div
                            style={{
                              marginTop:
                                '4px',
                              color:
                                '#929B95',
                              fontSize:
                                '8px',
                              fontStyle:
                                'italic',
                              whiteSpace:
                                'nowrap',
                              overflow:
                                'hidden',
                              textOverflow:
                                'ellipsis'
                            }}
                          >
                            Raw: "
                            {
                              mat.rawDescription
                            }
                            "
                          </div>
                        </td>

                        {/* CLASSIFICATION */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <Badge variant="neutral">
                            {
                              mat.unspscCategory
                            }
                          </Badge>

                          <div
                            style={{
                              marginTop:
                                '4px',
                              color:
                                '#929B95',
                              fontSize:
                                '8px'
                            }}
                          >
                            MESC:{' '}
                            {
                              mat.mescCode
                            }
                          </div>
                        </td>

                        {/* INVENTORY */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              alignItems:
                                'center',
                              gap: '4px',
                              color:
                                '#35423B',
                              fontSize:
                                '9px',
                              fontWeight:
                                750
                            }}
                          >
                            <Boxes
                              size={11}
                              color="#078A58"
                            />
                            {mat.stockQty}{' '}
                            {mat.unit}
                          </div>

                          <div
                            style={{
                              marginTop:
                                '4px',
                              color:
                                '#078A58',
                              fontSize:
                                '8px',
                              fontWeight:
                                700
                            }}
                          >
                            ₹
                            {mat.unitCost.toLocaleString(
                              'en-IN'
                            )}{' '}
                            / unit
                          </div>
                        </td>

                        {/* AI */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <div
                            style={{
                              color:
                                mat.confidenceScore >
                                95
                                  ? '#078A58'
                                  : '#B77900',
                              fontSize:
                                '11px',
                              fontWeight:
                                800
                            }}
                          >
                            {
                              mat.confidenceScore
                            }
                            %
                          </div>

                          <div
                            style={{
                              marginTop:
                                '2px',
                              color:
                                '#929B95',
                              fontSize:
                                '8px'
                            }}
                          >
                            Confidence
                          </div>
                        </td>

                        {/* STATUS */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <Badge
                            variant={
                              mat.status ===
                              'Harmonized'
                                ? 'success'
                                : mat.status ===
                                    'Duplicate Cluster'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {mat.status}
                          </Badge>
                        </td>

                        {/* ACTIONS */}
                        <td
                          style={{
                            padding:
                              '11px',
                            borderBottom:
                              '1px solid #F0F2F1'
                          }}
                        >
                          <div
                            style={{
                              display:
                                'flex',
                              gap: '5px'
                            }}
                          >
                            <button
                              onClick={() =>
                                setSelectedItemDetail(
                                  mat
                                )
                              }
                              title="View material details"
                              style={{
                                width:
                                  '28px',
                                height:
                                  '28px',
                                border:
                                  '1px solid #E1E7E3',
                                borderRadius:
                                  '7px',
                                background:
                                  '#FFFFFF',
                                color:
                                  '#68736C',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                cursor:
                                  'pointer'
                              }}
                            >
                              <Eye
                                size={12}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleMatchMaterial(
                                  mat
                                )
                              }
                              title="Run AI matching"
                              style={{
                                width:
                                  '28px',
                                height:
                                  '28px',
                                border:
                                  '1px solid #DDD4F8',
                                borderRadius:
                                  '7px',
                                background:
                                  '#F7F4FF',
                                color:
                                  '#7048C8',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                cursor:
                                  'pointer'
                              }}
                            >
                              <Sparkles
                                size={12}
                              />
                            </button>

                            <button
                              onClick={() =>
                                toggleAddToComparison(
                                  mat
                                )
                              }
                              title={
                                checked
                                  ? 'Remove from comparison'
                                  : 'Add to comparison'
                              }
                              style={{
                                width:
                                  '28px',
                                height:
                                  '28px',
                                border:
                                  '1px solid #CDEBDD',
                                borderRadius:
                                  '7px',
                                background:
                                  checked
                                    ? '#078A58'
                                    : '#EAF7F1',
                                color:
                                  checked
                                    ? '#FFFFFF'
                                    : '#078A58',
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                cursor:
                                  'pointer'
                              }}
                            >
                              {checked ? (
                                <Check
                                  size={12}
                                />
                              ) : (
                                <GitCompare
                                  size={12}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ===================================================
           GRID VIEW
        ==================================================== */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: '11px'
          }}
        >
          {filteredMaterials.map(
            (mat, idx) => {
              const checked =
                isSelectedForComparison(
                  mat
                );

              return (
                <div
                  key={
                    mat.id || idx
                  }
                  style={{
                    background:
                      '#FFFFFF',
                    border: checked
                      ? '1.5px solid #078A58'
                      : '1px solid #E7EBE8',
                    borderRadius:
                      '16px',
                    padding: '14px',
                    display:
                      'flex',
                    flexDirection:
                      'column',
                    gap: '10px',
                    boxShadow:
                      '0 3px 14px rgba(15,23,42,0.035)'
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'flex-start',
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0
                      }}
                    >
                      <div
                        style={{
                          color:
                            '#078A58',
                          fontSize:
                            '9px',
                          fontWeight:
                            800
                        }}
                      >
                        {
                          mat.numcCode
                        }
                      </div>

                      <div
                        style={{
                          marginTop:
                            '4px',
                          color:
                            '#35423B',
                          fontSize:
                            '10px',
                          fontWeight:
                            750
                        }}
                      >
                        {
                          mat.cpseName
                        }
                      </div>
                    </div>

                    <Badge
                      variant={
                        mat.status ===
                        'Harmonized'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {mat.status}
                    </Badge>
                  </div>

                  <div
                    style={{
                      color:
                        '#35423B',
                      fontSize:
                        '10px',
                      fontWeight:
                        650,
                      lineHeight:
                        1.45,
                      minHeight:
                        '43px'
                    }}
                  >
                    {
                      mat.standardDescription
                    }
                  </div>

                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        '1fr 1fr',
                      gap: '7px'
                    }}
                  >
                    <InfoBox
                      label="Stock"
                      value={`${mat.stockQty} ${mat.unit}`}
                      icon={Boxes}
                      tone="green"
                    />

                    <InfoBox
                      label="Unit Cost"
                      value={`₹${mat.unitCost.toLocaleString('en-IN')}`}
                      icon={IndianRupee}
                      tone="blue"
                    />
                  </div>

                  <div
                    style={{
                      padding:
                        '9px',
                      borderRadius:
                        '9px',
                      background:
                        '#F8FAF9',
                      color:
                        '#7C8780',
                      fontSize:
                        '8px'
                    }}
                  >
                    <strong
                      style={{
                        color:
                          '#59655E'
                      }}
                    >
                      Manufacturer:
                    </strong>{' '}
                    {
                      mat.manufacturer
                    }
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      gap: '5px',
                      marginTop:
                        '2px'
                    }}
                  >
                    <ActionButton
                      fullWidth
                      icon={Eye}
                      onClick={() =>
                        setSelectedItemDetail(
                          mat
                        )
                      }
                    >
                      Details
                    </ActionButton>

                    <ActionButton
                      icon={Sparkles}
                      variant="purple"
                      onClick={() =>
                        handleMatchMaterial(
                          mat
                        )
                      }
                    >
                      AI
                    </ActionButton>

                    <ActionButton
                      icon={GitCompare}
                      variant={
                        checked
                          ? 'primary'
                          : 'secondary'
                      }
                      onClick={() =>
                        toggleAddToComparison(
                          mat
                        )
                      }
                    >
                      {checked
                        ? 'Selected'
                        : 'Compare'}
                    </ActionButton>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}

      {/* =====================================================
          MATERIAL DETAIL DRAWER
      ====================================================== */}

      <Drawer
        isOpen={Boolean(
          selectedItemDetail
        )}
        onClose={() =>
          setSelectedItemDetail(null)
        }
        title={
          selectedItemDetail
            ? `Material Datasheet: ${selectedItemDetail.numcCode}`
            : ''
        }
        footer={
          selectedItemDetail && (
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'flex-end',
                gap: '8px'
              }}
            >
              <ActionButton
                onClick={() =>
                  setSelectedItemDetail(
                    null
                  )
                }
              >
                Close
              </ActionButton>

              <ActionButton
                variant="primary"
                icon={GitCompare}
                onClick={() => {
                  toggleAddToComparison(
                    selectedItemDetail
                  );
                  setSelectedItemDetail(
                    null
                  );
                }}
              >
                Add to Comparison
              </ActionButton>
            </div>
          )
        }
      >
        {selectedItemDetail && (
          <div
            style={{
              display: 'flex',
              flexDirection:
                'column',
              gap: '14px'
            }}
          >
            <div
              style={{
                padding: '14px',
                borderRadius: '13px',
                background:
                  'linear-gradient(135deg,#F0FAF5,#F8FBF9)',
                border:
                  '1px solid #D7E9DF'
              }}
            >
              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: '6px',
                  color:
                    '#078A58',
                  fontSize:
                    '8px',
                  fontWeight:
                    800,
                  textTransform:
                    'uppercase'
                }}
              >
                <ShieldCheck
                  size={12}
                />
                National Master Definition
              </div>

              <div
                style={{
                  marginTop:
                    '7px',
                  color:
                    '#26332C',
                  fontSize:
                    '13px',
                  lineHeight:
                    1.4,
                  fontWeight:
                    800
                }}
              >
                {
                  selectedItemDetail.standardDescription
                }
              </div>
            </div>

            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '8px'
              }}
            >
              <InfoBox
                label="CPSE Local Code"
                value={
                  selectedItemDetail.localCode
                }
                icon={FileText}
              />

              <InfoBox
                label="UNSPSC Code"
                value={
                  selectedItemDetail.unspscCode
                }
                icon={Layers}
              />

              <InfoBox
                label="CPSE Enterprise"
                value={
                  selectedItemDetail.cpseName
                }
                icon={Building2}
                tone="green"
              />

              <InfoBox
                label="Unit Cost"
                value={`₹${selectedItemDetail.unitCost.toLocaleString('en-IN')}`}
                icon={IndianRupee}
                tone="green"
              />
            </div>

            {/* Technical specifications */}
            <div>
              <SectionTitle
                icon={SlidersHorizontal}
                title="Technical Attributes"
                subtitle="Standardized specification matrix"
                tone="gray"
              />

              <div
                style={{
                  border:
                    '1px solid #E7EBE8',
                  borderRadius:
                    '11px',
                  overflow:
                    'hidden'
                }}
              >
                <table
                  style={{
                    width:
                      '100%',
                    borderCollapse:
                      'collapse'
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding:
                            '9px',
                          background:
                            '#F8FAF9',
                          textAlign:
                            'left',
                          color:
                            '#8A938E',
                          fontSize:
                            '8px'
                        }}
                      >
                        Attribute
                      </th>

                      <th
                        style={{
                          padding:
                            '9px',
                          background:
                            '#F8FAF9',
                          textAlign:
                            'left',
                          color:
                            '#8A938E',
                          fontSize:
                            '8px'
                        }}
                      >
                        Specification
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(
                      selectedItemDetail.specifications ||
                        {}
                    ).map(
                      ([key, val]) => (
                        <tr
                          key={key}
                        >
                          <td
                            style={{
                              padding:
                                '9px',
                              borderTop:
                                '1px solid #EFF2F0',
                              color:
                                '#66736B',
                              fontSize:
                                '8px',
                              fontWeight:
                                700
                            }}
                          >
                            {key}
                          </td>

                          <td
                            style={{
                              padding:
                                '9px',
                              borderTop:
                                '1px solid #EFF2F0',
                              color:
                                '#35423B',
                              fontSize:
                                '9px',
                              fontWeight:
                                700
                            }}
                          >
                            {String(
                              val
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory */}
            <div
              style={{
                padding: '13px',
                borderRadius:
                  '12px',
                background:
                  '#F8FAF9',
                border:
                  '1px solid #E7EBE8'
              }}
            >
              <SectionTitle
                icon={Boxes}
                title="Inventory Location"
                tone="green"
              />

              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: '7px'
                }}
              >
                <div
                  style={{
                    color:
                      '#66736B',
                    fontSize:
                      '9px'
                  }}
                >
                  <strong
                    style={{
                      color:
                        '#3F4C44'
                    }}
                  >
                    Plant:
                  </strong>{' '}
                  {
                    selectedItemDetail.plantLocation
                  }
                </div>

                <div
                  style={{
                    color:
                      '#66736B',
                    fontSize:
                      '9px'
                  }}
                >
                  <strong
                    style={{
                      color:
                        '#3F4C44'
                    }}
                  >
                    Physical Stock:
                  </strong>{' '}
                  {
                    selectedItemDetail.stockQty
                  }{' '}
                  {
                    selectedItemDetail.unit
                  }
                </div>

                <div
                  style={{
                    color:
                      '#66736B',
                    fontSize:
                      '9px'
                  }}
                >
                  <strong
                    style={{
                      color:
                        '#3F4C44'
                    }}
                  >
                    Approved OEM:
                  </strong>{' '}
                  {
                    selectedItemDetail.manufacturer
                  }
                </div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* =====================================================
          AI MATCH DRAWER
      ====================================================== */}

      <Drawer
        isOpen={isMatchOpen}
        onClose={() =>
          setIsMatchOpen(false)
        }
        title={`AI Match Result: ${
          matchingMaterial?.localCode || ''
        }`}
        footer={
          <ActionButton
            onClick={() =>
              setIsMatchOpen(false)
            }
          >
            Close
          </ActionButton>
        }
      >
        {isMatchLoading ? (
          <div
            style={{
              minHeight:
                '300px',
              display:
                'flex',
              flexDirection:
                'column',
              alignItems:
                'center',
              justifyContent:
                'center'
            }}
          >
            <div
              style={{
                width:
                  '40px',
                height:
                  '40px',
                borderRadius:
                  '50%',
                border:
                  '3px solid #E0D9F7',
                borderTopColor:
                  '#7048C8',
                animation:
                  'materialSearchSpin 0.8s linear infinite'
              }}
            />

            <div
              style={{
                marginTop:
                  '13px',
                color:
                  '#35423B',
                fontSize:
                  '11px',
                fontWeight:
                  750
              }}
            >
              Running AI Semantic Match...
            </div>

            <div
              style={{
                marginTop:
                  '4px',
                color:
                  '#89938D',
                fontSize:
                  '9px'
              }}
            >
              Comparing specifications against
              the National Material Master
            </div>
          </div>
        ) : matchError ? (
          <div
            style={{
              minHeight:
                '260px',
              display:
                'flex',
              flexDirection:
                'column',
              alignItems:
                'center',
              justifyContent:
                'center',
              textAlign:
                'center'
            }}
          >
            <div
              style={{
                width:
                  '42px',
                height:
                  '42px',
                borderRadius:
                  '12px',
                background:
                  '#FFF0F0',
                color:
                  '#C53D3D',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center'
              }}
            >
              <AlertCircle
                size={20}
              />
            </div>

            <div
              style={{
                marginTop:
                  '10px',
                color:
                  '#35423B',
                fontSize:
                  '11px',
                fontWeight:
                  750
              }}
            >
              Match Failed
            </div>

            <div
              style={{
                marginTop:
                  '5px',
                maxWidth:
                  '390px',
                color:
                  '#89938D',
                fontSize:
                  '9px',
                lineHeight:
                  1.5
              }}
            >
              {matchError}
            </div>

            <div
              style={{
                marginTop:
                  '14px'
              }}
            >
              <ActionButton
                icon={
                  RefreshCw
                }
                onClick={
                  handleRetryMatch
                }
              >
                Retry
              </ActionButton>
            </div>
          </div>
        ) : matchResult ? (
          (() => {
            const recommendation =
              classifyRecommendation(
                matchResult
                  .best_match
                  ?.similarity_score,
                matchResult.best_match
              );

            const recNotes = {
              'Potential Equivalent Material':
                'This material strongly matches the National standard below and is recommended for harmonization review.',
              'Possible Near Duplicate':
                'Close technical overlap detected. Verify specifications before considering unification with the National standard.',
              'Different Material':
                'No sufficiently similar National standard found. This item likely requires a new national classification.'
            };

            const best =
              matchResult.best_match;

            const matches =
              matchResult.all_matches ||
              [];

            return (
              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: '13px'
                }}
              >
                {/* Original material */}
                <div
                  style={{
                    padding:
                      '13px',
                    borderRadius:
                      '13px',
                    background:
                      '#F8FAF9',
                    border:
                      '1px solid #E7EBE8'
                  }}
                >
                  <div
                    style={{
                      color:
                        '#8A938E',
                      fontSize:
                        '8px',
                      fontWeight:
                        800,
                      textTransform:
                        'uppercase'
                    }}
                  >
                    Original Material
                  </div>

                  <div
                    style={{
                      marginTop:
                        '8px',
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: '8px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          color:
                            '#35423B',
                          fontSize:
                            '10px',
                          fontWeight:
                            800
                        }}
                      >
                        {
                          matchingMaterial.cpseName
                        }
                      </div>

                      <div
                        style={{
                          marginTop:
                            '4px',
                          display:
                            'inline-block',
                          padding:
                            '4px 6px',
                          borderRadius:
                            '5px',
                          background:
                            '#EEF2EF',
                          color:
                            '#66736B',
                          fontSize:
                            '8px',
                          fontWeight:
                            700
                        }}
                      >
                        {
                          matchingMaterial.localCode
                        }{' '}
                        · CPSE{' '}
                        {
                          matchingMaterial.cpseId?.toUpperCase()
                        }
                      </div>
                    </div>

                    <Badge
                      variant={
                        MATCH_STATUS_VARIANTS[
                          matchResult
                            .match_status
                        ] ||
                        'neutral'
                      }
                    >
                      {matchResult.match_status ||
                        'Unmapped'}
                    </Badge>
                  </div>

                  <div
                    style={{
                      marginTop:
                        '8px',
                      color:
                        '#929B95',
                      fontSize:
                        '8px',
                      fontStyle:
                        'italic'
                    }}
                  >
                    Raw: "
                    {
                      matchingMaterial.rawDescription
                    }
                    "
                  </div>

                  <div
                    style={{
                      marginTop:
                        '5px',
                      color:
                        '#35423B',
                      fontSize:
                        '9px',
                      lineHeight:
                        1.45,
                      fontWeight:
                        650
                    }}
                  >
                    {
                      matchingMaterial.standardDescription
                    }
                  </div>
                </div>

                {/* Recommendation */}
                <div
                  style={{
                    padding:
                      '13px',
                    borderRadius:
                      '13px',
                    border:
                      `1px solid ${
                        recommendation.variant ===
                        'success'
                          ? '#CDEBDD'
                          : recommendation.variant ===
                              'warning'
                            ? '#F0DDAA'
                            : '#F0D1D1'
                      }`,
                    background:
                      recommendation.variant ===
                      'success'
                        ? '#F2FBF6'
                        : recommendation.variant ===
                            'warning'
                          ? '#FFFBF1'
                          : '#FFF7F7'
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: '8px',
                      flexWrap:
                        'wrap'
                    }}
                  >
                    <Badge
                      variant={
                        recommendation.variant
                      }
                    >
                      <Sparkles
                        size={10}
                      />
                      {
                        recommendation.label
                      }
                    </Badge>

                    {best && (
                      <span
                        style={{
                          color:
                            '#66736B',
                          fontSize:
                            '9px',
                          fontWeight:
                            700
                        }}
                      >
                        Best match:{' '}
                        {
                          best.national_code
                        }
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop:
                        '8px',
                      color:
                        '#56635B',
                      fontSize:
                        '9px',
                      lineHeight:
                        1.5
                    }}
                  >
                    {
                      recNotes[
                        recommendation.label
                      ]
                    }
                  </div>
                </div>

                {/* Similarity */}
                {best ? (
                  <div
                    style={{
                      padding:
                        '13px',
                      borderRadius:
                        '13px',
                      background:
                        '#F4F8FF',
                      border:
                        '1px solid #D9E5F7'
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'space-between'
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          alignItems:
                            'center',
                          gap: '6px',
                          color:
                            '#416FA8',
                          fontSize:
                            '9px',
                          fontWeight:
                            800
                        }}
                      >
                        <Sparkles
                          size={12}
                        />
                        AI Similarity Score
                      </div>

                      <span
                        style={{
                          color:
                            '#416FA8',
                          fontSize:
                            '16px',
                          fontWeight:
                            850
                        }}
                      >
                        {best.similarity_score.toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>

                    <div
                      style={{
                        height:
                          '8px',
                        marginTop:
                          '9px',
                        borderRadius:
                          '99px',
                        background:
                          '#DFEAF8',
                        overflow:
                          'hidden'
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              0,
                              best.similarity_score
                            )
                          )}%`,
                          height:
                            '100%',
                          borderRadius:
                            '99px',
                          background:
                            best.similarity_score >=
                            75
                              ? '#078A58'
                              : best.similarity_score >=
                                  50
                                ? '#D69A25'
                                : '#C53D3D'
                        }}
                      />
                    </div>

                    <div
                      style={{
                        marginTop:
                          '7px',
                        color:
                          '#89938D',
                        fontSize:
                          '8px'
                      }}
                    >
                      Against{' '}
                      {
                        best.standard_description
                      }
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      padding:
                        '20px',
                      borderRadius:
                        '12px',
                      background:
                        '#FFF7F7',
                      border:
                        '1px solid #F0D1D1',
                      textAlign:
                        'center'
                    }}
                  >
                    <AlertCircle
                      size={20}
                      color="#C53D3D"
                    />

                    <div
                      style={{
                        marginTop:
                          '7px',
                        color:
                          '#35423B',
                        fontSize:
                          '10px',
                        fontWeight:
                          750
                      }}
                    >
                      No Matching Standards Found
                    </div>

                    <div
                      style={{
                        marginTop:
                          '4px',
                        color:
                          '#89938D',
                        fontSize:
                          '8px'
                      }}
                    >
                      No National standard exceeded
                      the similarity threshold.
                    </div>
                  </div>
                )}

                {/* Candidate matches */}
                <div>
                  <SectionTitle
                    icon={Database}
                    title={`Top Matching Materials (${matches.length})`}
                    subtitle="Ranked National Material Master candidates"
                    tone="blue"
                  />

                  {matches.length >
                  0 ? (
                    <div
                      style={{
                        border:
                          '1px solid #E7EBE8',
                        borderRadius:
                          '11px',
                        overflow:
                          'hidden'
                      }}
                    >
                      <div
                        style={{
                          overflowX:
                            'auto'
                        }}
                      >
                        <table
                          style={{
                            width:
                              '100%',
                            minWidth:
                              '620px',
                            borderCollapse:
                              'collapse'
                          }}
                        >
                          <thead>
                            <tr>
                              {[
                                'National Code',
                                'Description',
                                'Category',
                                'Unit',
                                'Similarity'
                              ].map(
                                (
                                  heading
                                ) => (
                                  <th
                                    key={
                                      heading
                                    }
                                    style={{
                                      padding:
                                        '9px',
                                      background:
                                        '#F8FAF9',
                                      color:
                                        '#8A938E',
                                      textAlign:
                                        'left',
                                      fontSize:
                                        '8px',
                                      fontWeight:
                                        800
                                    }}
                                  >
                                    {
                                      heading
                                    }
                                  </th>
                                )
                              )}
                            </tr>
                          </thead>

                          <tbody>
                            {matches.map(
                              (
                                match,
                                idx
                              ) => (
                                <tr
                                  key={
                                    idx
                                  }
                                >
                                  <td
                                    style={{
                                      padding:
                                        '9px',
                                      borderTop:
                                        '1px solid #EFF2F0',
                                      color:
                                        '#078A58',
                                      fontSize:
                                        '8px',
                                      fontWeight:
                                        800
                                    }}
                                  >
                                    {
                                      match.national_code
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        '9px',
                                      borderTop:
                                        '1px solid #EFF2F0',
                                      color:
                                        '#56635B',
                                      fontSize:
                                        '8px',
                                      maxWidth:
                                        '200px'
                                    }}
                                  >
                                    {
                                      match.standard_description
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        '9px',
                                      borderTop:
                                        '1px solid #EFF2F0'
                                    }}
                                  >
                                    <Badge variant="neutral">
                                      {
                                        match.category
                                      }
                                    </Badge>
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        '9px',
                                      borderTop:
                                        '1px solid #EFF2F0',
                                      color:
                                        '#56635B',
                                      fontSize:
                                        '8px',
                                      fontWeight:
                                        700
                                    }}
                                  >
                                    {
                                      match.unit ||
                                      'NOS'
                                    }
                                  </td>

                                  <td
                                    style={{
                                      padding:
                                        '9px',
                                      borderTop:
                                        '1px solid #EFF2F0'
                                    }}
                                  >
                                    <Badge
                                      variant={
                                        match.similarity_score >=
                                        75
                                          ? 'success'
                                          : match.similarity_score >=
                                              50
                                            ? 'warning'
                                            : 'danger'
                                      }
                                    >
                                      {match.similarity_score.toFixed(
                                        1
                                      )}
                                      %
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding:
                          '16px',
                        borderRadius:
                          '11px',
                        background:
                          '#F8FAF9',
                        color:
                          '#89938D',
                        textAlign:
                          'center',
                        fontSize:
                          '9px'
                      }}
                    >
                      No candidate matches returned by
                      the AI matcher.
                    </div>
                  )}
                </div>

                {/* Human Review */}
                <div
                  style={{
                    padding:
                      '14px',
                    borderRadius:
                      '13px',
                    background:
                      '#FFFFFF',
                    border:
                      '1px solid #E2E9E5'
                  }}
                >
                  <div
                    style={{
                      display:
                        'flex',
                      alignItems:
                        'center',
                      justifyContent:
                        'space-between',
                      gap: '8px',
                      marginBottom:
                        '11px'
                    }}
                  >
                    <div
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '7px',
                        color:
                          '#35423B',
                        fontSize:
                          '10px',
                        fontWeight:
                          800
                      }}
                    >
                      <ShieldCheck
                        size={14}
                        color="#078A58"
                      />
                      Human Review & Approval
                    </div>

                    <Badge
                      variant={
                        MATCH_STATUS_VARIANTS[
                          matchResult.match_status
                        ] ||
                        'neutral'
                      }
                    >
                      {
                        matchResult.match_status ||
                        'Unmapped'
                      }
                    </Badge>
                  </div>

                  {matchResult.mapping_id ? (
                    <>
                      <label
                        style={{
                          display:
                            'block',
                          marginBottom:
                            '5px',
                          color:
                            '#69756E',
                          fontSize:
                            '8px',
                          fontWeight:
                            750
                        }}
                      >
                        Review Comment
                      </label>

                      <textarea
                        rows={3}
                        placeholder="Add custodian notes for this AI recommendation..."
                        value={
                          reviewComment
                        }
                        onChange={(e) =>
                          setReviewComment(
                            e.target.value
                          )
                        }
                        disabled={
                          isReviewSubmitting
                        }
                        style={{
                          width:
                            '100%',
                          boxSizing:
                            'border-box',
                          padding:
                            '9px',
                          borderRadius:
                            '9px',
                          border:
                            '1px solid #DDE5E0',
                          background:
                            '#FAFBFA',
                          color:
                            '#35423B',
                          outline:
                            'none',
                          resize:
                            'vertical',
                          fontSize:
                            '9px',
                          lineHeight:
                            1.45
                        }}
                      />

                      {reviewError && (
                        <div
                          style={{
                            marginTop:
                              '7px',
                            padding:
                              '8px',
                            borderRadius:
                              '7px',
                            background:
                              '#FFF0F0',
                            color:
                              '#B83D3D',
                            fontSize:
                              '8px'
                          }}
                        >
                          {
                            reviewError
                          }
                        </div>
                      )}

                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'flex-end',
                          gap: '7px',
                          marginTop:
                            '10px'
                        }}
                      >
                        <ActionButton
                          variant="danger"
                          icon={
                            XCircle
                          }
                          disabled={
                            isReviewSubmitting
                          }
                          onClick={() =>
                            handleReviewAction(
                              matchingMaterial.id,
                              matchResult.mapping_id,
                              'Rejected'
                            )
                          }
                        >
                          {isReviewSubmitting
                            ? 'Submitting...'
                            : 'Reject Match'}
                        </ActionButton>

                        <ActionButton
                          variant="primary"
                          icon={
                            CheckCircle2
                          }
                          disabled={
                            isReviewSubmitting
                          }
                          onClick={() =>
                            handleReviewAction(
                              matchingMaterial.id,
                              matchResult.mapping_id,
                              'Approved'
                            )
                          }
                        >
                          {isReviewSubmitting
                            ? 'Submitting...'
                            : 'Approve Match'}
                        </ActionButton>
                      </div>

                      <div
                        style={{
                          marginTop:
                            '8px',
                          color:
                            '#9AA39E',
                          fontSize:
                            '8px',
                          lineHeight:
                            1.4
                        }}
                      >
                        Original material and CPSE
                        code are preserved. Approval
                        confirms the mapping and is
                        recorded in the audit log.
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        padding:
                          '10px',
                        borderRadius:
                          '8px',
                        background:
                          '#F8FAF9',
                        color:
                          '#89938D',
                        fontSize:
                          '8px',
                        lineHeight:
                          1.5
                      }}
                    >
                      No mapping is pending review for
                      this material yet — run matching
                      again to generate one.
                    </div>
                  )}
                </div>
              </div>
            );
          })()
        ) : null}
      </Drawer>

      <style>
        {`
          @keyframes materialSearchSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1200px) {
            .material-search-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 850px) {
            .material-search-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default MaterialSearchPage;