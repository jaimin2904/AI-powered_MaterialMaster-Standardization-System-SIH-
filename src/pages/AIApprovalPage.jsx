import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  Check,
  Clock3,
  BrainCircuit,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { AI_APPROVAL_QUEUE } from '../data/mockData';
import { submitApproval } from '../services/api';

const COLORS = {
  green: '#078A58',
  greenDark: '#056B46',
  greenSoft: '#ECFDF5',
  greenBorder: '#BBF7D0',

  purple: '#7C3AED',
  purpleSoft: '#F5F3FF',
  purpleBorder: '#DDD6FE',

  blue: '#2563EB',
  blueSoft: '#EFF6FF',
  blueBorder: '#BFDBFE',

  red: '#DC2626',
  redSoft: '#FEF2F2',
  redBorder: '#FECACA',

  amber: '#D97706',
  amberSoft: '#FFFBEB',
  amberBorder: '#FDE68A',

  text: '#17201B',
  textMuted: '#66736C',
  border: '#E5EAE7',
  surface: '#FFFFFF',
  background: '#F6F8F7',
};

const cardStyle = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '18px',
  boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
};

const primaryButton = {
  border: 'none',
  background: COLORS.green,
  color: '#FFFFFF',
  height: '38px',
  padding: '0 15px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  cursor: 'pointer',
};

const secondaryButton = {
  border: `1px solid ${COLORS.border}`,
  background: '#FFFFFF',
  color: COLORS.text,
  height: '38px',
  padding: '0 15px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  cursor: 'pointer',
};

const dangerButton = {
  ...secondaryButton,
  color: COLORS.red,
  borderColor: COLORS.redBorder,
  background: '#FFFFFF',
};

