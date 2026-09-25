import React, { useState, useEffect, useMemo } from 'react';
import {
  Copy,
  Sparkles,
  CheckCircle2,
  SlidersHorizontal,
  IndianRupee,
  Layers3,
  RefreshCw,
  Filter,
  AlertCircle,
  Building2,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Search,
  X,
  GitMerge,
  Database,
  CircleAlert
} from 'lucide-react';

import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import {
  getDuplicateClusters,
  detectDuplicateClusters
} from '../services/api';

const STATUS_VARIANTS = {
  Confirmed: 'success',
  'Duplicate Cluster': 'danger',
  'Under Review': 'warning',
  Unmapped: 'neutral'
};

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

const formatRupees = (value) => {
  const amount = Number(value || 0);

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(amount / 100000).toFixed(2)} Lakhs`;
};

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString('en-IN')}`;

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
      border: `1px solid ${disabled ? '#D1D5DB' : COLORS.green}`,
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
    red: {
      bg: COLORS.redSoft,
      color: COLORS.red
    },
    amber: {
      bg: COLORS.amberSoft,
      color: COLORS.amber
    },
    blue: {
      bg: COLORS.blueSoft,
      color: COLORS.blue
    }
  };

  const selected = toneMap[tone] || toneMap.green;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '15px 16px',
        minWidth: 0
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '10px'
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

        <span
          style={{
            fontSize: '10px',
            color: COLORS.textMuted,
            fontWeight: 700
          }}
        >
          AI
        </span>
      </div>

      <div
        style={{
          marginTop: '14px',
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
          lineHeight: 1.2,
          fontWeight: 800,
          color: COLORS.text
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: '5px',
          fontSize: '10px',
          lineHeight: 1.45,
          color:
            tone === 'green'
              ? COLORS.green
              : COLORS.textSecondary
        }}
      >
        {helper}
      </div>
    </div>
  );
};

