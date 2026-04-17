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
}

export default function Scorecard({
  scores,
  comparisonScores,
  comparisonLabel = 'Previous',
  editable = false,
  onScoreChange,
  title = 'Operating Simply Scorecard',
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
    if (score >= 6) return '#00CCEE'; // Cyan
    if (score >= 4) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #2A2A38',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              color: '#F0F0F5',
              fontSize: '1.25rem',
              fontWeight: '700',
            }}
          >
            {title}
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: '#8888A0', fontSize: '0.9rem' }}>
            10 pillars of business health, scored 1-10
          </p>
        </div>
        <div
          style={{
            background: `${getHealthColor(avgScore)}22`,
            border: `1px solid ${getHealthColor(avgScore)}`,
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              color: getHealthColor(avgScore),
              fontSize: '1.5rem',
              fontWeight: '700',
            }}
          >
            {avgScore.toFixed(1)}
          </span>
          <span style={{ color: '#8888A0', fontSize: '0.75rem', display: 'block' }}>
            Average
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div style={{ height: '400px', marginBottom: '1.5rem' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid stroke="#2A2A38" />
            <PolarAngleAxis
              dataKey="pillar"
              tick={{ fill: '#8888A0', fontSize: 12 }}
              tickLine={{ stroke: '#2A2A38' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: '#55556A', fontSize: 10 }}
              tickCount={6}
              axisLine={false}
            />
            {comparisonScores && (
              <Radar
                name={comparisonLabel}
                dataKey="previous"
                stroke="#55556A"
                fill="#55556A"
                fillOpacity={0.2}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}
            <Radar
              name="Current"
              dataKey="current"
              stroke="#00CCEE"
              fill="#00CCEE"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                background: '#09090F',
                border: '1px solid #2A2A38',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#F0F0F5' }}
              itemStyle={{ color: '#8888A0' }}
              formatter={(value, name) => [
                `${value}/10`,
                name === 'current' ? 'Current' : comparisonLabel,
              ]}
            />
            {comparisonScores && <Legend />}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Pillar Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.75rem',
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
                background: isHovered ? '#2A2A38' : '#09090F',
                borderRadius: '8px',
                padding: '0.75rem',
                border: '1px solid #2A2A38',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    color: '#F0F0F5',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                  }}
                >
                  {pillar.label}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {prevScore !== undefined && (
                    <span style={{ color: '#55556A', fontSize: '0.75rem' }}>
                      {prevScore}
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
                        width: '40px',
                        background: '#1C1C26',
                        border: '1px solid #2A2A38',
                        borderRadius: '4px',
                        color: getHealthColor(score),
                        fontSize: '1rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        padding: '0.25rem',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: getHealthColor(score),
                        fontSize: '1rem',
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
                  height: '4px',
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
              {isHovered && (
                <p
                  style={{
                    margin: '0.5rem 0 0',
                    color: '#8888A0',
                    fontSize: '0.75rem',
                  }}
                >
                  {pillar.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
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
