'use client';

import { useState } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

// The 10 pillars of Operating Simply
export const OPERATING_SIMPLY_PILLARS = [
  { key: 'vision', label: 'Vision', description: 'Clear direction and future state' },
  { key: 'mission', label: 'Mission', description: 'Purpose and core activities' },
  { key: 'values', label: 'Values', description: 'Guiding principles and beliefs' },
  { key: 'strategy', label: 'Strategy', description: 'Approach to achieving goals' },
  { key: 'people', label: 'People', description: 'Team building and culture' },
  { key: 'process', label: 'Process', description: 'Operations and workflows' },
  { key: 'product', label: 'Product', description: 'Offerings and quality' },
  { key: 'finance', label: 'Finance', description: 'Financial health and management' },
  { key: 'marketing', label: 'Marketing', description: 'Brand and customer acquisition' },
  { key: 'growth', label: 'Growth', description: 'Scaling and expansion' },
];

export interface PillarScores {
  vision: number;
  mission: number;
  values: number;
  strategy: number;
  people: number;
  process: number;
  product: number;
  finance: number;
  marketing: number;
  growth: number;
}

export interface ScorecardSnapshot {
  date: string;
  label?: string;
  scores: PillarScores;
}

interface ScorecardProps {
  scores: PillarScores;
  comparisonScores?: PillarScores;
  comparisonLabel?: string;
  editable?: boolean;
  onScoreChange?: (pillar: keyof PillarScores, value: number) => void;
  title?: string;
  /** Compact mode for embedding - hides header and pillar cards */
  compact?: boolean;
}

