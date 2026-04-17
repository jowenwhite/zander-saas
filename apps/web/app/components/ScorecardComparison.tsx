'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import Scorecard, { OPERATING_SIMPLY_PILLARS, PillarScores, ScorecardSnapshot } from './Scorecard';

interface ScorecardComparisonProps {
  currentScores: PillarScores;
  snapshots: ScorecardSnapshot[];
  title?: string;
}

export default function ScorecardComparison({
  currentScores,
  snapshots,
  title = 'Scorecard Comparison',
}: ScorecardComparisonProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<number>(
    snapshots.length > 0 ? 0 : -1
  );
  const [viewMode, setViewMode] = useState<'radar' | 'bar'>('radar');

  const comparisonScores = selectedSnapshot >= 0 ? snapshots[selectedSnapshot]?.scores : undefined;
  const comparisonLabel = selectedSnapshot >= 0
    ? (snapshots[selectedSnapshot]?.label || snapshots[selectedSnapshot]?.date)
    : undefined;

  // Calculate improvement for each pillar
  const getImprovement = (pillar: keyof PillarScores): number => {
    if (!comparisonScores) return 0;
    return currentScores[pillar] - comparisonScores[pillar];
  };

  // Bar chart data
  const barChartData = OPERATING_SIMPLY_PILLARS.map((pillar) => {
    const current = currentScores[pillar.key as keyof PillarScores] || 0;
    const previous = comparisonScores?.[pillar.key as keyof PillarScores] || 0;
    const change = current - previous;

    return {
      pillar: pillar.label,
      key: pillar.key,
      current,
      previous: comparisonScores ? previous : undefined,
      change,
    };
  });

  // Calculate total improvement
  const totalImprovement = comparisonScores
    ? Object.keys(currentScores).reduce(
        (sum, key) => sum + getImprovement(key as keyof PillarScores),
        0
      )
    : 0;

  const avgCurrent = Object.values(currentScores).reduce((a, b) => a + b, 0) / 10;
  const avgPrevious = comparisonScores
    ? Object.values(comparisonScores).reduce((a, b) => a + b, 0) / 10
    : 0;

  return (
    <div
      style={{
        background: '#1C1C26',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #2A2A38',
      }}
    >
      {/* Header with snapshot selector */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
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
            Compare your progress across assessments
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              background: '#09090F',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('radar')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'radar' ? '#2A2A38' : 'transparent',
                color: viewMode === 'radar' ? '#00CCEE' : '#8888A0',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Radar
            </button>
            <button
              onClick={() => setViewMode('bar')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'bar' ? '#2A2A38' : 'transparent',
                color: viewMode === 'bar' ? '#00CCEE' : '#8888A0',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Bar
            </button>
          </div>

          {/* Snapshot selector */}
          {snapshots.length > 0 && (
            <select
              value={selectedSnapshot}
              onChange={(e) => setSelectedSnapshot(parseInt(e.target.value))}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: '1px solid #2A2A38',
                background: '#09090F',
                color: '#F0F0F5',
                fontSize: '0.9rem',
              }}
            >
              {snapshots.map((snapshot, idx) => (
                <option key={idx} value={idx}>
                  {snapshot.label || snapshot.date}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Summary stats */}
      {comparisonScores && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              background: '#09090F',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#8888A0', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Previous Avg
            </span>
            <p style={{ margin: '0.25rem 0 0', color: '#55556A', fontSize: '1.5rem', fontWeight: '700' }}>
              {avgPrevious.toFixed(1)}
            </p>
          </div>
          <div
            style={{
              background: '#09090F',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#8888A0', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Current Avg
            </span>
            <p style={{ margin: '0.25rem 0 0', color: '#00CCEE', fontSize: '1.5rem', fontWeight: '700' }}>
              {avgCurrent.toFixed(1)}
            </p>
          </div>
          <div
            style={{
              background: totalImprovement >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#8888A0', fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Total Change
            </span>
            <p
              style={{
                margin: '0.25rem 0 0',
                color: totalImprovement >= 0 ? '#22C55E' : '#EF4444',
                fontSize: '1.5rem',
                fontWeight: '700',
              }}
            >
              {totalImprovement >= 0 ? '+' : ''}{totalImprovement}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      {viewMode === 'radar' ? (
        <Scorecard
          scores={currentScores}
          comparisonScores={comparisonScores}
          comparisonLabel={comparisonLabel}
          title=""
        />
      ) : (
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" />
              <XAxis
                type="number"
                domain={[0, 10]}
                tick={{ fill: '#8888A0', fontSize: 12 }}
                tickLine={{ stroke: '#2A2A38' }}
              />
              <YAxis
                type="category"
                dataKey="pillar"
                tick={{ fill: '#8888A0', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#2A2A38' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#09090F',
                  border: '1px solid #2A2A38',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F0F0F5' }}
                formatter={(value, name) => [
                  `${value}/10`,
                  name === 'current' ? 'Current' : 'Previous',
                ]}
              />
              <Legend />
              {comparisonScores && (
                <Bar dataKey="previous" name="Previous" fill="#55556A" radius={[0, 4, 4, 0]} />
              )}
              <Bar dataKey="current" name="Current" radius={[0, 4, 4, 0]}>
                {barChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.change > 0
                        ? '#22C55E'
                        : entry.change < 0
                        ? '#EF4444'
                        : '#00CCEE'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pillar-by-pillar changes */}
      {comparisonScores && (
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ color: '#F0F0F5', fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            Pillar Changes
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '0.5rem',
            }}
          >
            {OPERATING_SIMPLY_PILLARS.map((pillar) => {
              const change = getImprovement(pillar.key as keyof PillarScores);
              const isPositive = change > 0;
              const isNegative = change < 0;

              return (
                <div
                  key={pillar.key}
                  style={{
                    background: '#09090F',
                    borderRadius: '6px',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#8888A0', fontSize: '0.85rem' }}>
                    {pillar.label}
                  </span>
                  <span
                    style={{
                      color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#8888A0',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                    }}
                  >
                    {isPositive && '+'}{change}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
