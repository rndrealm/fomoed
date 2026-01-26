import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { SymbolInfo } from '@/services/queries/new-liquidation-heatmap/symbolService';

interface Props {
  symbols: SymbolInfo[];
  value: string;
  onChange: (symbol: string) => void;
  loading?: boolean;
  isMobile?: boolean;
}

export function SearchableDropdown({ symbols, value, onChange, loading = false, isMobile = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = search.trim() === ''
    ? symbols.slice(0, 100)
    : symbols.filter(s => 
        s.symbol.toLowerCase().includes(search.toLowerCase()) ||
        s.baseAsset.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 50);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 10);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (symbol: string) => {
    onChange(symbol);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
      {/* Trigger Button */}
      <button
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        style={{
          width: '100%',
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #404040',
          borderRadius: '4px',
          padding: isMobile ? '5px 8px' : '6px 10px',
          fontSize: isMobile ? '12px' : '13px',
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          textAlign: 'left',
        }}
      >
        <span>{loading ? 'Loading...' : value}</span>
        <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !loading && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: '#1a1a1a',
            border: '1px solid #404040',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            maxHeight: isMobile ? '250px' : '400px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '8px', borderBottom: '1px solid #404040', position: 'sticky', top: 0, background: '#1a1a1a' }}>
            <div style={{ position: 'relative' }}>
              <Search 
                size={14} 
                style={{ 
                  position: 'absolute', 
                  left: '8px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#737373' 
                }} 
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: '#0a0a0a',
                  color: '#fff',
                  border: '1px solid #404040',
                  borderRadius: '4px',
                  padding: '6px 8px 6px 32px',
                  fontSize: isMobile ? '12px' : '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', color: '#737373', textAlign: 'center', fontSize: '12px' }}>
                No symbols found
              </div>
            ) : (
              filtered.map((symbol) => (
                <button
                  key={symbol.symbol}
                  onClick={() => handleSelect(symbol.symbol)}
                  style={{
                    width: '100%',
                    background: value === symbol.symbol ? '#2a2a2a' : 'transparent',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    fontSize: isMobile ? '12px' : '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== symbol.symbol) {
                      e.currentTarget.style.background = '#2a2a2a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== symbol.symbol) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontWeight: value === symbol.symbol ? '600' : '400' }}>
                    {symbol.symbol}
                  </span>
                  <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#737373' }}>
                    {symbol.volume24h > 1000000 
                      ? `$${(symbol.volume24h / 1000000).toFixed(1)}M`
                      : symbol.volume24h > 1000
                      ? `$${(symbol.volume24h / 1000).toFixed(1)}K`
                      : ''
                    }
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}