const SelectField = ({
  icon,
  label,
  value,
  onChange,
  options,
  width = '190px'
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '7px',
      minWidth: 0
    }}
  >
    {icon && (
      <span style={{ color: COLORS.textMuted, display: 'flex' }}>
        {icon}
      </span>
    )}

    <span
      style={{
        fontSize: '11px',
        fontWeight: 700,
        color: COLORS.textSecondary,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>

    <select
      value={value}
      onChange={onChange}
      style={{
        width,
        height: '34px',
        borderRadius: '9px',
        border: `1px solid ${COLORS.border}`,
        background: COLORS.white,
        padding: '0 10px',
        color: COLORS.text,
        fontSize: '11px',
        outline: 'none'
      }}
    >
      {options}
    </select>
  </div>
);

export const DuplicateDetectionPage = ({
  setActiveTab,
  showToast
}) => {
  const [similarityThreshold, setSimilarityThreshold] =
    useState(80);

  const [selectedCpse, setSelectedCpse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [clusters, setClusters] = useState([]);
  const [stats, setStats] = useState({
    clusters_found: 0,
    total_duplicates: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedCluster, setSelectedCluster] =
    useState(null);

  const [isMergeModalOpen, setIsMergeModalOpen] =
    useState(false);

  const [draftDescription, setDraftDescription] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      getDuplicateClusters(similarityThreshold, 500)
        .then((data) => {
          if (cancelled) return;

          const incomingClusters = data.clusters || [];

          setClusters(incomingClusters);

          setStats({
            clusters_found: data.clusters_found || 0,
            total_duplicates: data.total_duplicates || 0
          });

          setSelectedCluster((prev) => {
            if (
              prev &&
              incomingClusters.some(
                (cluster) =>
                  cluster.cluster_id === prev.cluster_id
              )
            ) {
              return prev;
            }

            return incomingClusters[0] || null;
          });
        })
        .catch((err) => {
          if (cancelled) return;

          setError(
            err.message ||
              'Failed to load duplicate clusters'
          );

          setClusters([]);
          setSelectedCluster(null);
        })
        .finally(() => {
          if (!cancelled) {
            setIsLoading(false);
          }
        });
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [similarityThreshold, refreshKey]);

  const clusterLockedValue = (cluster) =>
    (cluster.materials || []).reduce(
      (sum, material) =>
        sum +
        (material.unit_cost || 0) *
          (material.stock_qty || 0),
      0
    );

  const cpseOptions = useMemo(() => {
    const map = new Map();

    clusters.forEach((cluster) => {
      (cluster.materials || []).forEach((material) => {
        if (material.cpse_id) {
          map.set(
            material.cpse_id,
            material.cpse_name || material.cpse_id
          );
        }
      });
    });

    return Array.from(
      map,
      ([id, name]) => ({ id, name })
    );
  }, [clusters]);

  const categoryOptions = useMemo(() => {
    const set = new Set(
      clusters
        .map((cluster) => cluster.category)
        .filter(Boolean)
    );

    return Array.from(set);
  }, [clusters]);

  const statusOptions = useMemo(() => {
    const set = new Set(
      clusters
        .flatMap((cluster) =>
          (cluster.materials || []).map(
            (material) => material.status
          )
        )
        .filter(Boolean)
    );

    return Array.from(set);
  }, [clusters]);

  const filteredClusters = useMemo(() => {
    return clusters.filter((cluster) => {
      if (
        selectedCpse !== 'all' &&
        !(cluster.materials || []).some(
          (material) =>
            material.cpse_id === selectedCpse
        )
      ) {
        return false;
      }

      if (
        selectedCategory !== 'ALL' &&
        cluster.category !== selectedCategory
      ) {
        return false;
      }

      if (
        selectedStatus !== 'ALL' &&
        !(cluster.materials || []).some(
          (material) =>
            material.status === selectedStatus
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    clusters,
    selectedCpse,
    selectedCategory,
    selectedStatus
  ]);

  const lockedInventory = useMemo(
    () =>
      clusters.reduce(
        (sum, cluster) =>
          sum + clusterLockedValue(cluster),
        0
      ),
    [clusters]
  );

  const resetFilters = () => {
    setSelectedCpse('all');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
  };

  const handleRunDetection = async () => {
    setIsDetecting(true);

    try {
      const data = await detectDuplicateClusters(
        similarityThreshold,
        500
      );

      setStats({
        clusters_found: data.clusters_found || 0,
        total_duplicates: data.total_duplicates || 0
      });

      showToast(
        `Detection complete: ${data.clusters_found} clusters, ${data.total_duplicates} duplicate items`,
        'success'
      );

      const fresh = await getDuplicateClusters(
        similarityThreshold,
        500
      );

      const freshClusters = fresh.clusters || [];

      setClusters(freshClusters);

      setSelectedCluster((prev) => {
        if (
          prev &&
          freshClusters.some(
            (cluster) =>
              cluster.cluster_id === prev.cluster_id
          )
        ) {
          return prev;
        }

        return freshClusters[0] || null;
      });
    } catch (err) {
      showToast(
        err.message || 'Duplicate detection failed',
        'danger'
      );
    } finally {
      setIsDetecting(false);
    }
  };

  const handleOpenMergeModal = (cluster) => {
    setSelectedCluster(cluster);

    const primary = cluster.materials?.[0];

    setDraftDescription(
      primary?.cleaned_description ||
        primary?.description ||
        ''
    );

    setIsMergeModalOpen(true);
  };

  const handleConfirmMerge = () => {
    setIsMergeModalOpen(false);

    showToast(
      `Merge request for cluster #${selectedCluster?.cluster_id} (${selectedCluster?.material_count} items) queued for approval review`,
      'success'
    );
  };

  const selectedCpseNames = selectedCluster
    ? Array.from(
        new Set(
          (selectedCluster.materials || [])
            .map(
              (material) =>
                material.cpse_name ||
                material.cpse_id
            )
            .filter(Boolean)
        )
      )
    : [];

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
                background: COLORS.redSoft,
                color: COLORS.red,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Copy size={19} />
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
                Duplicate Detection
              </h2>

              <p
                style={{
                  margin: '5px 0 0',
                  fontSize: '12px',
                  color: COLORS.textSecondary
                }}
              >
                Identify and resolve cross-CPSE duplicate
                material records using AI similarity analysis.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            flexWrap: 'wrap'
          }}
        >
          {/* Threshold */}
          <div
            style={{
              height: '40px',
              padding: '0 12px',
              borderRadius: '10px',
              border: `1px solid ${COLORS.border}`,
              background: COLORS.white,
              display: 'flex',
              alignItems: 'center',
              gap: '9px'
            }}
          >
            <SlidersHorizontal
              size={15}
              color={COLORS.textMuted}
            />

            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: COLORS.textSecondary,
                whiteSpace: 'nowrap'
              }}
            >
              Similarity
            </span>

            <input
              type="range"
              min="50"
              max="100"
              step="1"
              value={similarityThreshold}
              onChange={(event) =>
                setSimilarityThreshold(
                  Number(event.target.value)
                )
              }
              style={{
                width: '100px',
                accentColor: COLORS.green,
                cursor: 'pointer'
              }}
            />

            <span
              style={{
                minWidth: '42px',
                textAlign: 'right',
                fontSize: '12px',
                fontWeight: 800,
                color: COLORS.green
              }}
            >
              {similarityThreshold}%+
            </span>
          </div>

          <PrimaryButton
            onClick={handleRunDetection}
            disabled={isDetecting}
            icon={
              <RefreshCw
                size={14}
                style={
                  isDetecting
                    ? {
                        animation:
                          'spin 1s linear infinite'
                      }
                    : undefined
                }
              />
            }
          >
            {isDetecting
              ? 'Detecting...'
              : 'Run Detection'}
          </PrimaryButton>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '14px'
        }}
      >
        <StatCard
          icon={<Copy size={18} />}
          label="Duplicate Clusters"
          value={stats.clusters_found.toLocaleString(
            'en-IN'
          )}
          helper={`Across ${cpseOptions.length || 0} CPSE enterprises`}
          tone="red"
        />

        <StatCard
          icon={<Layers3 size={18} />}
          label="Duplicate Items"
          value={stats.total_duplicates.toLocaleString(
            'en-IN'
          )}
          helper="Records grouped by similarity"
          tone="amber"
        />

        <StatCard
          icon={<IndianRupee size={18} />}
          label="Locked Inventory"
          value={formatRupees(lockedInventory)}
          helper="Stock tied in duplicate records"
          tone="green"
        />

        <StatCard
          icon={<Database size={18} />}
          label="Detection Threshold"
          value={`${similarityThreshold}%`}
          helper="Current AI matching threshold"
          tone="blue"
        />
      </div>

      {/* Filter Bar */}
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
            gap: '14px',
            flexWrap: 'wrap'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              paddingRight: '4px'
            }}
          >
            <Filter
              size={14}
              color={COLORS.green}
            />

            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              Filters
            </span>
          </div>

          <SelectField
            icon={<Building2 size={13} />}
            label="CPSE"
            value={selectedCpse}
            onChange={(event) =>
              setSelectedCpse(event.target.value)
            }
            width="190px"
            options={
              <>
                <option value="all">
                  All CPSE Enterprises
                </option>

                {cpseOptions.map((cpse) => (
                  <option
                    key={cpse.id}
                    value={cpse.id}
                  >
                    {cpse.id.toUpperCase()} - {cpse.name}
                  </option>
                ))}
              </>
            }
          />

          <SelectField
            label="Category"
            value={selectedCategory}
            onChange={(event) =>
              setSelectedCategory(event.target.value)
            }
            width="170px"
            options={
              <>
                <option value="ALL">
                  All Categories
                </option>

                {categoryOptions.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </>
            }
          />

          <SelectField
            label="Status"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
            width="160px"
            options={
              <>
                <option value="ALL">
                  All Statuses
                </option>

                {statusOptions.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {status}
                  </option>
                ))}
              </>
            }
          />

          <div style={{ marginLeft: 'auto' }}>
            <SecondaryButton
              onClick={resetFilters}
              icon={<RotateCcw size={13} />}
            >
              Reset
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div
          style={{
            ...cardStyle,
            minHeight: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div>
            <div
              style={{
                width: '54px',
                height: '54px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw
                size={24}
                style={{
                  animation:
                    'spin 1s linear infinite'
                }}
              />
            </div>

            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              {similarityThreshold >= 80
                ? 'Running AI duplicate detection...'
                : 'Re-running duplicate scan...'}
            </div>

            <div
              style={{
                marginTop: '5px',
                fontSize: '11px',
                color: COLORS.textSecondary
              }}
            >
              Comparing material specifications across
              participating CPSE registers.
            </div>
          </div>
        </div>
      ) : error ? (
        <div
          style={{
            ...cardStyle,
            minHeight: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '30px'
          }}
        >
          <div style={{ maxWidth: '470px' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                background: COLORS.redSoft,
                color: COLORS.red,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={25} />
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              Failed to Load Duplicate Data
            </div>

            <div
              style={{
                marginTop: '6px',
                fontSize: '11px',
                lineHeight: 1.6,
                color: COLORS.textSecondary
              }}
            >
              {error}
            </div>

            <div
              style={{
                marginTop: '17px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <SecondaryButton
                onClick={() =>
                  setRefreshKey((key) => key + 1)
                }
                icon={<RefreshCw size={13} />}
              >
                Retry
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : filteredClusters.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            minHeight: '420px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '30px'
          }}
        >
          <div style={{ maxWidth: '470px' }}>
            <div
              style={{
                width: '58px',
                height: '58px',
                margin: '0 auto 16px',
                borderRadius: '16px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShieldCheck size={25} />
            </div>

            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              No Duplicate Clusters Found
            </div>

            <div
              style={{
                marginTop: '6px',
                fontSize: '11px',
                lineHeight: 1.6,
                color: COLORS.textSecondary
              }}
            >
              No clusters match the current similarity range
              or filters. Lower the threshold or reset the
              filters.
            </div>

            <div
              style={{
                marginTop: '17px',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <SecondaryButton
                onClick={() => {
                  resetFilters();
                  setSimilarityThreshold(80);
                }}
                icon={<RotateCcw size={13} />}
              >
                Reset Filters
              </SecondaryButton>
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(320px, 0.82fr) minmax(500px, 1.55fr)',
            gap: '14px',
            alignItems: 'start'
          }}
        >
          {/* Cluster List */}
          <div
            style={{
              ...cardStyle,
              padding: '15px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: COLORS.text
                  }}
                >
                  Duplicate Clusters
                </div>

                <div
                  style={{
                    marginTop: '3px',
                    fontSize: '10px',
                    color: COLORS.textSecondary
                  }}
                >
                  Select a cluster to inspect
                </div>
              </div>

              <Badge variant="neutral">
                {filteredClusters.length} found
              </Badge>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '690px',
                overflowY: 'auto',
                paddingRight: '2px'
              }}
            >
              {filteredClusters.map((cluster) => {
                const isSelected =
                  selectedCluster?.cluster_id ===
                  cluster.cluster_id;

                const cpseNames = Array.from(
                  new Set(
                    (cluster.materials || [])
                      .map(
                        (material) =>
                          material.cpse_name ||
                          material.cpse_id
                      )
                      .filter(Boolean)
                  )
                );

                return (
                  <button
                    key={cluster.cluster_id}
                    onClick={() =>
                      setSelectedCluster(cluster)
                    }
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px',
                      borderRadius: '13px',
                      border: `1px solid ${
                        isSelected
                          ? COLORS.greenBorder
                          : COLORS.border
                      }`,
                      background: isSelected
                        ? COLORS.greenSoft
                        : COLORS.white,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent:
                          'space-between',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: COLORS.green
                          }}
                        >
                          CLUSTER #
                          {cluster.cluster_id}
                        </div>

                        <div
                          style={{
                            marginTop: '4px',
                            fontSize: '13px',
                            fontWeight: 800,
                            color: COLORS.text
                          }}
                        >
                          {cluster.category ||
                            'Uncategorized'}{' '}
                          Overlap
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 7px',
                          borderRadius: '7px',
                          background: COLORS.purpleSoft,
                          color: COLORS.purple,
                          fontSize: '10px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Sparkles size={10} />
                        {cluster.avg_similarity}%
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '10px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        color: COLORS.textSecondary,
                        fontSize: '10px',
                        lineHeight: 1.5
                      }}
                    >
                      <Building2
                        size={12}
                        style={{
                          flexShrink: 0,
                          marginTop: '1px'
                        }}
                      />

                      <span>
                        {cpseNames.join(', ') || '—'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',
                        gap: '8px',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: `1px solid ${
                          isSelected
                            ? '#D1FAE5'
                            : COLORS.borderSoft
                        }`
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          color: COLORS.textSecondary
                        }}
                      >
                        {cluster.material_count}{' '}
                        Duplicate Items
                      </span>

                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: COLORS.greenDark
                        }}
                      >
                        {formatRupees(
                          clusterLockedValue(cluster)
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspector */}
          {selectedCluster && (
            <div
              style={{
                ...cardStyle,
                overflow: 'hidden'
              }}
            >
              {/* Inspector Header */}
              <div
                style={{
                  padding: '16px 18px',
                  borderBottom: `1px solid ${COLORS.border}`,
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
                      gap: '8px'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '9px',
                        background: COLORS.blueSoft,
                        color: COLORS.blue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Layers3 size={16} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 800,
                          color: COLORS.text
                        }}
                      >
                        Cluster Deep-Dive
                      </div>

                      <div
                        style={{
                          marginTop: '2px',
                          fontSize: '10px',
                          color: COLORS.textSecondary
                        }}
                      >
                        Cluster #
                        {selectedCluster.cluster_id} ·{' '}
                        {selectedCluster.category ||
                          'Uncategorized'}
                      </div>
                    </div>
                  </div>
                </div>

                <PrimaryButton
                  onClick={() =>
                    handleOpenMergeModal(
                      selectedCluster
                    )
                  }
                  icon={<GitMerge size={14} />}
                >
                  Merge & Deduplicate
                </PrimaryButton>
              </div>

              {/* Impact Summary */}
              <div
                style={{
                  padding: '13px 18px'
                }}
              >
                <div
                  style={{
                    padding: '12px 13px',
                    borderRadius: '11px',
                    background: COLORS.amberSoft,
                    border: `1px solid ${COLORS.amberBorder}`,
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
                        fontSize: '9px',
                        fontWeight: 800,
                        color: COLORS.amber,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Financial Impact
                    </div>

                    <div
                      style={{
                        marginTop: '3px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#92400E'
                      }}
                    >
                      Locked Inventory:{' '}
                      {formatRupees(
                        clusterLockedValue(
                          selectedCluster
                        )
                      )}
                    </div>
                  </div>

                  <Badge variant="warning">
                    {selectedCluster.avg_similarity}%
                    similarity
                  </Badge>
                </div>
              </div>

              {/* CPSE Summary */}
              <div
                style={{
                  padding: '0 18px 14px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      color: COLORS.textSecondary
                    }}
                  >
                    Affected CPSEs:
                  </span>

                  {selectedCpseNames.map(
                    (name, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '4px 7px',
                          borderRadius: '6px',
                          background: COLORS.slateSoft,
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.textSecondary,
                          fontSize: '9px',
                          fontWeight: 700
                        }}
                      >
                        {name}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Candidate Table */}
              <div
                style={{
                  padding: '0 18px 16px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '9px'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        color: COLORS.text
                      }}
                    >
                      Candidate Materials
                    </div>

                    <div
                      style={{
                        marginTop: '2px',
                        fontSize: '9px',
                        color: COLORS.textSecondary
                      }}
                    >
                      Records included in this duplicate
                      cluster
                    </div>
                  </div>

                  <Badge variant="neutral">
                    {selectedCluster.materials
                      ?.length || 0}{' '}
                    records
                  </Badge>
                </div>

                <div
                  style={{
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '12px',
                    overflowX: 'auto'
                  }}
                >
                  <table
                    style={{
                      width: '100%',
                      minWidth: '850px',
                      borderCollapse: 'collapse',
                      fontSize: '11px'
                    }}
                  >
                    <thead>
                      <tr>
                        {[
                          'CPSE & Code',
                          'Original Description',
                          'Standardized Description',
                          'Unit Cost',
                          'Stock',
                          'Match',
                          'Similarity',
                          'Status'
                        ].map((heading) => (
                          <th
                            key={heading}
                            style={{
                              padding: '10px 9px',
                              textAlign: 'left',
                              background: COLORS.slateSoft,
                              borderBottom: `1px solid ${COLORS.border}`,
                              color: COLORS.textSecondary,
                              fontSize: '9px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.035em',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {heading}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {(
                        selectedCluster.materials || []
                      ).map((candidate, index) => (
                        <tr key={index}>
                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              verticalAlign: 'top'
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                color: COLORS.text,
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {candidate.cpse_name ||
                                candidate.cpse_id}
                            </div>

                            <div
                              style={{
                                marginTop: '4px',
                                padding: '3px 5px',
                                display: 'inline-block',
                                borderRadius: '5px',
                                background: COLORS.slateSoft,
                                color: COLORS.textSecondary,
                                fontSize: '9px',
                                fontFamily:
                                  'monospace'
                              }}
                            >
                              {candidate.material_code}
                            </div>
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              color: COLORS.textSecondary,
                              maxWidth: '170px',
                              lineHeight: 1.45,
                              verticalAlign: 'top'
                            }}
                          >
                            "
                            {candidate.raw_description ||
                              candidate.description}
                            "
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              color: COLORS.text,
                              fontWeight: 600,
                              maxWidth: '170px',
                              lineHeight: 1.45,
                              verticalAlign: 'top'
                            }}
                          >
                            {candidate.cleaned_description ||
                              candidate.description}
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              color: COLORS.text,
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              verticalAlign: 'top'
                            }}
                          >
                            {formatINR(
                              candidate.unit_cost
                            )}
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              color: COLORS.text,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              verticalAlign: 'top'
                            }}
                          >
                            {candidate.stock_qty} NOS
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              verticalAlign: 'top'
                            }}
                          >
                            <Badge variant="ai">
                              AI Vector
                            </Badge>
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              verticalAlign: 'top'
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                padding: '4px 7px',
                                borderRadius: '6px',
                                background:
                                  COLORS.purpleSoft,
                                color: COLORS.purple,
                                fontSize: '9px',
                                fontWeight: 800
                              }}
                            >
                              {
                                selectedCluster.avg_similarity
                              }
                              %
                            </span>
                          </td>

                          <td
                            style={{
                              padding: '11px 9px',
                              borderBottom:
                                index <
                                selectedCluster.materials
                                  .length -
                                  1
                                  ? `1px solid ${COLORS.borderSoft}`
                                  : 'none',
                              verticalAlign: 'top'
                            }}
                          >
                            <Badge
                              variant={
                                STATUS_VARIANTS[
                                  candidate.status
                                ] || 'neutral'
                              }
                            >
                              {candidate.status ||
                                'Unmapped'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Reasoning */}
              <div
                style={{
                  margin: '0 18px 18px',
                  padding: '13px',
                  borderRadius: '11px',
                  background: COLORS.purpleSoft,
                  border: '1px solid #DDD6FE'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '9px'
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: COLORS.white,
                      color: COLORS.purple,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Sparkles size={14} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#5B21B6'
                      }}
                    >
                      AI Recommendation
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        fontSize: '10px',
                        lineHeight: 1.6,
                        color: '#6D5AA8'
                      }}
                    >
                      These{' '}
                      <strong>
                        {selectedCluster.material_count}
                      </strong>{' '}
                      items from{' '}
                      <strong>
                        {selectedCpseNames.join(', ')}
                      </strong>{' '}
                      were grouped into a duplicate cluster
                      at{' '}
                      <strong>
                        {selectedCluster.avg_similarity}%
                      </strong>{' '}
                      vector similarity. Review the
                      standardized descriptions and route the
                      unification through the human approval
                      workflow before any master-code merge.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Merge Modal */}
      <Modal
        isOpen={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        title={`Merge Duplicate Cluster: #${selectedCluster?.cluster_id}`}
        subtitle="Unify redundant CPSE item master records into National Material Master"
        maxWidth="600px"
        footer={
          <>
            <SecondaryButton
              onClick={() =>
                setIsMergeModalOpen(false)
              }
            >
              Cancel
            </SecondaryButton>

            <PrimaryButton
              onClick={handleConfirmMerge}
              icon={<CheckCircle2 size={15} />}
            >
              Queue Master Merge
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
          {/* Cluster Summary */}
          <div
            style={{
              padding: '14px',
              borderRadius: '12px',
              background: COLORS.redSoft,
              border: '1px solid #FECACA'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '9px',
                    color: COLORS.red,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  Duplicate Cluster
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '14px',
                    color: COLORS.text,
                    fontWeight: 800
                  }}
                >
                  #{selectedCluster?.cluster_id}
                </div>
              </div>

              <Badge variant="danger">
                {selectedCluster?.avg_similarity}%
              </Badge>
            </div>

            <div
              style={{
                marginTop: '8px',
                fontSize: '10px',
                lineHeight: 1.5,
                color: COLORS.textSecondary
              }}
            >
              {selectedCluster?.material_count} local
              material records will be included in this merge
              request.
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '11px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              Standardized Master Material Description
            </label>

            <textarea
              rows={4}
              value={draftDescription}
              onChange={(event) =>
                setDraftDescription(
                  event.target.value
                )
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                borderRadius: '10px',
                border: `1px solid ${COLORS.border}`,
                padding: '10px 11px',
                fontFamily: 'inherit',
                fontSize: '11px',
                lineHeight: 1.5,
                color: COLORS.text,
                outline: 'none'
              }}
            />
          </div>

          {/* Material List */}
          <div>
            <div
              style={{
                marginBottom: '7px',
                fontSize: '11px',
                fontWeight: 800,
                color: COLORS.text
              }}
            >
              Records Included
            </div>

            <div
              style={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: '10px',
                overflow: 'hidden'
              }}
            >
              {(selectedCluster?.materials || []).map(
                (material, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '9px 11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'space-between',
                      gap: '10px',
                      borderBottom:
                        index <
                        selectedCluster.materials.length -
                          1
                          ? `1px solid ${COLORS.borderSoft}`
                          : 'none'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: COLORS.text
                        }}
                      >
                        {material.cpse_name ||
                          material.cpse_id}
                      </div>

                      <div
                        style={{
                          marginTop: '2px',
                          fontSize: '9px',
                          color: COLORS.textSecondary,
                          fontFamily:
                            'monospace'
                        }}
                      >
                        {material.material_code}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: '9px',
                        color: COLORS.textSecondary,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {material.stock_qty} NOS
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Approval Notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '9px',
              padding: '11px 12px',
              borderRadius: '10px',
              background: COLORS.blueSoft,
              border: `1px solid ${COLORS.blueBorder}`,
              color: '#1D4ED8',
              fontSize: '10px',
              lineHeight: 1.55
            }}
          >
            <ShieldCheck
              size={15}
              style={{ flexShrink: 0 }}
            />

            <span>
              This action creates a merge request for human
              approval. No material records are merged
              automatically.
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

          @media (max-width: 1100px) {
            .duplicate-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default DuplicateDetectionPage;