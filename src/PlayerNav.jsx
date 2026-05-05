import React, { useState } from 'react';
import MapboxDistanceMap from './MapboxDistanceMap';
import './MapboxMap.css';
import { FileText, MapPinned, Medal, Trophy } from 'lucide-react';

function PlayerNav({
  onGoHome,
  onGoIndividualLeaderboard,
  onGoTeamLeaderboard,
  onShowRules,
  currentView,
  showTeamLeaderboard = true
}) {
  const [showMap, setShowMap] = useState(false);

  const navItems = [
    showTeamLeaderboard
      ? {
          key: 'teamLeaderboard',
          label: 'Teams',
          icon: Trophy,
          onClick: onGoTeamLeaderboard,
          active: currentView === 'teamLeaderboard',
        }
      : null,
    {
      key: 'individualLeaderboard',
      label: 'Players',
      icon: Medal,
      onClick: onGoIndividualLeaderboard,
      active: currentView === 'individualLeaderboard',
    },
    {
      key: 'home',
      label: 'Play',
      icon: null,
      onClick: onGoHome,
      active: currentView === 'selectMatchDay' || currentView === 'selectMatchType' || currentView === 'scoreEntry',
      home: true,
    },
    {
      key: 'rules',
      label: 'Notes',
      icon: FileText,
      onClick: onShowRules,
      active: false,
    },
    {
      key: 'gps',
      label: 'GPS',
      icon: MapPinned,
      onClick: () => setShowMap(true),
      active: false,
    },
  ].filter(Boolean);

  return (
    <>
      <nav className="player-bottom-nav-shell" aria-label="Player navigation">
        <div className={`player-bottom-nav ${showTeamLeaderboard ? '' : 'player-bottom-nav-individual'}`}>
          {!showTeamLeaderboard && <div className="player-bottom-nav-spacer" aria-hidden="true" />}
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`player-bottom-nav-item ${item.active ? 'active' : ''} ${item.home ? 'player-bottom-nav-home' : ''}`}
              onClick={item.onClick}
            >
              {item.home ? (
                <>
                    <span className="player-bottom-nav-home-icon">
                    <img src="/CCAppIcon.png" alt="" className="player-bottom-nav-home-logo" />
                    <span className="player-bottom-nav-home-text">{item.label}</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="player-bottom-nav-icon" aria-hidden="true">
                    <item.icon size={20} strokeWidth={2.2} />
                  </span>
                  <span className="player-bottom-nav-label">{item.label}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </nav>

      {showMap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="player-nav-modal">
            <button
              className="player-nav-modal-close"
              onClick={() => setShowMap(false)}
            >
              Close
            </button>

            <MapboxDistanceMap />
          </div>
        </div>
      )}
    </>
  );
}

export default PlayerNav;
