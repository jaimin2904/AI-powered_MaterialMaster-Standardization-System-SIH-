import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XCircle,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Activity,
  ArrowUpRight,
  Users,
  Target,
} from 'lucide-react';

import Badge from '../components/common/Badge';
import { getAnalyticsSummary } from '../services/api';

const COLORS = {
  green: '#078A58',
  greenDark: '#056B46',
  greenSoft: '#ECFDF5',
  greenBorder: '#BBF7D0',

  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  blueBorder: '#BFDBFE',

  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',
  purpleBorder: '#DDD6FE',

  amber: '#D97706',
  amberSoft: '#FFFBEB',
  amberBorder: '#FDE68A',

  red: '#DC2626',
  redSoft: '#FEF2F2',
  redBorder: '#FECACA',

  text: '#17201B',
  textMuted: '#66736C',
  border: '#E5EAE7',
  background: '#F6F8F7',
  white: '#FFFFFF',
};

const cardStyle = {
  background: COLORS.white,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
};

const formatNumber = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) {
    return '0';
  }

  return Number(n).toLocaleString('en-IN');
};

const EmptyState = ({ message }) => (
  <div
    style={{
      minHeight: '190px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '9px',
      textAlign: 'center',
      padding: '24px',
    }}
  >
    <div
      style={{
        width: '46px',
        height: '46px',
        borderRadius: '14px',
        background: '#F5F7F6',
        color: '#AAB5AF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <BarChart3 size={22} />
    </div>

    <div
      style={{
        fontSize: '12px',
        color: COLORS.textMuted,
        lineHeight: 1.5,
        maxWidth: '320px',
      }}
    >
      {message}
    </div>
  </div>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
  right,
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      marginBottom: '18px',
      flexWrap: 'wrap',
    }}
  >
    <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '11px',
          background: COLORS.greenSoft,
          color: COLORS.green,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 800,
            color: COLORS.text,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: COLORS.textMuted,
            marginTop: '4px',
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      </div>
    </div>

    {right}
  </div>
);