export default function Scorecard({
  scores,
  comparisonScores,
  comparisonLabel = 'Previous',
  editable = false,
  onScoreChange,
  title = 'Operating Simply Scorecard',
  compact = false,
}: ScorecardProps) {
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  // Transform scores to recharts format
  const chartData = OPERATING_SIMPLY_PILLARS.map((pillar) => ({
    pillar: pillar.label,
    key: pillar.key,
    description: pillar.description,
    current: scores[pillar.key as keyof PillarScores] || 0,
    ...(comparisonScores && {
      previous: comparisonScores[pillar.key as keyof PillarScores] || 0,
    }),
  }));

  // Calculate average score
  const avgScore =
    Object.values(scores).reduce((sum, val) => sum + (val || 0), 0) / 10;

  // Determine overall health color
  const getHealthColor = (score: number) => {
    if (score >= 8) return '#22C55E'; // Green
    if (score >= 6) return '#00D4FF'; // Bright Cyan
    if (score >= 4) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  // Custom tick renderer for clean label positioning
  const renderPolarAngleAxisTick = (props: any) => {
    const { payload, x, y, cx, cy } = props;

    // Calculate angle and adjust position to push labels further out
    const angle = Math.atan2(y - cy, x - cx);
    const labelRadius = 1.15; // Push labels 15% further out
    const newX = cx + (x - cx) * labelRadius;
    const newY = cy + (y - cy) * labelRadius;

    // Determine text anchor based on position
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    const angleInDegrees = (angle * 180) / Math.PI;

    if (angleInDegrees > 45 && angleInDegrees < 135) {
      textAnchor = 'middle'; // bottom
    } else if (angleInDegrees >= 135 || angleInDegrees <= -135) {
      textAnchor = 'end'; // left
    } else if (angleInDegrees >= -135 && angleInDegrees < -45) {
      textAnchor = 'middle'; // top
    } else {
      textAnchor = 'start'; // right
    }

    return (
      <text
        x={newX}
        y={newY}
        textAnchor={textAnchor}
        dominantBaseline="central"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          fill: '#E8E8F0',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {payload.value}
      </text>
    );
  };

  // Custom legend renderer
  const renderLegend = (props: any) => {
    const { payload } = props;
    if (!payload || payload.length === 0) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '0.5rem',
      }}>
        {payload.map((entry: any, index: number) => (
          <div
            key={`legend-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: entry.color,
            }} />
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#B8B8C8',
            }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        background: compact ? 'transparent' : '#1C1C26',
        borderRadius: compact ? 0 : '16px',
        padding: compact ? 0 : '1.5rem',
        border: compact ? 'none' : '1px solid #2A2A38',
      }}
    >
      {/* Header - Hidden in compact mode */}
      {!compact && title && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                color: '#F0F0F5',
                fontSize: '1.15rem',
                fontWeight: '600',
              }}
            >
              {title}
            </h3>
            <p style={{ margin: '0.2rem 0 0', color: '#8888A0', fontSize: '0.85rem' }}>
              10 pillars of business health
            </p>
          </div>
          <div
            style={{
              background: `${getHealthColor(avgScore)}15`,
              border: `1px solid ${getHealthColor(avgScore)}40`,
              borderRadius: '8px',
              padding: '0.4rem 0.8rem',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                color: getHealthColor(avgScore),
                fontSize: '1.4rem',
                fontWeight: '700',
              }}
            >
              {avgScore.toFixed(1)}
            </span>
            <span style={{ color: '#8888A0', fontSize: '0.7rem', display: 'block', marginTop: '-2px' }}>
              avg
            </span>
          </div>
        </div>
      )}

      {/* Radar Chart - Premium Styling */}
      <div style={{
        height: compact ? '320px' : '360px',
        marginBottom: compact ? 0 : '1rem',
        position: 'relative',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius="62%"
            margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
          >
            {/* Grid lines - thin and subtle */}
            <PolarGrid
              stroke="#2A2A38"
              strokeWidth={1}
              gridType="polygon"
            />

            {/* Pillar labels - clean positioning */}
            <PolarAngleAxis
              dataKey="pillar"
              tick={renderPolarAngleAxisTick}
              tickLine={false}
              axisLine={false}
            />

            {/* Hide axis numbers completely */}
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
              tickCount={6}
            />

            {/* Comparison radar - dashed, muted */}
            {comparisonScores && (
              <Radar
                name={comparisonLabel}
                dataKey="previous"
                stroke="#7C3AED"
                fill="#7C3AED"
                fillOpacity={0.12}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
            )}

            {/* Current scores - hero element */}
            <Radar
              name="Current"
              dataKey="current"
              stroke="#00D4FF"
              fill="#00D4FF"
              fillOpacity={0.18}
              strokeWidth={2}
            />

            {/* Tooltip */}
            <Tooltip
              contentStyle={{
                background: '#13131A',
                border: '1px solid #2A2A38',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              labelStyle={{ color: '#F0F0F5', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: '#B8B8C8', fontSize: '13px' }}
              formatter={(value, name) => [
                `${value}/10`,
                name === 'current' ? 'Current' : comparisonLabel,
              ]}
            />

            {/* Legend - only show when comparing */}
            {comparisonScores && (
              <Legend
                content={renderLegend}
                verticalAlign="bottom"
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Pillar Details Grid - Hidden in compact mode */}
      {!compact && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '0.5rem',
          }}
        >
          {OPERATING_SIMPLY_PILLARS.map((pillar) => {
            const score = scores[pillar.key as keyof PillarScores] || 0;
            const prevScore = comparisonScores?.[pillar.key as keyof PillarScores];
            const isHovered = hoveredPillar === pillar.key;

            return (
              <div
                key={pillar.key}
                onMouseEnter={() => setHoveredPillar(pillar.key)}
                onMouseLeave={() => setHoveredPillar(null)}
                style={{
                  background: isHovered ? '#252532' : '#13131A',
                  borderRadius: '6px',
                  padding: '0.6rem',
                  border: '1px solid #2A2A38',
                  transition: 'background 0.15s ease',
                  cursor: 'default',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      color: '#C8C8D0',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                    }}
                  >
                    {pillar.label}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {prevScore !== undefined && prevScore !== score && (
                      <span style={{ color: '#55556A', fontSize: '0.7rem' }}>
                        {prevScore}→
                      </span>
                    )}
                    {editable ? (
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={score}
                        onChange={(e) =>
                          onScoreChange?.(
                            pillar.key as keyof PillarScores,
                            Math.min(10, Math.max(1, parseInt(e.target.value) || 1))
                          )
                        }
                        style={{
                          width: '32px',
                          background: '#1C1C26',
                          border: '1px solid #2A2A38',
                          borderRadius: '4px',
                          color: getHealthColor(score),
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: '0.15rem',
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          color: getHealthColor(score),
                          fontSize: '0.9rem',
                          fontWeight: '700',
                        }}
                      >
                        {score}
                      </span>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: '3px',
                    background: '#2A2A38',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${(score / 10) * 100}%`,
                      background: getHealthColor(score),
                      borderRadius: '2px',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Default empty scores helper
export function getEmptyScores(): PillarScores {
  return {
    vision: 5,
    mission: 5,
    values: 5,
    strategy: 5,
    people: 5,
    process: 5,
    product: 5,
    finance: 5,
    marketing: 5,
    growth: 5,
  };
}
