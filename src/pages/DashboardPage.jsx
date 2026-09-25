import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  Copy,
  TrendingUp,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
  XCircle,
  AlertCircle,
  Search,
  GitMerge,
  GitCompare,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

import Badge from '../components/common/Badge';
import { AUDIT_LOGS } from '../data/mockData';
import {
  getDashboardStats,
  getAuditLogs
} from '../services/api';

export const DashboardPage = ({
  setActiveTab,
  showToast
}) => {
  const [stats, setStats] = useState({
    total_materials: 0,
    standard_materials: 0,
    total_cpses: 0,
    confirmed_matches: 0,
    under_review: 0,
    rejected_matches: 0,
    potential_duplicates: 0,
    ai_accuracy_percent: null,
    estimated_savings_cr: null,
    cpses: [],
    pending_recommendations: []
  });

  const [isStatsLoading, setIsStatsLoading] =
    useState(true);

  const [statsError, setStatsError] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [auditLogs, setAuditLogs] =
    useState(AUDIT_LOGS);

  /* =========================================================
     API DATA
  ========================================================== */

  useEffect(() => {
    setIsStatsLoading(true);
    setStatsError(null);

    getDashboardStats()
      .then((data) => {
        if (data) {
          setStats({
            total_materials: data.total_materials || 0,
            standard_materials:
              data.standard_materials || 0,
            total_cpses:
              data.total_cpses || 0,
            confirmed_matches:
              data.confirmed_matches || 0,
            under_review:
              data.under_review || 0,
            rejected_matches:
              data.rejected_matches || 0,
            potential_duplicates:
              data.potential_duplicates || 0,
            ai_accuracy_percent:
              data.ai_accuracy_percent ?? null,
            estimated_savings_cr:
              data.estimated_savings_cr ?? null,
            cpses: data.cpses || [],
            pending_recommendations:
              data.pending_recommendations || []
          });
        }
      })
      .catch((err) => {
        setStatsError(
          err.message ||
          'Failed to load dashboard statistics'
        );
      })
      .finally(() => {
        setIsStatsLoading(false);
      });

    getAuditLogs()
      .then((logs) => {
        if (Array.isArray(logs) && logs.length > 0) {
          setAuditLogs(
            logs.map((l) => ({
              id: `AUD-${l.id}`,
              timestamp: new Date(
                l.timestamp
              ).toLocaleString(),
              eventType: l.action,
              cpse: 'NTPC & CPSEs',
              actor: l.user,
              description: l.new_value
                ? (
                    l.new_value.length > 80
                      ? `${l.new_value.substring(
                          0,
                          80
                        )}...`
                      : l.new_value
                  )
                : l.action,
              status: 'Verified'
            }))
          );
        }
      })
      .catch(() => {});
  }, [refreshKey]);

  /* =========================================================
     CALCULATED VALUES
  ========================================================== */

  const confirmedRate =
    stats.total_materials > 0
      ? (
          (stats.confirmed_matches /
            stats.total_materials) *
          100
        ).toFixed(1)
      : '0.0';

  const activeCpses =
    stats.cpses.filter(
      (c) => c.material_count > 0
    ).length;

  const standardizationRate =
    stats.total_materials > 0
      ? Math.round(
          (stats.standard_materials /
            stats.total_materials) *
            100
        )
      : 0;

  /* =========================================================
     HELPERS
  ========================================================== */

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString('en-IN');
  };

  const getEventBadgeVariant = (eventType = '') => {
    const event = eventType.toUpperCase();

    if (
      event.includes('APPROVE') ||
      event.includes('CONFIRM')
    ) {
      return 'success';
    }

    if (
      event.includes('MERGE') ||
      event.includes('MAP')
    ) {
      return 'info';
    }

    if (
      event.includes('REJECT') ||
      event.includes('DELETE')
    ) {
      return 'danger';
    }

    return 'warning';
  };

  /* =========================================================
     KPI CARD
  ========================================================== */

  const StatCard = ({
    label,
    value,
    description,
    icon: Icon,
    tone = 'green',
    onClick
  }) => {
    const tones = {
      green: {
        background: '#EAF7F1',
        color: '#078A58'
      },
      blue: {
        background: '#EEF5FF',
        color: '#416FA8'
      },
      orange: {
        background: '#FFF6DF',
        color: '#B77900'
      },
      red: {
        background: '#FFF0F0',
        color: '#C53D3D'
      },
      purple: {
        background: '#F1EDFF',
        color: '#7048C8'
      },
      gray: {
        background: '#F2F5F3',
        color: '#64716A'
      }
    };

    const currentTone =
      tones[tone] || tones.green;

    return (
      <div
        onClick={onClick}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7EBE8',
          borderRadius: '18px',
          padding: '16px',
          minWidth: 0,
          cursor: onClick
            ? 'pointer'
            : 'default',
          transition:
            'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
          boxShadow:
            '0 3px 14px rgba(15, 23, 42, 0.035)'
        }}
        onMouseEnter={(e) => {
          if (!onClick) return;

          e.currentTarget.style.transform =
            'translateY(-2px)';

          e.currentTarget.style.boxShadow =
            '0 10px 26px rgba(15, 23, 42, 0.08)';

          e.currentTarget.style.borderColor =
            '#D4E8DE';
        }}
        onMouseLeave={(e) => {
          if (!onClick) return;

          e.currentTarget.style.transform =
            'translateY(0)';

          e.currentTarget.style.boxShadow =
            '0 3px 14px rgba(15, 23, 42, 0.035)';

          e.currentTarget.style.borderColor =
            '#E7EBE8';
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
          <span
            style={{
              color: '#7C8780',
              fontSize: '10px',
              fontWeight: 700,
              lineHeight: 1.35
            }}
          >
            {label}
          </span>

          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background:
                currentTone.background,
              color: currentTone.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Icon size={17} />
          </div>
        </div>

        <div
          style={{
            marginTop: '14px',
            color: '#18211D',
            fontSize: '23px',
            fontWeight: 800,
            letterSpacing: '-0.8px'
          }}
        >
          {value}
        </div>

        <div
          style={{
            marginTop: '5px',
            color: '#8A938E',
            fontSize: '9px',
            lineHeight: 1.4
          }}
        >
          {description}
        </div>
      </div>
    );
  };

  /* =========================================================
     PAGE
  ========================================================== */

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '28px'
      }}
    >
      {/* =====================================================
          WELCOME BANNER
      ====================================================== */}

      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #F6FBF8 100%)',
          border: '1px solid #E1EBE5',
          borderRadius: '20px',
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow:
            '0 4px 18px rgba(15, 23, 42, 0.035)'
        }}
      >
        {/* Decorative shape */}
        <div
          style={{
            position: 'absolute',
            right: '-45px',
            top: '-70px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background:
              'rgba(8, 138, 88, 0.055)',
            pointerEvents: 'none'
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            minWidth: 0
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <span
              style={{
                color: '#8A938E',
                fontSize: '10px',
                fontWeight: 600
              }}
            >
              NATIONAL MATERIAL MASTER PLATFORM
            </span>

            <Badge variant="ai">
              <Sparkles size={10} />
              Live API Sync
            </Badge>

            {isStatsLoading && (
              <RefreshCw
                size={13}
                color="#078A58"
                style={{
                  animation:
                    'dashboardSpin 1s linear infinite'
                }}
              />
            )}
          </div>

          <h2
            style={{
              margin: '8px 0 0',
              color: '#18211D',
              fontSize: '22px',
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: '-0.6px'
            }}
          >
            Welcome to MaterialAI
          </h2>

          <p
            style={{
              margin: '7px 0 0',
              maxWidth: '690px',
              color: '#718078',
              fontSize: '11px',
              lineHeight: 1.55
            }}
          >
            AI-powered material harmonization and
            standardization across CPSE catalogues
            under the NUMC architecture.
          </p>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <button
            onClick={() => setActiveTab('search')}
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '11px',
              border: '1px solid #DDE5E0',
              background: '#FFFFFF',
              color: '#405048',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Explore Catalog
          </button>

          <button
            onClick={() => setActiveTab('approval')}
            style={{
              height: '38px',
              padding: '0 14px',
              borderRadius: '11px',
              border: '1px solid #078A58',
              background: '#078A58',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow:
                '0 5px 12px rgba(8, 138, 88, 0.16)'
            }}
          >
            Review AI Recommendations
            {stats.under_review > 0 && (
              <span
                style={{
                  marginLeft: '6px',
                  padding: '2px 5px',
                  borderRadius: '6px',
                  background:
                    'rgba(255,255,255,0.18)',
                  fontSize: '8px'
                }}
              >
                {formatNumber(stats.under_review)}
              </span>
            )}
          </button>
        </div>
      </section>

      {/* =====================================================
          ERROR STATE
      ====================================================== */}

      {statsError && (
        <div
          style={{
            padding: '13px 15px',
            borderRadius: '14px',
            background: '#FFF7F7',
            border: '1px solid #F1D1D1',
            display: 'flex',
            alignItems: 'center',
            gap: '11px'
          }}
        >
          <div
            style={{
              width: '31px',
              height: '31px',
              borderRadius: '9px',
              background: '#FFE4E4',
              color: '#C53D3D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <AlertCircle size={16} />
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                color: '#513131',
                fontSize: '10px',
                fontWeight: 750
              }}
            >
              Dashboard statistics unavailable
            </div>

            <div
              style={{
                marginTop: '3px',
                color: '#8B6868',
                fontSize: '9px'
              }}
            >
              {statsError}
            </div>
          </div>

          <button
            onClick={() =>
              setRefreshKey((k) => k + 1)
            }
            style={{
              height: '32px',
              padding: '0 11px',
              borderRadius: '9px',
              border: '1px solid #E9CCCC',
              background: '#FFFFFF',
              color: '#A04444',
              fontSize: '9px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* =====================================================
          KPI CARDS
      ====================================================== */}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(4, minmax(0, 1fr))',
          gap: '12px'
        }}
      >
        <StatCard
          label="Total Materials"
          value={formatNumber(
            stats.total_materials
          )}
          description={`Active across ${formatNumber(
            activeCpses
          )} CPSEs`}
          icon={Database}
          tone="green"
        />

        <StatCard
          label="Standard Materials"
          value={formatNumber(
            stats.standard_materials
          )}
          description={`${standardizationRate}% of total catalogue`}
          icon={Layers}
          tone="gray"
        />

        <StatCard
          label="Potential Duplicates"
          value={formatNumber(
            stats.potential_duplicates
          )}
          description="Detected by latest AI scan"
          icon={Copy}
          tone="red"
          onClick={() =>
            setActiveTab('duplicates')
          }
        />

        <StatCard
          label="Confirmed Matches"
          value={formatNumber(
            stats.confirmed_matches
          )}
          description={`${confirmedRate}% of catalogue confirmed`}
          icon={CheckCircle2}
          tone="green"
        />

        <StatCard
          label="Under Review"
          value={formatNumber(
            stats.under_review
          )}
          description="Awaiting custodian review"
          icon={Clock}
          tone="orange"
          onClick={() =>
            setActiveTab('approval')
          }
        />

        <StatCard
          label="Rejected Matches"
          value={formatNumber(
            stats.rejected_matches
          )}
          description="Review decisions recorded"
          icon={XCircle}
          tone="red"
        />

        <StatCard
          label="Total CPSEs"
          value={formatNumber(
            stats.total_cpses
          )}
          description="Registered enterprises"
          icon={Building2}
          tone="blue"
        />

        <StatCard
          label="AI Matching Accuracy"
          value={
            stats.ai_accuracy_percent == null
              ? 'N/A'
              : `${stats.ai_accuracy_percent}%`
          }
          description={
            stats.ai_accuracy_percent == null
              ? 'No ground-truth dataset'
              : 'Current model accuracy'
          }
          icon={ShieldCheck}
          tone="purple"
        />
      </section>

      {/* =====================================================
          CPSE + AI RECOMMENDATIONS
      ====================================================== */}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '12px'
        }}
      >
        {/* CPSE HARMONIZATION */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E7EBE8',
            borderRadius: '18px',
            padding: '18px',
            boxShadow:
              '0 3px 14px rgba(15, 23, 42, 0.035)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '18px'
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px'
                }}
              >
                <div
                  style={{
                    width: '29px',
                    height: '29px',
                    borderRadius: '9px',
                    background: '#EAF7F1',
                    color: '#078A58',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Building2 size={14} />
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: '#26332C',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  CPSE Harmonization
                </h3>
              </div>

              <p
                style={{
                  margin: '6px 0 0 36px',
                  color: '#8A938E',
                  fontSize: '9px'
                }}
              >
                Material standardization progress
                across enterprises
              </p>
            </div>

            <button
              onClick={() =>
                setActiveTab('analytics')
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                height: '30px',
                padding: '0 9px',
                borderRadius: '8px',
                border: '1px solid #E5EAE7',
                background: '#FAFBFA',
                color: '#64716A',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Analytics
              <ArrowRight size={11} />
            </button>
          </div>

          {stats.cpses.length === 0 ? (
            <div
              style={{
                padding: '30px',
                borderRadius: '13px',
                background: '#F8FAF9',
                textAlign: 'center',
                color: '#8A938E',
                fontSize: '10px'
              }}
            >
              No CPSE material data available yet.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}
            >
              {stats.cpses.map(
                (cpse, idx) => {
                  const rate =
                    cpse.material_count > 0
                      ? Math.round(
                          (cpse.confirmed_matches /
                            cpse.material_count) *
                            100
                        )
                      : 0;

                  return (
                    <div key={idx}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'space-between',
                          gap: '10px',
                          marginBottom: '6px'
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            minWidth: 0
                          }}
                        >
                          <div
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '8px',
                              background:
                                '#F2F7F4',
                              color: '#5D6B63',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent:
                                'center',
                              fontSize: '8px',
                              fontWeight: 800
                            }}
                          >
                            {String(
                              cpse.name || 'CP'
                            )
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>

                          <span
                            style={{
                              color: '#35423B',
                              fontSize: '10px',
                              fontWeight: 700,
                              whiteSpace:
                                'nowrap',
                              overflow: 'hidden',
                              textOverflow:
                                'ellipsis'
                            }}
                          >
                            {cpse.name}
                          </span>
                        </div>

                        <span
                          style={{
                            color: '#8A938E',
                            fontSize: '9px',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          <strong
                            style={{
                              color: '#4B5750'
                            }}
                          >
                            {formatNumber(
                              cpse.confirmed_matches
                            )}
                          </strong>
                          {' / '}
                          {formatNumber(
                            cpse.material_count
                          )}
                          {' · '}
                          <strong
                            style={{
                              color:
                                rate >= 90
                                  ? '#078A58'
                                  : rate >= 70
                                    ? '#B77900'
                                    : '#C53D3D'
                            }}
                          >
                            {rate}%
                          </strong>
                        </span>
                      </div>

                      <div
                        style={{
                          height: '7px',
                          borderRadius: '99px',
                          background: '#EEF2EF',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              100,
                              rate
                            )}%`,
                            height: '100%',
                            borderRadius: '99px',
                            background:
                              rate >= 90
                                ? '#078A58'
                                : rate >= 70
                                  ? '#D69A25'
                                  : '#D96A6A',
                            transition:
                              'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* AI RECOMMENDATIONS */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E7EBE8',
            borderRadius: '18px',
            padding: '18px',
            boxShadow:
              '0 3px 14px rgba(15, 23, 42, 0.035)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '10px',
              marginBottom: '15px'
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px'
                }}
              >
                <div
                  style={{
                    width: '29px',
                    height: '29px',
                    borderRadius: '9px',
                    background: '#F1EDFF',
                    color: '#7048C8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Sparkles size={14} />
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: '#26332C',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  AI Recommendations
                </h3>
              </div>

              <p
                style={{
                  margin: '6px 0 0 36px',
                  color: '#8A938E',
                  fontSize: '9px'
                }}
              >
                Suggestions awaiting approval
              </p>
            </div>

            <button
              onClick={() =>
                setActiveTab('approval')
              }
              style={{
                height: '30px',
                padding: '0 9px',
                borderRadius: '8px',
                border: '1px solid #DDD4F8',
                background: '#F7F4FF',
                color: '#7048C8',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Queue
            </button>
          </div>

          {stats.pending_recommendations
            .length === 0 ? (
            <div
              style={{
                padding: '29px 16px',
                borderRadius: '13px',
                background: '#F8FAF9',
                textAlign: 'center'
              }}
            >
              <CheckCircle2
                size={25}
                color="#078A58"
              />

              <div
                style={{
                  marginTop: '8px',
                  color: '#4E5C54',
                  fontSize: '10px',
                  fontWeight: 700
                }}
              >
                Queue is clear
              </div>

              <div
                style={{
                  marginTop: '3px',
                  color: '#9AA39E',
                  fontSize: '9px'
                }}
              >
                No recommendations awaiting
                review.
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {stats.pending_recommendations
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item.mapping_id}
                    style={{
                      padding: '11px',
                      borderRadius: '13px',
                      background: '#F8FAF9',
                      border:
                        '1px solid #E9EEEB'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',
                        gap: '7px'
                      }}
                    >
                      <Badge
                        variant={
                          item.status ===
                          'Under Review'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {item.status}
                      </Badge>

                      <span
                        style={{
                          color: '#8A938E',
                          fontSize: '8px',
                          fontWeight: 600
                        }}
                      >
                        {item.cpse_name}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        color: '#34413A',
                        fontSize: '10px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis'
                      }}
                    >
                      {item.material_code}
                    </div>

                    <div
                      style={{
                        marginTop: '4px',
                        color: '#7A847E',
                        fontSize: '9px',
                        lineHeight: 1.35,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow:
                          'ellipsis'
                      }}
                    >
                      {item.raw_description}
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent:
                          'space-between',
                        gap: '8px'
                      }}
                    >
                      <span
                        style={{
                          color: '#078A58',
                          fontSize: '9px',
                          fontWeight: 750
                        }}
                      >
                        {item.similarity_score?.toFixed(
                          1
                        ) || '0.0'}
                        % confidence
                      </span>

                      <button
                        onClick={() =>
                          showToast(
                            `Approved recommendation for ${item.material_code}`,
                            'success'
                          )
                        }
                        style={{
                          height: '27px',
                          padding: '0 8px',
                          borderRadius: '8px',
                          border:
                            '1px solid #CDEBDD',
                          background:
                            '#EAF7F1',
                          color: '#087A50',
                          fontSize: '8px',
                          fontWeight: 750,
                          cursor: 'pointer'
                        }}
                      >
                        Quick Approve
                      </button>
                    </div>
                  </div>
                ))}

              {stats.pending_recommendations
                .length > 3 && (
                <button
                  onClick={() =>
                    setActiveTab('approval')
                  }
                  style={{
                    width: '100%',
                    height: '31px',
                    borderRadius: '9px',
                    border: '1px dashed #D7E2DC',
                    background: '#FFFFFF',
                    color: '#68736C',
                    fontSize: '9px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  +
                  {' '}
                  {stats.pending_recommendations
                    .length - 3}{' '}
                  more recommendations
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section>
        <div
          style={{
            marginBottom: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: '#26332C',
                fontSize: '12px',
                fontWeight: 800
              }}
            >
              Quick Actions
            </h3>

            <p
              style={{
                margin: '3px 0 0',
                color: '#8A938E',
                fontSize: '9px'
              }}
            >
              Common harmonization workflows
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(3, minmax(0, 1fr))',
            gap: '10px'
          }}
        >
          <QuickAction
            icon={Copy}
            title="Duplicate Detection"
            description="Identify and resolve duplicate material clusters."
            tone="red"
            onClick={() =>
              setActiveTab('duplicates')
            }
          />

          <QuickAction
            icon={GitMerge}
            title="CPSE Material Mapping"
            description="Map legacy codes to standardized catalogues."
            tone="green"
            onClick={() =>
              setActiveTab('mapping')
            }
          />

          <QuickAction
            icon={GitCompare}
            title="Material Comparison"
            description="Compare technical specifications side by side."
            tone="blue"
            onClick={() =>
              setActiveTab('comparison')
            }
          />
        </div>
      </section>

      {/* =====================================================
          AUDIT ACTIVITY
      ====================================================== */}

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7EBE8',
          borderRadius: '18px',
          overflow: 'hidden',
          boxShadow:
            '0 3px 14px rgba(15, 23, 42, 0.035)'
        }}
      >
        <div
          style={{
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderBottom: '1px solid #EEF1EF'
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px'
              }}
            >
              <div
                style={{
                  width: '29px',
                  height: '29px',
                  borderRadius: '9px',
                  background: '#F2F5F3',
                  color: '#68736C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Clock size={14} />
              </div>

              <h3
                style={{
                  margin: 0,
                  color: '#26332C',
                  fontSize: '12px',
                  fontWeight: 800
                }}
              >
                Recent Audit Activity
              </h3>
            </div>

            <p
              style={{
                margin: '6px 0 0 36px',
                color: '#8A938E',
                fontSize: '9px'
              }}
            >
              Recent catalogue updates, approvals
              and harmonization events
            </p>
          </div>

          <button
            onClick={() =>
              setActiveTab('audit')
            }
            style={{
              height: '31px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              borderRadius: '9px',
              border: '1px solid #E5EAE7',
              background: '#FAFBFA',
              color: '#64716A',
              fontSize: '9px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            View Full Audit Log
            <ArrowRight size={11} />
          </button>
        </div>

        <div
          style={{
            width: '100%',
            overflowX: 'auto'
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '700px',
              borderCollapse: 'collapse'
            }}
          >
            <thead>
              <tr>
                {[
                  'Timestamp',
                  'Event',
                  'CPSE',
                  'Actor',
                  'Description'
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding:
                        '10px 15px',
                      textAlign: 'left',
                      color: '#8A938E',
                      background: '#FAFBFA',
                      borderBottom:
                        '1px solid #EEF1EF',
                      fontSize: '8px',
                      fontWeight: 800,
                      textTransform:
                        'uppercase',
                      letterSpacing:
                        '0.5px',
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
              {auditLogs
                .slice(0, 6)
                .map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      transition:
                        'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        '#FAFCFB';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        '#FFFFFF';
                    }}
                  >
                    <td
                      style={{
                        padding:
                          '11px 15px',
                        borderBottom:
                          '1px solid #F0F2F1',
                        color: '#8A938E',
                        fontSize: '9px',
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {log.timestamp}
                    </td>

                    <td
                      style={{
                        padding:
                          '11px 15px',
                        borderBottom:
                          '1px solid #F0F2F1'
                      }}
                    >
                      <Badge
                        variant={getEventBadgeVariant(
                          log.eventType
                        )}
                      >
                        {log.eventType}
                      </Badge>
                    </td>

                    <td
                      style={{
                        padding:
                          '11px 15px',
                        borderBottom:
                          '1px solid #F0F2F1',
                        color: '#445149',
                        fontSize: '9px',
                        fontWeight: 700,
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {log.cpse}
                    </td>

                    <td
                      style={{
                        padding:
                          '11px 15px',
                        borderBottom:
                          '1px solid #F0F2F1',
                        color: '#68736C',
                        fontSize: '9px',
                        whiteSpace:
                          'nowrap'
                      }}
                    >
                      {log.actor}
                    </td>

                    <td
                      style={{
                        padding:
                          '11px 15px',
                        borderBottom:
                          '1px solid #F0F2F1',
                        color: '#56635B',
                        fontSize: '9px',
                        maxWidth: '320px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent:
                            'space-between',
                          gap: '10px'
                        }}
                      >
                        <span
                          style={{
                            overflow: 'hidden',
                            textOverflow:
                              'ellipsis',
                            whiteSpace:
                              'nowrap'
                          }}
                        >
                          {log.description}
                        </span>

                        <ChevronRight
                          size={12}
                          color="#A0AAA4"
                        />
                      </div>
                    </td>
                  </tr>
                ))}

              {auditLogs.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      padding: '35px',
                      textAlign: 'center',
                      color: '#8A938E',
                      fontSize: '10px'
                    }}
                  >
                    No audit activity available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================================
          LOCAL ANIMATIONS + RESPONSIVE STYLES
      ====================================================== */}

      <style>
        {`
          @keyframes dashboardSpin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1200px) {
            .material-dashboard-kpis {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 900px) {
            .material-dashboard-main {
              grid-template-columns: 1fr !important;
            }

            .material-dashboard-actions {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 700px) {
            .material-dashboard-kpis {
              grid-template-columns: 1fr !important;
            }

            .material-dashboard-welcome {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
          }
        `}
      </style>
    </div>
  );
};

/* =============================================================
   QUICK ACTION COMPONENT
============================================================= */

const QuickAction = ({
  icon: Icon,
  title,
  description,
  tone = 'green',
  onClick
}) => {
  const tones = {
    green: {
      background: '#EAF7F1',
      color: '#078A58'
    },
    red: {
      background: '#FFF0F0',
      color: '#C53D3D'
    },
    blue: {
      background: '#EEF5FF',
      color: '#416FA8'
    }
  };

  const currentTone =
    tones[tone] || tones.green;

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '11px',
        textAlign: 'left',
        border: '1px solid #E7EBE8',
        borderRadius: '15px',
        background: '#FFFFFF',
        cursor: 'pointer',
        boxShadow:
          '0 2px 10px rgba(15, 23, 42, 0.025)',
        transition:
          'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          'translateY(-2px)';

        e.currentTarget.style.boxShadow =
          '0 9px 22px rgba(15, 23, 42, 0.07)';

        e.currentTarget.style.borderColor =
          '#D7E5DD';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          'translateY(0)';

        e.currentTarget.style.boxShadow =
          '0 2px 10px rgba(15, 23, 42, 0.025)';

        e.currentTarget.style.borderColor =
          '#E7EBE8';
      }}
    >
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '11px',
          background: currentTone.background,
          color: currentTone.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        <Icon size={17} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: '#34413A',
            fontSize: '10px',
            fontWeight: 800
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: '4px',
            color: '#8A938E',
            fontSize: '8px',
            lineHeight: 1.4
          }}
        >
          {description}
        </div>
      </div>

      <ArrowRight
        size={14}
        color="#9AA39E"
      />
    </button>
  );
};

export default DashboardPage;