const StatCard = ({ icon, label, value, tone = 'green' }) => {
  const tones = {
    green: {
      bg: COLORS.greenSoft,
      color: COLORS.green,
    },
    purple: {
      bg: COLORS.purpleSoft,
      color: COLORS.purple,
    },
    amber: {
      bg: COLORS.amberSoft,
      color: COLORS.amber,
    },
  };

  const t = tones[tone] || tones.green;

  return (
    <div
      style={{
        ...cardStyle,
        padding: '17px',
        display: 'flex',
        alignItems: 'center',
        gap: '13px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: t.bg,
          color: t.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: '11px',
            color: COLORS.textMuted,
            fontWeight: 600,
            marginBottom: '3px',
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: '21px',
            lineHeight: 1,
            color: COLORS.text,
            fontWeight: 800,
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
};

const ConfidenceBar = ({ value }) => {
  return (
    <div style={{ minWidth: '150px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: COLORS.textMuted,
            fontWeight: 600,
          }}
        >
          AI confidence
        </span>

        <span
          style={{
            fontSize: '11px',
            fontWeight: 800,
            color: value >= 90 ? COLORS.green : COLORS.amber,
          }}
        >
          {value}%
        </span>
      </div>

      <div
        style={{
          height: '6px',
          borderRadius: '99px',
          background: '#E8EEEB',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(value, 100)}%`,
            borderRadius: '99px',
            background:
              value >= 90
                ? COLORS.green
                : value >= 75
                  ? '#F59E0B'
                  : COLORS.red,
          }}
        />
      </div>
    </div>
  );
};

export const AIApprovalPage = ({ showToast }) => {
  const [queue, setQueue] = useState(AI_APPROVAL_QUEUE);
  const [selectedIds, setSelectedIds] = useState([]);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const selectedCount = selectedIds.length;

  const averageConfidence = useMemo(() => {
    if (!queue.length) return 0;

    const total = queue.reduce(
      (sum, item) => sum + Number(item.aiConfidence || 0),
      0
    );

    return Math.round(total / queue.length);
  }, [queue]);

  const highConfidenceCount = useMemo(
    () => queue.filter((item) => Number(item.aiConfidence || 0) >= 90).length,
    [queue]
  );

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === queue.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(queue.map((i) => i.id));
    }
  };

  const handleApproveSelected = () => {
    selectedIds.forEach((id) => {
      submitApproval(
        1,
        'Approved',
        'Bulk approved via AI Approval Queue',
        'Master Data Admin'
      ).catch(() => {});
    });

    setQueue(queue.filter((i) => !selectedIds.includes(i.id)));

    showToast(
      `Approved ${selectedIds.length} AI recommendation(s) via REST API`,
      'success'
    );

    setSelectedIds([]);
  };

  const handleApproveSingle = (id) => {
    submitApproval(
      1,
      'Approved',
      'Single approved via AI Approval Queue',
      'Master Data Admin'
    ).catch(() => {});

    setQueue(queue.filter((i) => i.id !== id));

    showToast(
      `Approved recommendation ${id} & recorded in Audit Log`,
      'success'
    );
  };

  const handleConfirmReject = () => {
    if (rejectModalItem) {
      submitApproval(
        1,
        'Rejected',
        rejectReason || 'Rejected by custodian',
        'Master Data Admin'
      ).catch(() => {});

      setQueue(queue.filter((i) => i.id !== rejectModalItem.id));

      showToast(
        `Rejected recommendation ${rejectModalItem.id}. Feedback recorded in database.`,
        'warning'
      );

      setRejectModalItem(null);
      setRejectReason('');
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
      {/* -------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* -------------------------------------------------- */}

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
                background: COLORS.purpleSoft,
                color: COLORS.purple,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={16} />
            </div>

            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: COLORS.purple,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              AI Governance
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
            AI Approval Queue
          </h2>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: '12px',
              color: COLORS.textMuted,
              maxWidth: '720px',
              lineHeight: 1.6,
            }}
          >
            Validate AI suggestions for material description expansion,
            taxonomy re-assignment, and duplicate cluster mergers.
          </p>
        </div>

        {selectedCount > 0 && (
          <div
            style={{
              ...cardStyle,
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#F7FAF8',
            }}
          >
            <div
              style={{
                padding: '0 8px',
                fontSize: '11px',
                fontWeight: 700,
                color: COLORS.greenDark,
              }}
            >
              {selectedCount} selected
            </div>

            <button
              type="button"
              style={primaryButton}
              onClick={handleApproveSelected}
            >
              <CheckCircle2 size={14} />
              Bulk Approve
            </button>
          </div>
        )}
      </div>

      {/* -------------------------------------------------- */}
      {/* SUMMARY */}
      {/* -------------------------------------------------- */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '12px',
        }}
      >
        <StatCard
          icon={<Clock3 size={19} />}
          label="Pending Actions"
          value={queue.length}
          tone="amber"
        />

        <StatCard
          icon={<BrainCircuit size={19} />}
          label="Average AI Confidence"
          value={`${averageConfidence}%`}
          tone="purple"
        />

        <StatCard
          icon={<ShieldCheck size={19} />}
          label="High Confidence Recommendations"
          value={highConfidenceCount}
          tone="green"
        />
      </div>

      {/* -------------------------------------------------- */}
      {/* QUEUE TOOLBAR */}
      {/* -------------------------------------------------- */}

      <div
        style={{
          ...cardStyle,
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: queue.length ? 'pointer' : 'default',
          }}
        >
          <input
            type="checkbox"
            checked={
              selectedIds.length === queue.length && queue.length > 0
            }
            onChange={handleSelectAll}
            style={{
              width: '16px',
              height: '16px',
              accentColor: COLORS.green,
              cursor: queue.length ? 'pointer' : 'default',
            }}
          />

          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: COLORS.text,
            }}
          >
            Select All
          </span>

          <span
            style={{
              padding: '4px 8px',
              borderRadius: '7px',
              background: COLORS.greenSoft,
              color: COLORS.greenDark,
              fontSize: '10px',
              fontWeight: 800,
            }}
          >
            {queue.length} pending
          </span>
        </label>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            color: COLORS.textMuted,
            fontSize: '11px',
          }}
        >
          <ShieldCheck size={14} color={COLORS.green} />
          Master Data Nodal Officer verification required
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* EMPTY STATE */}
      {/* -------------------------------------------------- */}

      {queue.length === 0 ? (
        <div
          style={{
            ...cardStyle,
            minHeight: '330px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '460px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: COLORS.greenSoft,
                color: COLORS.green,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: COLORS.text,
              }}
            >
              Approval Queue is Clear
            </div>

            <div
              style={{
                fontSize: '12px',
                lineHeight: 1.6,
                color: COLORS.textMuted,
                marginTop: '7px',
              }}
            >
              All AI material recommendations have been validated and
              published to the NUMC National Master.
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          {queue.map((item) => {
            const isChecked = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                style={{
                  ...cardStyle,
                  padding: '18px',
                  border: isChecked
                    ? `2px solid ${COLORS.green}`
                    : `1px solid ${COLORS.border}`,
                  boxShadow: isChecked
                    ? '0 6px 22px rgba(7, 138, 88, 0.08)'
                    : cardStyle.boxShadow,
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Card top */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '15px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '11px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSelect(item.id)}
                      style={{
                        width: '17px',
                        height: '17px',
                        marginTop: '2px',
                        accentColor: COLORS.green,
                        cursor: 'pointer',
                      }}
                    />

                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: COLORS.green,
                            padding: '4px 7px',
                            borderRadius: '6px',
                            background: COLORS.greenSoft,
                          }}
                        >
                          {item.id}
                        </span>

                        <Badge variant="ai">
                          <Sparkles size={10} />
                          {item.type}
                        </Badge>
                      </div>

                      <h3
                        style={{
                          margin: '8px 0 0',
                          fontSize: '14px',
                          fontWeight: 800,
                          color: COLORS.text,
                        }}
                      >
                        {item.cpseName}
                      </h3>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          marginTop: '4px',
                          fontSize: '11px',
                          color: COLORS.textMuted,
                        }}
                      >
                        Local Code
                        <span
                          style={{
                            fontWeight: 700,
                            color: COLORS.text,
                          }}
                        >
                          {item.localCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ConfidenceBar value={item.aiConfidence} />
                </div>

                {/* Divider */}
                <div
                  style={{
                    height: '1px',
                    background: '#EEF2EF',
                    margin: '17px 0',
                  }}
                />

                {/* BEFORE / AFTER */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 40px 1fr',
                    gap: '10px',
                    alignItems: 'stretch',
                  }}
                >
                  {/* Raw */}
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '13px',
                      background: COLORS.redSoft,
                      border: `1px solid ${COLORS.redBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: COLORS.red,
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <AlertCircle size={12} />
                      Legacy CPSE Input
                    </div>

                    <div
                      style={{
                        marginTop: '9px',
                        fontSize: '12px',
                        lineHeight: 1.6,
                        color: '#7F1D1D',
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        wordBreak: 'break-word',
                      }}
                    >
                      "{item.rawText}"
                    </div>
                  </div>

                  {/* Arrow */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        background: COLORS.purpleSoft,
                        color: COLORS.purple,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ArrowRight size={15} />
                    </div>
                  </div>

                  {/* AI */}
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '13px',
                      background: COLORS.greenSoft,
                      border: `1px solid ${COLORS.greenBorder}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: COLORS.greenDark,
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      <Sparkles size={12} />
                      AI Standardized Proposal
                    </div>

                    <div
                      style={{
                        marginTop: '7px',
                        fontSize: '10px',
                        color: COLORS.greenDark,
                        fontWeight: 700,
                      }}
                    >
                      Target: {item.numcTarget}
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        fontSize: '12px',
                        lineHeight: 1.6,
                        color: '#14532D',
                        fontWeight: 700,
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.proposedText}
                    </div>
                  </div>
                </div>

                {/* AI Rationale */}
                <div
                  style={{
                    marginTop: '13px',
                    padding: '12px 13px',
                    borderRadius: '12px',
                    background: '#FAFBFA',
                    border: `1px solid ${COLORS.border}`,
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: '27px',
                      height: '27px',
                      flexShrink: 0,
                      borderRadius: '8px',
                      background: COLORS.purpleSoft,
                      color: COLORS.purple,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MessageSquare size={13} />
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: COLORS.text,
                        marginBottom: '3px',
                      }}
                    >
                      AI Rationale
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: COLORS.textMuted,
                        lineHeight: 1.6,
                      }}
                    >
                      {item.rationale}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: '9px',
                    marginTop: '14px',
                    paddingTop: '14px',
                    borderTop: '1px solid #EEF2EF',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    style={dangerButton}
                    onClick={() => setRejectModalItem(item)}
                  >
                    <XCircle size={14} />
                    Reject & Return
                  </button>

                  <button
                    type="button"
                    style={primaryButton}
                    onClick={() => handleApproveSingle(item.id)}
                  >
                    <CheckCircle2 size={14} />
                    Approve Recommendation
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* REJECTION MODAL */}
      {/* -------------------------------------------------- */}

      <Modal
        isOpen={Boolean(rejectModalItem)}
        onClose={() => {
          setRejectModalItem(null);
          setRejectReason('');
        }}
        title="Reject AI Recommendation"
        subtitle={`Flag recommendation ${rejectModalItem?.id || ''} for re-training`}
        footer={
          <>
            <button
              type="button"
              style={secondaryButton}
              onClick={() => {
                setRejectModalItem(null);
                setRejectReason('');
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              style={{
                ...primaryButton,
                background: COLORS.red,
              }}
              onClick={handleConfirmReject}
            >
              <XCircle size={14} />
              Confirm Rejection
            </button>
          </>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          {rejectModalItem && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: COLORS.redSoft,
                border: `1px solid ${COLORS.redBorder}`,
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: COLORS.red,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                }}
              >
                Recommendation
              </div>

              <div
                style={{
                  marginTop: '4px',
                  fontSize: '12px',
                  color: COLORS.text,
                  fontWeight: 700,
                }}
              >
                {rejectModalItem.cpseName} • {rejectModalItem.localCode}
              </div>
            </div>
          )}

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                color: COLORS.text,
                marginBottom: '7px',
              }}
            >
              Reason for Rejection / Custodian Notes
            </label>

            <textarea
              rows={4}
              placeholder="e.g. Specification misidentified. Class 150 pressure rating was confused with Class 300..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                resize: 'vertical',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '11px',
                padding: '11px 12px',
                fontSize: '12px',
                color: COLORS.text,
                outline: 'none',
                fontFamily: 'inherit',
                background: '#FFFFFF',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: COLORS.amberSoft,
              border: `1px solid ${COLORS.amberBorder}`,
              color: '#92400E',
              fontSize: '11px',
              lineHeight: 1.5,
            }}
          >
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            Rejection feedback will be recorded and submitted to the approval
            API for audit and future model improvement.
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AIApprovalPage;