'use client';
import { FunnelStage } from '../types';
import { getStageTypeInfo, formatNumber, formatConversionRate, calculateFunnelConversion } from '../utils';

interface FunnelAnalyticsProps {
  stages: FunnelStage[];
  totalVisits: number;
  totalConversions: number;
}

export default function FunnelAnalytics({
  stages,
  totalVisits,
  totalConversions,
}: FunnelAnalyticsProps) {
  const sortedStages = [...stages].sort((a, b) => a.stageOrder - b.stageOrder);
  const overallConversion = calculateFunnelConversion(totalVisits, totalConversions);

  // Calculate max entry count for bar scaling
  const maxEntryCount = Math.max(...sortedStages.map((s) => s.entryCount), 1);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        border: '2px solid var(--zander-border-gray)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--zander-navy)',
          }}
        >
          Funnel Analytics
        </h3>
        <div
          style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '6px',
            background: overallConversion >= 10 ? 'rgba(39, 174, 96, 0.1)' : 'var(--zander-off-white)',
            color: overallConversion >= 10 ? '#27AE60' : 'var(--zander-gray)',
            fontSize: '0.8rem',
            fontWeight: '600',
          }}
        >
          {formatConversionRate(overallConversion)} overall
        </div>
      </div>

      {/* Summary Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1rem',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'var(--zander-off-white)',
          borderRadius: '8px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            TOTAL VISITS
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--zander-navy)' }}>
            {formatNumber(totalVisits)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            CONVERSIONS
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#27AE60' }}>
            {formatNumber(totalConversions)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--zander-gray)', marginBottom: '0.25rem' }}>
            CONV. RATE
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#F57C00' }}>
            {formatConversionRate(overallConversion)}
          </div>
        </div>
      </div>

      {/* Stage Funnel Bars */}
      {sortedStages.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--zander-gray)',
            fontSize: '0.9rem',
          }}
        >
          Add stages to see analytics
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {sortedStages.map((stage, index) => {
            const stageInfo = getStageTypeInfo(stage.stageType);
            const barWidth = maxEntryCount > 0 ? (stage.entryCount / maxEntryCount) * 100 : 0;
            const prevStage = index > 0 ? sortedStages[index - 1] : null;
            const dropOffRate = prevStage && prevStage.entryCount > 0
              ? ((prevStage.entryCount - stage.entryCount) / prevStage.entryCount) * 100
              : 0;

            return (
              <div key={stage.id}>
                {/* Drop-off indicator between stages */}
                {index > 0 && dropOffRate > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: dropOffRate > 50 ? 'var(--zander-red)' : 'var(--zander-gray)',
                        fontWeight: '500',
                      }}
                    >
                      ↓ {dropOffRate.toFixed(1)}% drop-off
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  {/* Stage icon */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: `${stageInfo.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    {stageInfo.icon}
                  </div>

                  {/* Bar container */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.375rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          color: 'var(--zander-navy)',
                        }}
                      >
                        {stage.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          color: 'var(--zander-navy)',
                        }}
                      >
                        {formatNumber(stage.entryCount)}
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div
                      style={{
                        height: '24px',
                        background: 'var(--zander-off-white)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.max(barWidth, 2)}%`,
                          background: stageInfo.color,
                          borderRadius: '4px',
                          transition: 'width 0.5s ease',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: barWidth > 15 ? '0.5rem' : 0,
                        }}
                      >
                        {barWidth > 15 && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              color: 'white',
                            }}
                          >
                            {formatConversionRate(stage.conversionRate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      {sortedStages.length > 0 && (
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--zander-border-gray)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          {sortedStages.map((stage) => {
            const stageInfo = getStageTypeInfo(stage.stageType);
            return (
              <div
                key={stage.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.7rem',
                  color: 'var(--zander-gray)',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: stageInfo.color,
                  }}
                />
                {stage.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
