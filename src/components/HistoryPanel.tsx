import React from 'react';
import { History, MapPin, Clock, Trash2 } from 'lucide-react';

interface HistoryEntry {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onSelectEntry: (entry: HistoryEntry) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  onClearHistory,
  onSelectEntry,
}) => {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="glass-panel p-4 space-y-4 max-h-[400px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-neon-cyan" />
          <h3 className="font-display text-sm uppercase tracking-wider text-foreground">
            Location History
          </h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 transition-colors group"
            title="Clear history"
          >
            <Trash2 className="w-4 h-4 text-destructive group-hover:text-destructive" />
          </button>
        )}
      </div>

      {/* History count */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50">
        <span className="text-xs text-muted-foreground">Total entries:</span>
        <span className="text-sm font-display text-neon-green">{history.length}</span>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No history yet. Location will be recorded as it changes.
          </div>
        ) : (
          history.slice(0, 20).map((entry, index) => (
            <button
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="w-full p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 hover:border-primary/30 transition-all duration-300 text-left group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-neon-green animate-pulse' : 'bg-neon-cyan/50'}`} />
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(entry.timestamp)} • {formatTime(entry.timestamp)}
                    </p>
                    <p className="text-sm text-foreground font-mono mt-1 group-hover:text-primary transition-colors">
                      {entry.latitude.toFixed(5)}, {entry.longitude.toFixed(5)}
                    </p>
                  </div>
                </div>
                <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          ))
        )}
        {history.length > 20 && (
          <p className="text-center text-xs text-muted-foreground py-2">
            Showing latest 20 of {history.length} entries
          </p>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;
