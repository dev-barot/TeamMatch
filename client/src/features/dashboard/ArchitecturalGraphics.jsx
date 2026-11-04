import React from 'react';

/**
 * 3D Isometric architectural line drawing of building blocks with blue roof facets.
 * Exact match to the graphic seen in Applications and Messages views.
 */
export function IsometricBuilding({ width = 180, height = 110, style = {} }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 240 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      {/* Background building / left tower */}
      <g stroke="#0F1B33" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        {/* Left tower base faces */}
        <polygon points="40,95 85,120 85,55 40,30" fill="#F8FAFC" />
        <polygon points="85,120 135,90 135,25 85,55" fill="#FFFFFF" />
        {/* Left tower top roof */}
        <polygon points="40,30 85,55 135,25 90,0" fill="#1F4FE0" stroke="#0F1B33" />

        {/* Right tower angled block */}
        <polygon points="130,105 180,135 180,75 130,45" fill="#F8FAFC" />
        <polygon points="180,135 235,100 235,40 180,75" fill="#FFFFFF" />
        {/* Right tower roof face */}
        <polygon points="130,45 180,75 235,40 185,10" fill="#93C5FD" fillOpacity="0.45" stroke="#0F1B33" />
        {/* Blue accent panel on right tower roof */}
        <polygon points="155,27 180,42 208,25 183,10" fill="#1F4FE0" stroke="#0F1B33" />

        {/* Interior architectural construction lines */}
        <line x1="85" y1="55" x2="85" y2="120" stroke="#0F1B33" strokeWidth="1.5" />
        <line x1="180" y1="75" x2="180" y2="135" stroke="#0F1B33" strokeWidth="1.5" />
        <line x1="15" y1="108" x2="40" y2="95" stroke="#CBD5E1" strokeDasharray="3 3" />
        <line x1="235" y1="100" x2="250" y2="90" stroke="#CBD5E1" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

/**
 * Geometric accent trio: amber square, blue circle, ink diamond outline.
 */
export function GeometricAccents({ size = 18, style = {} }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', ...style }}>
      {/* Amber square */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#F59E0B',
          border: '1.5px solid #0F1B33',
        }}
      />
      {/* Blue circle */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: '#1F4FE0',
          border: '1.5px solid #0F1B33',
        }}
      />
      {/* Ink diamond outline */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          border: '1.5px solid #0F1B33',
          backgroundColor: '#FFFFFF',
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
}

/**
 * Circular Percentage Gauge with Blueprint styling.
 */
export function CircularGauge({
  percentage = 90,
  size = 88,
  strokeWidth = 9,
  primaryColor = '#1F4FE0',
  secondaryColor = '#F59E0B',
  trackColor = '#EEF2F6',
  showAmberAccent = true,
  style = {},
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="#FFFDF8"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Amber secondary highlight segment (if requested) */}
        {showAmberAccent && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={secondaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (0.28 * circumference)}
            strokeLinecap="butt"
          />
        )}
        {/* Primary royal blue progress stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={primaryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {/* Centered label */}
      <span
        style={{
          position: 'absolute',
          fontFamily: 'var(--font-sans)',
          fontWeight: '900',
          fontSize: `${Math.round(size * 0.28)}px`,
          letterSpacing: '-0.03em',
          color: '#0F1B33',
        }}
      >
        {percentage}%
      </span>
    </div>
  );
}

/**
 * 5-Segment capacity status bar for stat cards.
 */
export function SteppedCapacityBar({
  pattern = ['dark', 'dark', 'dark', 'amber', 'empty'],
  height = 8,
  style = {},
}) {
  const getColor = (type) => {
    switch (type) {
      case 'dark':
        return '#0F1B33';
      case 'blue':
        return '#1F4FE0';
      case 'amber':
        return '#F59E0B';
      default:
        return '#E2E8F0';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '4px',
        width: '100%',
        marginTop: '0.65rem',
        ...style,
      }}
    >
      {pattern.map((type, idx) => (
        <div
          key={idx}
          style={{
            flex: 1,
            height: `${height}px`,
            backgroundColor: getColor(type),
            borderRadius: '1px',
            border: type === 'empty' ? '1px solid #CBD5E1' : 'none',
          }}
        />
      ))}
    </div>
  );
}

/**
 * Architectural right-angled corner brackets (┌ ┐ └ ┘)
 */
export function CardCornerBrackets({
  corners = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
  color = '#1F4FE0',
  size = 10,
  thickness = 2,
}) {
  const bracketStyle = {
    position: 'absolute',
    width: `${size}px`,
    height: `${size}px`,
    pointerEvents: 'none',
  };

  return (
    <>
      {corners.includes('topLeft') && (
        <div
          style={{
            ...bracketStyle,
            top: -1,
            left: -1,
            borderTop: `${thickness}px solid ${color}`,
            borderLeft: `${thickness}px solid ${color}`,
          }}
        />
      )}
      {corners.includes('topRight') && (
        <div
          style={{
            ...bracketStyle,
            top: -1,
            right: -1,
            borderTop: `${thickness}px solid ${color}`,
            borderRight: `${thickness}px solid ${color}`,
          }}
        />
      )}
      {corners.includes('bottomLeft') && (
        <div
          style={{
            ...bracketStyle,
            bottom: -1,
            left: -1,
            borderBottom: `${thickness}px solid ${color}`,
            borderLeft: `${thickness}px solid ${color}`,
          }}
        />
      )}
      {corners.includes('bottomRight') && (
        <div
          style={{
            ...bracketStyle,
            bottom: -1,
            right: -1,
            borderBottom: `${thickness}px solid ${color}`,
            borderRight: `${thickness}px solid ${color}`,
          }}
        />
      )}
    </>
  );
}

