import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Download,
  Eye,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Activity,
  Database,
  LockKeyhole,
  ChevronRight,
} from 'lucide-react';

import Badge from '../components/common/Badge';
import Drawer from '../components/common/Drawer';
import { AUDIT_LOGS } from '../data/mockData';
import { getAuditLogs } from '../services/api';

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

const buttonBase = {
  height: '38px',
  padding: '0 14px',
  borderRadius: '10px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  fontSize: '11px',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const getEventVariant = (eventType = '') => {
  if (eventType.includes('MERGE')) return 'info';
  if (eventType.includes('APPROVE')) return 'success';
  if (eventType.includes('REJECT')) return 'danger';
  return 'warning';
};

const StatCard = ({ icon, label, value, tone = 'green' }) => {
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
  };

  const t = tones[tone] || tones.green;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: t.bg,
          border: `1px solid ${t.border}`,
          color: t.color,
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
            fontSize: '10px',
            color: COLORS.textMuted,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {label}
        </div>

        <div
          style={{
            marginTop: '3px',
            fontSize: '21px',
            fontWeight: 800,
            color: COLORS.text,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

export const AuditHistoryPage = ({
  selectedCpse,
  setSelectedCpse,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [selectedLogDetail, setSelectedLogDetail] = useState(null);
  const [logs, setLogs] = useState(AUDIT_LOGS);

  useEffect(() => {
    getAuditLogs()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((l) => ({
            id: `AUD-${l.id}`,
            timestamp: new Date(l.timestamp).toLocaleString(),
            eventType: l.action,
            cpse: 'NTPC & CPSEs',
            numcCode: 'NUMC-401015-0089',
            actor: l.user,
            description: l.new_value
              ? l.new_value.length > 90
                ? `${l.new_value.substring(0, 90)}...`
                : l.new_value
              : l.action,
            status: 'Verified',
            rawLog: l,
          }));

          setLogs(mapped);
        }
      })
      .catch(() => {
        // Fallback to static mock logs
      });
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (
      selectedEventType !== 'ALL' &&
      !log.eventType.includes(selectedEventType)
    ) {
      return false;
    }

    if (!searchTerm.trim()) return true;

    const q = searchTerm.toLowerCase();

    return (
      log.id.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.cpse.toLowerCase().includes(q) ||
      log.numcCode.toLowerCase().includes(q)
    );
  });

  const verifiedCount = logs.filter(
    (log) => log.status === 'Verified'
  ).length;

  const uniqueActors = new Set(
    logs.map((log) => log.actor).filter(Boolean)
  ).size;

  const handleExport = () => {
    showToast(
      'Exporting Audit Trail to CSV / PDF...',
      'info'
    );
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
              <History size={16} />
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
              Governance & Compliance
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
            Audit History
          </h2>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: '12px',
              color: COLORS.textMuted,
              lineHeight: 1.6,
              maxWidth: '720px',
            }}
          >
            Complete audit trail of material master edits, approvals,
            duplicate mergers, code re-assignments, and AI agent actions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          style={{
            ...buttonBase,
            background: COLORS.white,
            border: `1px solid ${COLORS.border}`,
            color: COLORS.text,
          }}
        >
          <Download size={14} />
          Export Audit Log
        </button>
      </div>

      {/* ================================================== */}
      {/* SUMMARY CARDS */}
      {/* ================================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(3, minmax(0, 1fr))',
          gap: '12px',
        }}
      >
        <StatCard
          icon={<FileText size={19} />}
          label="Audit Events"
          value={logs.length}
          tone="blue"
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          label="Verified Events"
          value={verifiedCount}
          tone="green"
        />

        <StatCard
          icon={<ShieldCheck size={19} />}
          label="Active Actors"
          value={uniqueActors}
          tone="purple"
        />
      </div>

      {/* ================================================== */}
      {/* IMMUTABILITY STATUS */}
      {/* ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          background:
            'linear-gradient(90deg, #F8FFFB 0%, #FFFFFF 70%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: COLORS.greenSoft,
              color: COLORS.green,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockKeyhole size={16} />
          </div>

          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: COLORS.text,
              }}
            >
              Immutable Audit Trail
            </div>

            <div
              style={{
                fontSize: '10px',
                color: COLORS.textMuted,
                marginTop: '2px',
              }}
            >
              Audit events are retained as verification records for
              material master governance.
            </div>
          </div>
        </div>

        <Badge variant="success">
          <ShieldCheck size={11} />
          Audit Integrity Active
        </Badge>
      </div>

      {/* ================================================== */}
      {/* FILTER TOOLBAR */}
      {/* ================================================== */}

      <div
        style={{
          ...cardStyle,
          padding: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '260px',
            position: 'relative',
          }}
        >
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9AA59F',
              pointerEvents: 'none',
            }}
          />

          <input
            type="text"
            placeholder="Search audit ID, actor, NUMC code, CPSE, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              boxSizing: 'border-box',
              padding: '0 12px 0 36px',
              borderRadius: '10px',
              border: `1px solid ${COLORS.border}`,
              background: '#FAFBFA',
              color: COLORS.text,
              fontSize: '11px',
              outline: 'none',
            }}
          />
        </div>

        <div
          style={{
            height: '38px',
            padding: '0 10px',
            borderRadius: '10px',
            border: `1px solid ${COLORS.border}`,
            background: COLORS.white,
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
          }}
        >
          <Activity
            size={14}
            color={COLORS.textMuted}
          />

          <select
            value={selectedEventType}
            onChange={(e) =>
              setSelectedEventType(e.target.value)
            }
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: COLORS.text,
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              minWidth: '150px',
            }}
          >
            <option value="ALL">
              All Event Types
            </option>
            <option value="DUPLICATE_MERGE">
              Duplicate Merge
            </option>
            <option value="MAPPING_APPROVE">
              Mapping Approve
            </option>
            <option value="SPEC_AUGMENTATION">
              Spec Augmentation
            </option>
            <option value="PRICE_VARIANCE">
              Price Variance Alert
            </option>
          </select>
        </div>

        <div
          style={{
            padding: '0 11px',
            height: '38px',
            borderRadius: '10px',
            background: '#F8FAF9',
            border: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            fontSize: '10px',
            color: COLORS.textMuted,
            fontWeight: 600,
          }}
        >
          <span>Showing</span>

          <strong
            style={{
              color: COLORS.text,
              fontSize: '11px',
            }}
          >
            {filteredLogs.length}
          </strong>

          <span>events</span>
        </div>
      </div>

      {/* ================================================== */}
      {/* AUDIT TABLE */}
      {/* ================================================== */}

      <div
        style={{
          ...cardStyle,
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            padding: '15px 17px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '9px',
                background: COLORS.blueSoft,
                color: COLORS.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Database size={14} />
            </div>

            <div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: COLORS.text,
                }}
              >
                Audit Event Records
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: COLORS.textMuted,
                  marginTop: '2px',
                }}
              >
                Material master activity and governance history
              </div>
            </div>
          </div>

          <Badge variant="neutral">
            {filteredLogs.length} records
          </Badge>
        </div>

        {filteredLogs.length === 0 ? (
          <div
            style={{
              minHeight: '280px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '30px',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '16px',
                  background: '#F5F7F6',
                  color: '#A8B2AC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Search size={22} />
              </div>

              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: COLORS.text,
                }}
              >
                No audit events found
              </div>

              <div
                style={{
                  marginTop: '5px',
                  fontSize: '11px',
                  color: COLORS.textMuted,
                }}
              >
                Try changing your search term or event filter.
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <table
              style={{
                width: '100%',
                minWidth: '1050px',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: '#F8FAF9',
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  {[
                    'Audit ID',
                    'Timestamp',
                    'Event Type',
                    'CPSE Unit',
                    'NUMC / Local Code',
                    'Actor / Agent',
                    'Description',
                    'Status',
                    '',
                  ].map((heading, index) => (
                    <th
                      key={`${heading}-${index}`}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontSize: '9px',
                        fontWeight: 800,
                        color: COLORS.textMuted,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderBottom: `1px solid #EEF2EF`,
                    }}
                  >
                    <td
                      style={{
                        padding: '12px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          padding: '5px 7px',
                          borderRadius: '7px',
                          background: '#F3F6F4',
                          border: `1px solid ${COLORS.border}`,
                          color: COLORS.text,
                          fontSize: '10px',
                          fontWeight: 800,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, monospace',
                        }}
                      >
                        {log.id}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '12px',
                        fontSize: '10px',
                        color: COLORS.textMuted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.timestamp}
                    </td>

                    <td
                      style={{
                        padding: '12px',
                      }}
                    >
                      <Badge
                        variant={getEventVariant(
                          log.eventType
                        )}
                      >
                        {log.eventType}
                      </Badge>
                    </td>

                    <td
                      style={{
                        padding: '12px',
                        fontSize: '11px',
                        color: COLORS.text,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.cpse}
                    </td>

                    <td
                      style={{
                        padding: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: COLORS.blue,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, monospace',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {log.numcCode}
                      </span>
                    </td>

                    <td
                      style={{
                        padding: '12px',
                        fontSize: '11px',
                        color: COLORS.text,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {log.actor}
                    </td>

                    <td
                      style={{
                        padding: '12px',
                        maxWidth: '250px',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          color: COLORS.textMuted,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {log.description}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: '12px',
                      }}
                    >
                      <Badge variant="success">
                        <CheckCircle2 size={10} />
                        {log.status}
                      </Badge>
                    </td>

                    <td
                      style={{
                        padding: '12px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLogDetail(log)
                        }
                        title="View Audit Snapshot JSON"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '9px',
                          border: `1px solid ${COLORS.border}`,
                          background: COLORS.white,
                          color: COLORS.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================================================== */}
      {/* SNAPSHOT DRAWER */}
      {/* ================================================== */}

      <Drawer
        isOpen={Boolean(selectedLogDetail)}
        onClose={() => setSelectedLogDetail(null)}
        title={
          selectedLogDetail
            ? `Audit Record: ${selectedLogDetail.id}`
            : ''
        }
        footer={
          <button
            type="button"
            onClick={() => setSelectedLogDetail(null)}
            style={{
              ...buttonBase,
              background: COLORS.white,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.text,
            }}
          >
            Close
          </button>
        }
      >
        {selectedLogDetail && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {/* Record identity */}
            <div
              style={{
                padding: '14px',
                borderRadius: '14px',
                background:
                  'linear-gradient(135deg, #F8FFFB 0%, #FFFFFF 100%)',
                border: `1px solid ${COLORS.greenBorder}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '14px',
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
                    justifyContent: 'center',
                  }}
                >
                  <ShieldCheck size={18} />
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: COLORS.text,
                    }}
                  >
                    Verified Audit Event
                  </div>

                  <div
                    style={{
                      fontSize: '10px',
                      color: COLORS.textMuted,
                      marginTop: '2px',
                    }}
                  >
                    Immutable governance record
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2, minmax(0, 1fr))',
                  gap: '9px',
                }}
              >
                <div
                  style={{
                    padding: '9px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: COLORS.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    EVENT ID
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '10px',
                      color: COLORS.text,
                      fontWeight: 800,
                      fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}
                  >
                    {selectedLogDetail.id}
                  </div>
                </div>

                <div
                  style={{
                    padding: '9px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: COLORS.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    EVENT TYPE
                  </div>

                  <div style={{ marginTop: '5px' }}>
                    <Badge
                      variant={getEventVariant(
                        selectedLogDetail.eventType
                      )}
                    >
                      {selectedLogDetail.eventType}
                    </Badge>
                  </div>
                </div>

                <div
                  style={{
                    padding: '9px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: COLORS.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    TIMESTAMP
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '10px',
                      color: COLORS.text,
                      fontWeight: 600,
                    }}
                  >
                    {selectedLogDetail.timestamp}
                  </div>
                </div>

                <div
                  style={{
                    padding: '9px',
                    borderRadius: '9px',
                    background: '#FFFFFF',
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div
                    style={{
                      fontSize: '9px',
                      color: COLORS.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    ACTOR
                  </div>

                  <div
                    style={{
                      marginTop: '4px',
                      fontSize: '10px',
                      color: COLORS.text,
                      fontWeight: 700,
                    }}
                  >
                    {selectedLogDetail.actor}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: '9px',
                  padding: '9px',
                  borderRadius: '9px',
                  background: '#FFFFFF',
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: '9px',
                    color: COLORS.textMuted,
                    fontWeight: 700,
                  }}
                >
                  CPSE SCOPE
                </div>

                <div
                  style={{
                    marginTop: '4px',
                    fontSize: '10px',
                    color: COLORS.text,
                    fontWeight: 700,
                  }}
                >
                  {selectedLogDetail.cpse}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div
                style={{
                  fontSize: '10px',
                  color: COLORS.textMuted,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '7px',
                }}
              >
                Event Description
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '11px',
                  background: '#F8FAF9',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.text,
                  fontSize: '11px',
                  lineHeight: 1.6,
                }}
              >
                {selectedLogDetail.description}
              </div>
            </div>

            {/* JSON */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '10px',
                    color: COLORS.textMuted,
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Immutable JSON Snapshot
                </div>

                <Badge variant="neutral">
                  <FileText size={10} />
                  JSON
                </Badge>
              </div>

              <pre
                style={{
                  margin: 0,
                  background: '#101714',
                  color: '#DDE8E2',
                  padding: '15px',
                  borderRadius: '13px',
                  fontSize: '10px',
                  lineHeight: 1.6,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  overflowX: 'auto',
                  border: '1px solid #25352D',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {JSON.stringify(
                  selectedLogDetail.rawLog || {
                    auditId: selectedLogDetail.id,
                    event: selectedLogDetail.eventType,
                    timestamp: selectedLogDetail.timestamp,
                    numcCode: selectedLogDetail.numcCode,
                    actor: selectedLogDetail.actor,
                    signatureHash:
                      'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Footer status */}
            <div
              style={{
                padding: '11px 12px',
                borderRadius: '11px',
                background: COLORS.greenSoft,
                border: `1px solid ${COLORS.greenBorder}`,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '10px',
                color: COLORS.greenDark,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2
                size={14}
                style={{ flexShrink: 0 }}
              />
              This record is marked as verified in the audit history.
            </div>
          </div>
        )}
      </Drawer>

      <style>
        {`
          @media (max-width: 900px) {
            .audit-summary-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AuditHistoryPage;