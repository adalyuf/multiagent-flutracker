import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const navLinkStyle = (active) => ({
  padding: '7px 18px',
  borderRadius: 8,
  fontSize: '0.78rem',
  fontWeight: 500,
  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
  background: active ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
  textDecoration: 'none',
  transition: 'color 0.2s ease, background 0.2s ease',
  letterSpacing: '0.01em',
})

export default function Header() {
  const location = useLocation()
  const isGenomics = location.pathname === '/genomics'

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '10px 24px',
      background: 'linear-gradient(135deg, rgba(12, 16, 36, 0.95) 0%, rgba(17, 24, 48, 0.95) 50%, rgba(13, 23, 34, 0.95) 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-default)',
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at 15% 50%, rgba(34, 211, 238, 0.035) 0%, transparent 60%), radial-gradient(ellipse at 85% 50%, rgba(99, 102, 241, 0.02) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      {/* Globe logo */}
      <svg style={{ width: 32, height: 32, flexShrink: 0, position: 'relative' }} viewBox="0 0 100 100" role="img" aria-label="FluTracker globe logo">
        <defs>
          <linearGradient id="globe-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill="none" stroke="url(#globe-grad)" strokeWidth="2.5" opacity="0.85" />
        <ellipse cx="50" cy="50" rx="44" ry="18" fill="none" stroke="url(#globe-grad)" strokeWidth="1.5" opacity="0.4" />
        <ellipse cx="50" cy="50" rx="18" ry="44" fill="none" stroke="url(#globe-grad)" strokeWidth="1.5" opacity="0.4" />
        <line x1="6" y1="50" x2="94" y2="50" stroke="url(#globe-grad)" strokeWidth="1" opacity="0.25" />
        <line x1="50" y1="6" x2="50" y2="94" stroke="url(#globe-grad)" strokeWidth="1" opacity="0.25" />
      </svg>

      {/* Branding */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        <div style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          Flu<span style={{ color: 'var(--accent-cyan)' }}>Tracker</span>
        </div>
        <div style={{
          fontSize: '0.62rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          Surveillance Analytics
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: 1,
        height: 28,
        background: 'var(--border-default)',
        marginLeft: 4,
        marginRight: 4,
      }} />

      {/* Navigation tabs */}
      <nav style={{
        display: 'flex',
        gap: 2,
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 10,
        padding: 3,
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.03)',
      }}>
        <Link to="/" style={navLinkStyle(!isGenomics)}>Dashboard</Link>
        <Link to="/genomics" style={navLinkStyle(isGenomics)}>Genomics</Link>
      </nav>

      {/* Right side: Live indicator */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'rgba(34, 197, 94, 0.06)',
          borderRadius: 20,
          border: '1px solid rgba(34, 197, 94, 0.15)',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--success)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            letterSpacing: '0.03em',
          }}>
            Live
          </span>
        </div>
      </div>
    </header>
  )
}
