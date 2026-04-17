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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import { OPERATING_SIMPLY_PILLARS, PillarScores, ScorecardSnapshot } from './Scorecard';

interface ScorecardComparisonProps {
  currentScores: PillarScores;
  snapshots: ScorecardSnapshot[];
  title?: string;
}

export default function ScorecardComparison({
  currentScores,
  snapshots,
  title = 'Progress Over Time',
}: ScorecardComparisonProps) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<number>(
    snapshots.length > 0 ? 0 : -1
  );
  const [viewMode, setViewMode] = useState<'radar' | 'bar'>('radar');

  const comparisonScores = selectedSnapshot >= 0 ? snapshots[selectedSnapshot]?.scores : undefined;
  const comparisonLabel = selectedSnapshot >= 0
    ? (snapshots[selectedSnapshot]?.label || 'Initial')
    : 'Initial';

  // Calculate improvement for each pillar
  const getImprovement = (pillar: keyof PillarScores): number => {
    if (!comparisonScores) return 0;
    return currentScores[pillar] - comparisonScores[pillar];
  };

  // Transform scores to recharts format
  const chartData = OPERATING_SIMPLY_PILLARS.map((pillar) => ({
    pillar: pillar.label,
    key: pillar.key,
    current: currentScores[pillar.key as keyof PillarScores] || 0,
    previous: comparisonScores?.[pillar.key as keyof PillarScores] || 0,
  }));

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

  // Calculate totals
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

  // Custom tick renderer for clean label positioning
  const renderPolarAngleAxisTick = (props: any) => {
    const { payload, x, y, cx, cy } = props;

    const angle = Math.atan2(y - cy, x - cx);
    const labelRadius = 1.05;
    const newX = cx + (x - cx) * labelRadius;
    const newY = cy + (y - cy) * labelRadius;

    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    const angleInDegrees = (angle * 180) / Math.PI;

    if (angleInDegrees > 45 && angleInDegrees < 135) {
      textAnchor = 'middle';
    } else if (angleInDegrees >= 135 || angleInDegrees <= -135) {
      textAnchor = 'end';
    } else if (angleInDegrees >= -135 && angleInDegrees < -45) {
      textAnchor = 'middle';
    } else {
      textAnchor = 'start';
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
  const renderLegend = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        marginTop: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00D4FF',
          }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#B8B8C8' }}>
            Current
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#7C3AED',
          }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: '#B8B8C8' }}>
            {comparisonLabel}
          </span>
        </div>
      </div>
    );
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
      {/* Header with controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem',
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
            Track improvements over time
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* View mode toggle */}
          <div
            style={{
              display: 'flex',
              background: '#13131A',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('radar')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'radar' ? '#2A2A38' : 'transparent',
                color: viewMode === 'radar' ? '#00D4FF' : '#8888A0',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Radar
            </button>
            <button
              onClick={() => setViewMode('bar')}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'bar' ? '#2A2A38' : 'transparent',
                color: viewMode === 'bar' ? '#00D4FF' : '#8888A0',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Bar
            </button>
          </div>

          {/* Snapshot selector */}
          {snapshots.length > 1 && (
            <select
              value={selectedSnapshot}
              onChange={(e) => setSelectedSnapshot(parseInt(e.target.value))}
              style={{
                padding: '0.4rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #2A2A38',
                background: '#13131A',
                color: '#F0F0F5',
                fontSize: '0.8rem',
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
            gap: '0.75rem',
            marginBottom: '1rem',
          }}
        >
          <div
            style={{
              background: '#13131A',
              borderRadius: '8px',
              padding: '0.75rem',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#8888A0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Previous
            </span>
            <p style={{ margin: '0.15rem 0 0', color: '#7C3AED', fontSize: '1.3rem', fontWeight: '700' }}>
              {avgPrevious.toFixed(1)}
            </p>
          </div>
          <div
            style={{
              background: '#13131A',
              borderRadius: '8px',
              padding: '0.75rem',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#8888A0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Current
            </span>
            <p style={{ margin: '0.15rem 0 0', color: '#00D4FF', fontSize: '1.3rem', fontWeight: '700' }}>
              {avgCurrent.toFixed(1)}
            </p>
          </div>
          <div
            style={{
              background: totalImprovement >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              borderRadius: '8px',
              padding: '0.75rem',
              textAlign: 'center',
            }}
          >
            <span style={{ color: '#8888A0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Change
            </span>
            <p
              style={{
                margin: '0.15rem 0 0',
                color: totalImprovement >= 0 ? '#22C55E' : '#EF4444',
                fontSize: '1.3rem',
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
        <div style={{ height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={140}
            >
              <PolarGrid
                stroke="#2A2A38"
                strokeWidth={1}
                gridType="polygon"
              />
              <PolarAngleAxis
                dataKey="pillar"
                tick={renderPolarAngleAxisTick}
                tickLine={false}
                axisLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 10]}
                tick={false}
                axisLine={false}
                tickCount={6}
              />
              {/* Previous/baseline - dashed, violet */}
              {comparisonScores && (
                <Radar
                  name={comparisonLabel}
                  dataKey="previous"
                  stroke="#7C3AED"
                  fill="#7C3AED"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              )}
              {/* Current - solid, cyan */}
              <Radar
                name="Current"
                dataKey="current"
                stroke="#00D4FF"
                fill="#00D4FF"
                fillOpacity={0.2}
                strokeWidth={2}
              />
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
            </RadarChart>
          </ResponsiveContainer>
          {/* Manual legend below chart */}
          {comparisonScores && renderLegend()}
        </div>
      ) : (
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={barChartData}
              layout="vertical"
              margin={{ top: 5, right: 20, bottom: 5, left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A38" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 10]}
                tick={{ fill: '#9090A8', fontSize: 9 }}
                tickLine={false}
                tickCount={6}
                axisLine={{ stroke: '#2A2A38' }}
              />
              <YAxis
                type="category"
                dataKey="pillar"
                tick={{ fill: '#E8E8F0', fontSize: 11, fontWeight: 400 }}
                tickLine={false}
                axisLine={false}
                width={90}
              />
              <Tooltip
                contentStyle={{
                  background: '#13131A',
                  border: '1px solid #2A2A38',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#F0F0F5', fontWeight: 600 }}
                formatter={(value, name) => [
                  `${value}/10`,
                  name === 'current' ? 'Current' : 'Previous',
                ]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              {comparisonScores && (
                <Bar
                  dataKey="previous"
                  name="Previous"
                  fill="#7C3AED"
                  fillOpacity={0.7}
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
              )}
              <Bar dataKey="current" name="Current" radius={[0, 4, 4, 0]} barSize={10}>
                {barChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.change > 0
                        ? '#22C55E'
                        : entry.change < 0
                        ? '#EF4444'
                        : '#00D4FF'
                    }
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pillar-by-pillar changes - compact grid */}
      {comparisonScores && (
        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.4rem',
            }}
          >
            {OPERATING_SIMPLY_PILLARS.map((pillar) => {
              const current = currentScores[pillar.key as keyof PillarScores] || 0;
              const previous = comparisonScores[pillar.key as keyof PillarScores] || 0;
              const change = current - previous;
              const isPositive = change > 0;
              const isNegative = change < 0;

              return (
                <div
                  key={pillar.key}
                  style={{
                    background: '#13131A',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ color: '#8888A0', fontSize: '0.7rem', display: 'block' }}>
                    {pillar.label}
                  </span>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <span style={{ color: '#7C3AED', fontSize: '0.8rem' }}>{previous}</span>
                    <span style={{ color: '#55556A', fontSize: '0.7rem' }}>→</span>
                    <span style={{ color: '#00D4FF', fontSize: '0.8rem', fontWeight: 600 }}>{current}</span>
                    <span
                      style={{
                        color: isPositive ? '#22C55E' : isNegative ? '#EF4444' : '#55556A',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        marginLeft: '0.15rem',
                      }}
                    >
                      {isPositive && '+'}{change !== 0 ? change : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
