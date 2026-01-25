'use client';
import { CSSProperties } from 'react';

interface TestResults {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface TestResultsDisplayProps {
  results: TestResults;
}

export default function TestResultsDisplay({ results }: TestResultsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#F59E0B';
    if (score >= 4) return '#F97316';
    return '#EF4444';
  };

  const scoreColor = getScoreColor(results.score);
  const scorePercent = (results.score / 10) * 100;

  return (
    <div style={containerStyle}>
      {/* Score */}
      <div style={scoreContainerStyle}>
        <div style={scoreLabelStyle}>Resonance Score</div>
        <div style={scoreValueContainerStyle}>
          <span style={{ ...scoreValueStyle, color: scoreColor }}>
            {results.score}
          </span>
          <span style={scoreMaxStyle}>/10</span>
        </div>
        <div style={scoreBarContainerStyle}>
          <div
            style={{
              ...scoreBarStyle,
              width: `${scorePercent}%`,
              backgroundColor: scoreColor,
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div style={summaryStyle}>{results.summary}</div>

      {/* Strengths */}
      {results.strengths.length > 0 && (
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>
            <span style={iconStyle}>+</span> What Works
          </h4>
          <ul style={listStyle}>
            {results.strengths.map((strength, i) => (
              <li key={i} style={strengthItemStyle}>{strength}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Weaknesses */}
      {results.weaknesses.length > 0 && (
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>
            <span style={{ ...iconStyle, color: '#EF4444' }}>-</span> What Doesn't Resonate
          </h4>
          <ul style={listStyle}>
            {results.weaknesses.map((weakness, i) => (
              <li key={i} style={weaknessItemStyle}>{weakness}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {results.suggestions.length > 0 && (
        <div style={sectionStyle}>
          <h4 style={sectionTitleStyle}>
            <span style={{ ...iconStyle, color: '#F59E0B' }}>*</span> Suggestions
          </h4>
          <ul style={listStyle}>
            {results.suggestions.map((suggestion, i) => (
              <li key={i} style={suggestionItemStyle}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const containerStyle: CSSProperties = {
  backgroundColor: 'var(--zander-off-white)',
  borderRadius: '8px',
  padding: '1.25rem',
  border: '1px solid var(--zander-border-gray)',
};

const scoreContainerStyle: CSSProperties = {
  marginBottom: '1rem',
};

const scoreLabelStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: '600',
  color: 'var(--zander-gray)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '0.5rem',
};

const scoreValueContainerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '0.25rem',
  marginBottom: '0.5rem',
};

const scoreValueStyle: CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: '700',
  lineHeight: 1,
};

const scoreMaxStyle: CSSProperties = {
  fontSize: '1rem',
  color: 'var(--zander-gray)',
};

const scoreBarContainerStyle: CSSProperties = {
  height: '8px',
  backgroundColor: '#E5E7EB',
  borderRadius: '4px',
  overflow: 'hidden',
};

const scoreBarStyle: CSSProperties = {
  height: '100%',
  borderRadius: '4px',
  transition: 'width 0.5s ease',
};

const summaryStyle: CSSProperties = {
  fontSize: '0.95rem',
  color: 'var(--zander-dark-gray)',
  lineHeight: '1.5',
  marginBottom: '1.25rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--zander-border-gray)',
};

const sectionStyle: CSSProperties = {
  marginBottom: '1rem',
};

const sectionTitleStyle: CSSProperties = {
  margin: '0 0 0.5rem 0',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--zander-navy)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const iconStyle: CSSProperties = {
  fontSize: '1rem',
  fontWeight: '700',
  color: '#10B981',
};

const listStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '1.25rem',
  fontSize: '0.875rem',
  lineHeight: '1.6',
};

const strengthItemStyle: CSSProperties = {
  color: 'var(--zander-dark-gray)',
  marginBottom: '0.25rem',
};

const weaknessItemStyle: CSSProperties = {
  color: 'var(--zander-dark-gray)',
  marginBottom: '0.25rem',
};

const suggestionItemStyle: CSSProperties = {
  color: 'var(--zander-dark-gray)',
  marginBottom: '0.25rem',
};