const StatCard = ({
  icon,
  label,
  value,
  description,
  tone = 'green',
}) => {
  const tones = {
    green: {
      bg: COLORS.greenSoft,
      color: COLORS.green,
      border: COLORS.greenBorder,
    },
    blue: {
      bg: COLORS.blueSoft,
      color: COLORS.blue,
      border: COLORS.blueBorder,
    },
    purple: {
      bg: COLORS.purpleSoft,
      color: COLORS.purple,
      border: COLORS.purpleBorder,
    },
    amber: {
      bg: COLORS.amberSoft,
      color: COLORS.amber,
      border: COLORS.amberBorder,
    },
    red: {
      bg: COLORS.redSoft,
      color: COLORS.red,
      border: COLORS.redBorder,
    },
  };

  const t = tones[tone] || tones.green;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '17px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '11px',
            background: t.bg,
            color: t.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${t.border}`,
          }}
        >
          {icon}
        </div>

        <ArrowUpRight
          size={14}
          color="#B0BAB5"
        />
      </div>

      <div
        style={{
          marginTop: '14px',
          fontSize: '10px',
          fontWeight: 700,
          color: COLORS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: '5px',
          fontSize: '23px',
          lineHeight: 1,
          fontWeight: 800,
          color: COLORS.text,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: '7px',
          fontSize: '10px',
          color: COLORS.textMuted,
          lineHeight: 1.45,
        }}
      >
        {description}
      </div>
    </div>
  );
};

const ProgressBar = ({
  value,
  color = COLORS.green,
  height = 7,
}) => (
  <div
    style={{
      width: '100%',
      height: `${height}px`,
      borderRadius: '999px',
      background: '#EDF1EF',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        width: `${Math.min(100, Math.max(0, value))}%`,
        height: '100%',
        borderRadius: '999px',
        background: color,
        transition: 'width 0.3s ease',
      }}
    />
  </div>
);

const DistributionRow = ({
  label,
  count,
  max,
  color,
}) => {
  const percentage = max > 0 ? (count / max) * 100 : 0;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '7px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            color: COLORS.text,
            fontWeight: 700,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: '10px',
            color: COLORS.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          {formatNumber(count)}
        </div>
      </div>

      <ProgressBar
        value={percentage}
        color={color}
        height={6}
      />
    </div>
  );
};

export const AnalyticsPage = ({ showToast }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getAnalyticsSummary();
      setSummary(data);
    } catch (err) {
      setError(
        'Failed to load analytics data. Please ensure the backend API is running.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics, refreshKey]);

  const maxCat = summary
    ? Math.max(
        1,
        ...summary.materials_by_category.map((c) => c.count)
      )
    : 1;

  const maxCpse = summary
    ? Math.max(
        1,
        ...summary.materials_by_cpse.map((c) => c.count)
      )
    : 1;

  const maxSim = summary
    ? Math.max(
        1,
        ...Object.values(
          summary.similarity_summary.distribution
        )
      )
    : 1;

  const cats = ['<25', '25-49', '50-74', '>=75'];

  const refreshAnalytics = () => {
    setRefreshKey((k) => k + 1);

    if (showToast) {
      showToast('Refreshing analytics from live API...', 'success');
    }
  };

  return (
    <div
      style={{
        minHeight: '100%',
        background: COLORS.background,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* ================================================== */}
      {/* PAGE HEADER */}
      {/* ================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '9px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={16} />
            </div>

            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: COLORS.green,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Intelligence & Insights
            </span>
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: '22px',
              lineHeight: 1.25,
              fontWeight: 800,
              color: COLORS.text,
              letterSpacing: '-0.02em',
            }}
          >
            National Material Analytics
          </h2>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: '12px',
              color: COLORS.textMuted,
              lineHeight: 1.6,
              maxWidth: '700px',
            }}
          >
            Real-time catalog harmonization, matching, and approval
            insights across CPSEs.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
          }}
        >
          {loading ? (
            <Badge variant="warning">Loading...</Badge>
          ) : error ? (
            <Badge variant="danger">Live Sync Error</Badge>
          ) : (
            <Badge variant="success">Live API Sync</Badge>
          )}

          <button
            type="button"
            onClick={refreshAnalytics}
            disabled={loading}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: `1px solid ${COLORS.border}`,
              background: COLORS.white,
              color: COLORS.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
            title="Refresh analytics"
          >
            <RefreshCw
              size={15}
              style={{
                animation: loading
                  ? 'spin 1s linear infinite'
                  : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* ================================================== */}
      {/* LOADING */}
      {/* ================================================== */}

      {loading && (
        <div
          style={{
            ...cardStyle,
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Activity size={22} />
            </div>

            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: COLORS.text,
              }}
            >
              Loading analytics
            </div>

            <div
              style={{
                fontSize: '11px',
                color: COLORS.textMuted,
                marginTop: '4px',
              }}
            >
              Fetching latest catalog intelligence...
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {!loading && error && (
        <div
          style={{
            ...cardStyle,
            padding: '22px',
            borderColor: COLORS.redBorder,
            background: '#FFFCFC',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '11px',
                background: COLORS.redSoft,
                color: COLORS.red,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={18} />
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#991B1B',
                }}
              >
                Analytics unavailable
              </div>

              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.textMuted,
                  marginTop: '4px',
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>

              <button
                type="button"
                onClick={refreshAnalytics}
                style={{
                  marginTop: '13px',
                  height: '34px',
                  padding: '0 13px',
                  border: 'none',
                  borderRadius: '9px',
                  background: COLORS.green,
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* ANALYTICS CONTENT */}
      {/* ================================================== */}

      {!loading && !error && summary && (
        <>
          {/* ================================================== */}
          {/* KPI CARDS */}
          {/* ================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            <StatCard
              icon={<Building2 size={19} />}
              label="Total Materials"
              value={formatNumber(summary.total_materials)}
              description="Records in CPSE catalogs"
              tone="blue"
            />

            <StatCard
              icon={<Database size={19} />}
              label="Standard Materials"
              value={formatNumber(summary.standard_materials)}
              description="National catalog entries"
              tone="green"
            />

            <StatCard
              icon={<CheckCircle2 size={19} />}
              label="Confirmed Matches"
              value={formatNumber(summary.confirmed_matches)}
              description="Approved mappings"
              tone="purple"
            />

            <StatCard
              icon={<AlertTriangle size={19} />}
              label="Potential Duplicates"
              value={formatNumber(summary.potential_duplicates)}
              description="From latest detection scan"
              tone="amber"
            />

            <StatCard
              icon={<Clock3 size={19} />}
              label="Under Review"
              value={formatNumber(summary.under_review)}
              description="Mappings awaiting review"
              tone="amber"
            />

            <StatCard
              icon={<XCircle size={19} />}
              label="Rejected Matches"
              value={formatNumber(summary.rejected_matches)}
              description="Rejected approval decisions"
              tone="red"
            />

            <StatCard
              icon={<ShieldCheck size={19} />}
              label="Total CPSEs"
              value={formatNumber(summary.total_cpses)}
              description="Participating enterprises"
              tone="green"
            />

            <StatCard
              icon={<TrendingUp size={19} />}
              label="Avg Match Similarity"
              value={
                summary.similarity_summary.avg_score !== null &&
                summary.similarity_summary.avg_score !== undefined
                  ? `${summary.similarity_summary.avg_score}%`
                  : 'N/A'
              }
              description={`${summary.similarity_summary.scored} scored mapping${
                summary.similarity_summary.scored === 1 ? '' : 's'
              }`}
              tone="purple"
            />
          </div>

          {/* ================================================== */}
          {/* CATEGORY + CPSE */}
          {/* ================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '14px',
            }}
          >
            {/* CATEGORY */}
            <div
              style={{
                ...cardStyle,
                padding: '18px',
              }}
            >
              <SectionHeader
                icon={<BarChart3 size={17} />}
                title="Materials by Category"
                subtitle="Distribution of catalog items across material categories"
              />

              {summary.materials_by_category.length === 0 ? (
                <EmptyState message="No material records available for category breakdown." />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                  }}
                >
                  {summary.materials_by_category.map(
                    (cat, idx) => (
                      <DistributionRow
                        key={
                          cat.category ||
                          `cat-${idx}`
                        }
                        label={
                          cat.category ||
                          'Uncategorized'
                        }
                        count={cat.count}
                        max={maxCat}
                        color={
                          [
                            COLORS.blue,
                            '#3B82F6',
                            '#60A5FA',
                            COLORS.green,
                            COLORS.purple,
                            COLORS.amber,
                          ][idx % 6]
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>

            {/* CPSE */}
            <div
              style={{
                ...cardStyle,
                padding: '18px',
              }}
            >
              <SectionHeader
                icon={<Building2 size={17} />}
                title="CPSE Material Distribution"
                subtitle="Catalog item counts per public sector enterprise"
              />

              {summary.materials_by_cpse.length === 0 ? (
                <EmptyState message="No CPSE material records available." />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                  }}
                >
                  {summary.materials_by_cpse.map(
                    (cpse, idx) => (
                      <DistributionRow
                        key={
                          cpse.cpse_id ||
                          `cpse-${idx}`
                        }
                        label={cpse.cpse_name}
                        count={cpse.count}
                        max={maxCpse}
                        color={
                          [
                            COLORS.green,
                            COLORS.blue,
                            COLORS.purple,
                            COLORS.amber,
                            '#0891B2',
                            '#64748B',
                          ][idx % 6]
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ================================================== */}
          {/* APPROVAL + SIMILARITY */}
          {/* ================================================== */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(2, minmax(0, 1fr))',
              gap: '14px',
            }}
          >
            {/* APPROVAL ACTIVITY */}
            <div
              style={{
                ...cardStyle,
                padding: '18px',
              }}
            >
              <SectionHeader
                icon={<CheckCircle2 size={17} />}
                title="Approval Activity"
                subtitle="Human review decisions on AI mapping recommendations"
                right={
                  <Badge
                    variant={
                      summary.approval_summary.total > 0
                        ? 'success'
                        : 'neutral'
                    }
                  >
                    {summary.approval_summary.total}{' '}
                    decision
                    {summary.approval_summary.total === 1
                      ? ''
                      : 's'}
                  </Badge>
                }
              />

              {summary.approval_summary.total === 0 ? (
                <EmptyState message="No approval decisions recorded yet." />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  {/* Decision KPIs */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: COLORS.greenSoft,
                        border: `1px solid ${COLORS.greenBorder}`,
                      }}
                    >
                      <CheckCircle2
                        size={15}
                        color={COLORS.green}
                      />

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '19px',
                          fontWeight: 800,
                          color: COLORS.greenDark,
                        }}
                      >
                        {formatNumber(
                          summary.approval_summary
                            .approved
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color: COLORS.greenDark,
                          marginTop: '2px',
                        }}
                      >
                        Approved
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: COLORS.redSoft,
                        border: `1px solid ${COLORS.redBorder}`,
                      }}
                    >
                      <XCircle
                        size={15}
                        color={COLORS.red}
                      />

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '19px',
                          fontWeight: 800,
                          color: '#991B1B',
                        }}
                      >
                        {formatNumber(
                          summary.approval_summary
                            .rejected
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color: COLORS.red,
                          marginTop: '2px',
                        }}
                      >
                        Rejected
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: COLORS.amberSoft,
                        border: `1px solid ${COLORS.amberBorder}`,
                      }}
                    >
                      <Target
                        size={15}
                        color={COLORS.amber}
                      />

                      <div
                        style={{
                          marginTop: '8px',
                          fontSize: '19px',
                          fontWeight: 800,
                          color: '#92400E',
                        }}
                      >
                        {formatNumber(
                          summary.approval_summary
                            .modified
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color: COLORS.amber,
                          marginTop: '2px',
                        }}
                      >
                        Modified
                      </div>
                    </div>
                  </div>

                  {/* Reviewers */}
                  {summary.approval_summary.by_reviewer
                    .length > 0 && (
                    <div>
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: COLORS.textMuted,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '9px',
                        }}
                      >
                        Reviews by Officer
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        {summary.approval_summary.by_reviewer.map(
                          (rv, idx) => (
                            <div
                              key={
                                rv.reviewed_by ||
                                `rv-${idx}`
                              }
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent:
                                  'space-between',
                                gap: '10px',
                                padding:
                                  '8px 10px',
                                borderRadius: '9px',
                                background:
                                  '#F8FAF9',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems:
                                    'center',
                                  gap: '8px',
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    width: '25px',
                                    height: '25px',
                                    borderRadius:
                                      '8px',
                                    background:
                                      COLORS.blueSoft,
                                    color:
                                      COLORS.blue,
                                    display: 'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <Users
                                    size={12}
                                  />
                                </div>

                                <span
                                  style={{
                                    fontSize: '11px',
                                    color:
                                      COLORS.text,
                                    fontWeight: 600,
                                    overflow:
                                      'hidden',
                                    textOverflow:
                                      'ellipsis',
                                    whiteSpace:
                                      'nowrap',
                                  }}
                                >
                                  {rv.reviewed_by}
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize: '11px',
                                  color:
                                    COLORS.textMuted,
                                  fontWeight: 800,
                                }}
                              >
                                {rv.count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recent Decisions */}
                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: COLORS.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '9px',
                      }}
                    >
                      Recent Decisions
                    </div>

                    <div
                      style={{
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '90px 1fr 1.4fr 130px',
                          gap: '10px',
                          padding:
                            '10px 12px',
                          background:
                            '#F8FAF9',
                          borderBottom:
                            `1px solid ${COLORS.border}`,
                          fontSize: '9px',
                          fontWeight: 800,
                          color:
                            COLORS.textMuted,
                          textTransform:
                            'uppercase',
                        }}
                      >
                        <span>Decision</span>
                        <span>Reviewer</span>
                        <span>Comment</span>
                        <span>Timestamp</span>
                      </div>

                      {summary.approval_summary.recent.map(
                        (a) => (
                          <div
                            key={a.id}
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                '90px 1fr 1.4fr 130px',
                              gap: '10px',
                              alignItems:
                                'center',
                              padding:
                                '11px 12px',
                              borderBottom:
                                `1px solid ${COLORS.border}`,
                              fontSize: '10px',
                            }}
                          >
                            <div>
                              <Badge
                                variant={
                                  a.decision ===
                                  'Approved'
                                    ? 'success'
                                    : a.decision ===
                                        'Rejected'
                                      ? 'danger'
                                      : 'warning'
                                }
                              >
                                {a.decision}
                              </Badge>
                            </div>

                            <div
                              style={{
                                color:
                                  COLORS.text,
                                fontWeight: 600,
                              }}
                            >
                              {a.reviewed_by}
                            </div>

                            <div
                              style={{
                                color:
                                  COLORS.textMuted,
                                overflow:
                                  'hidden',
                                textOverflow:
                                  'ellipsis',
                                whiteSpace:
                                  'nowrap',
                              }}
                            >
                              {a.comment || '—'}
                            </div>

                            <div
                              style={{
                                color:
                                  COLORS.textMuted,
                              }}
                            >
                              {new Date(
                                a.timestamp
                              ).toLocaleString()}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SIMILARITY */}
            <div
              style={{
                ...cardStyle,
                padding: '18px',
              }}
            >
              <SectionHeader
                icon={<TrendingUp size={17} />}
                title="AI Match Similarity"
                subtitle="Similarity scores of recorded material mappings"
                right={
                  <Badge variant="ai">
                    {summary.similarity_summary.scored}{' '}
                    scored
                  </Badge>
                }
              />

              {summary.similarity_summary.scored ===
              0 ? (
                <EmptyState message="No scored mappings recorded yet. Apply matching to generate similarity scores." />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                  }}
                >
                  {/* Score Cards */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(3, minmax(0, 1fr))',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        padding: '13px',
                        borderRadius: '12px',
                        background: '#F8FAF9',
                        border: `1px solid ${COLORS.border}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9px',
                          color: COLORS.textMuted,
                          fontWeight: 800,
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Minimum
                      </div>

                      <div
                        style={{
                          fontSize: '21px',
                          fontWeight: 800,
                          color: COLORS.text,
                          marginTop: '6px',
                        }}
                      >
                        {summary.similarity_summary
                          .min_score !== null
                          ? `${summary.similarity_summary.min_score}%`
                          : 'N/A'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '13px',
                        borderRadius: '12px',
                        background: COLORS.blueSoft,
                        border: `1px solid ${COLORS.blueBorder}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9px',
                          color: COLORS.blue,
                          fontWeight: 800,
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Average
                      </div>

                      <div
                        style={{
                          fontSize: '21px',
                          fontWeight: 800,
                          color: '#1D4ED8',
                          marginTop: '6px',
                        }}
                      >
                        {summary.similarity_summary
                          .avg_score !== null
                          ? `${summary.similarity_summary.avg_score}%`
                          : 'N/A'}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '13px',
                        borderRadius: '12px',
                        background: COLORS.greenSoft,
                        border: `1px solid ${COLORS.greenBorder}`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '9px',
                          color:
                            COLORS.greenDark,
                          fontWeight: 800,
                          textTransform:
                            'uppercase',
                        }}
                      >
                        Maximum
                      </div>

                      <div
                        style={{
                          fontSize: '21px',
                          fontWeight: 800,
                          color:
                            COLORS.greenDark,
                          marginTop: '6px',
                        }}
                      >
                        {summary.similarity_summary
                          .max_score !== null
                          ? `${summary.similarity_summary.max_score}%`
                          : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Distribution */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color:
                            COLORS.textMuted,
                          textTransform:
                            'uppercase',
                          letterSpacing:
                            '0.05em',
                        }}
                      >
                        Score Distribution
                      </div>

                      <div
                        style={{
                          fontSize: '10px',
                          color:
                            COLORS.textMuted,
                        }}
                      >
                        {summary.similarity_summary.scored}{' '}
                        scored of{' '}
                        {summary.similarity_summary
                          .total}{' '}
                        total
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexDirection:
                          'column',
                        gap: '15px',
                      }}
                    >
                      {cats.map((key) => {
                        const count =
                          summary
                            .similarity_summary
                            .distribution[key] ||
                          0;

                        const color =
                          key === '>=75'
                            ? COLORS.green
                            : key === '50-74'
                              ? COLORS.blue
                              : key === '25-49'
                                ? COLORS.amber
                                : COLORS.red;

                        return (
                          <div key={key}>
                            <div
                              style={{
                                display:
                                  'flex',
                                justifyContent:
                                  'space-between',
                                alignItems:
                                  'center',
                                marginBottom:
                                  '7px',
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  gap: '7px',
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      '7px',
                                    height:
                                      '7px',
                                    borderRadius:
                                      '50%',
                                    background:
                                      color,
                                  }}
                                />

                                <span
                                  style={{
                                    fontSize:
                                      '11px',
                                    fontWeight:
                                      700,
                                    color:
                                      COLORS.text,
                                  }}
                                >
                                  {key}%
                                </span>
                              </div>

                              <span
                                style={{
                                  fontSize:
                                    '10px',
                                  color:
                                    COLORS.textMuted,
                                }}
                              >
                                {formatNumber(
                                  count
                                )}{' '}
                                mapping
                                {count === 1
                                  ? ''
                                  : 's'}
                              </span>
                            </div>

                            <ProgressBar
                              value={
                                (count /
                                  maxSim) *
                                100
                              }
                              color={color}
                              height={7}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interpretation */}
                  <div
                    style={{
                      padding: '13px',
                      borderRadius: '12px',
                      background:
                        COLORS.purpleSoft,
                      border: `1px solid ${COLORS.purpleBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        gap: '8px',
                        fontSize: '10px',
                        fontWeight: 800,
                        color:
                          COLORS.purple,
                        textTransform:
                          'uppercase',
                      }}
                    >
                      <TrendingUp size={13} />
                      Similarity Overview
                    </div>

                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '11px',
                        color: '#5B21B6',
                        lineHeight: 1.55,
                      }}
                    >
                      The distribution above shows
                      how recorded material mappings
                      are spread across AI similarity
                      score ranges.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 1100px) {
            .analytics-kpi-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }
          }

          @media (max-width: 800px) {
            .analytics-two-column {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AnalyticsPage;