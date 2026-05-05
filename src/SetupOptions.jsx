import React, { useEffect, useState } from 'react';

function SetupOptions({
  tournamentName,
  setTournamentName,
  numTeams,
  setNumTeams,
  numPlayers,
  setNumPlayers,
  playersPerTeam,
  setPlayersPerTeam,
  eventCode,
  setEventCode,
  rules,
  setRules,
  selectedLogoFile,
  setSelectedLogoFile,
  currentLogoUrl,
  onRemoveLogo,
  eventFormat,
  selectedTheme,
  setSelectedTheme,
  customTheme,
  setCustomTheme,
  themeOptions,
  onContinue,
  goBack
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedLogoFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedLogoFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedLogoFile]);

  const themePreview = selectedTheme === "custom"
    ? customTheme
    : themeOptions[selectedTheme] || themeOptions.defaultGray;

  return (
    <div className="admin-page-shell">
      <section className="admin-hero-card compact">
        <div className="admin-hero-copy">
          <h2>Tournament Setup</h2>
        </div>
      </section>

      <section className="admin-section-card">
        <form className="setup-form-grid" onSubmit={(e) => e.preventDefault()}>
          <div className="setup-main-column">
            <div className="setup-panel">
              <div className="setup-field-group">
                <label htmlFor="tournament-name">Tournament Name</label>
                <input
                  id="tournament-name"
                  type="text"
                  value={tournamentName}
                  onChange={(e) => setTournamentName(e.target.value)}
                  placeholder="e.g. Clubhouse Clash Cup"
                />
              </div>

              {eventFormat === "individual" ? (
                <div className="setup-field-group">
                  <label htmlFor="numPlayers">Number of Players</label>
                  <select
                    id="numPlayers"
                    value={numPlayers}
                    onChange={(e) => setNumPlayers(parseInt(e.target.value, 10))}
                  >
                    {Array.from({ length: 31 }, (_, index) => index + 2).map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="setup-split-fields">
                  <div className="setup-field-group setup-inline-select">
                    <label htmlFor="numTeams">Number of Teams</label>
                    <select
                      id="numTeams"
                      value={numTeams}
                      onChange={(e) => setNumTeams(parseInt(e.target.value, 10))}
                    >
                      {[2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>

                  <div className="setup-field-group setup-inline-select">
                    <label htmlFor="playersPerTeam">Players Per Team</label>
                    <select
                      id="playersPerTeam"
                      value={playersPerTeam}
                      onChange={(e) => setPlayersPerTeam(parseInt(e.target.value, 10))}
                    >
                      {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="setup-field-group setup-inline-input">
                <label htmlFor="event-code">Event Code</label>
                <input
                  id="event-code"
                  type="text"
                  value={eventCode ?? ""}
                  onChange={(e) => setEventCode(e.target.value)}
                  placeholder="Leave blank for auto-generated"
                />
                <p className="setup-help-text setup-inline-help">
                  You can customize the code now, or keep the generated one.
                </p>
              </div>

              <div className="setup-field-group">
                <label htmlFor="rules">Tournament Rules / Weekend Notes</label>
                <textarea
                  id="rules"
                  value={rules ?? ""}
                  onChange={(e) => setRules(e.target.value)}
                  placeholder="Enter tournament rules, scoring notes, side games, payouts, or weekend schedule..."
                  rows={8}
                />
                <p className="setup-help-text">
                  Add any information players should be able to reference during the weekend.
                </p>
              </div>
            </div>
          </div>

          <div className="setup-side-column">
            <div className="setup-panel">
              <div className="setup-panel-header theme-picker-header setup-panel-header-centered">
                <h3>Color Scheme</h3>
              </div>

              <div className="theme-preview-grid">
                {Object.entries(themeOptions).map(([themeKey, theme]) => (
                  <button
                    key={themeKey}
                    type="button"
                    className={`theme-preview-card ${selectedTheme === themeKey ? 'active' : ''}`}
                    onClick={() => setSelectedTheme(themeKey)}
                  >
                    <span
                      className="theme-preview-swatch"
                      style={{ background: `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.buttonColor})` }}
                    />
                    <span>{theme.label}</span>
                  </button>
                ))}
              </div>

              <div
                className="custom-theme-preview always-visible"
                style={{
                  background: `linear-gradient(180deg, ${themePreview.backgroundColor}, ${themePreview.cardColor})`,
                  color: themePreview.textColor
                }}
              >
                <div
                  className="custom-theme-preview-card"
                  style={{ backgroundColor: themePreview.cardColor, color: themePreview.textColor }}
                >
                  <strong>{themeOptions[selectedTheme]?.label || "Theme Preview"}</strong>
                  <span>This preview updates for both preset themes and custom colors.</span>
                  <button
                    type="button"
                    className="custom-theme-preview-button"
                    style={{
                      backgroundColor: themePreview.buttonColor,
                      color: themePreview.buttonTextColor || "#f4f8f1"
                    }}
                  >
                    Theme Accent
                  </button>
                </div>
              </div>

              {selectedTheme === "custom" && (
                <div className="custom-theme-editor">
                  <div className="setup-panel-header">
                    <h3>Custom Theme</h3>
                    <p>Choose the main colors for the app while keeping the same polished layout.</p>
                  </div>

                  <div className="custom-theme-grid">
                    <label className="custom-color-field">
                      <span>Background</span>
                      <input
                        type="color"
                        value={customTheme.backgroundColor}
                        onChange={(e) => setCustomTheme((prev) => ({ ...prev, backgroundColor: e.target.value }))}
                      />
                    </label>
                    <label className="custom-color-field">
                      <span>Cards / Panels</span>
                      <input
                        type="color"
                        value={customTheme.cardColor}
                        onChange={(e) => setCustomTheme((prev) => ({ ...prev, cardColor: e.target.value }))}
                      />
                    </label>
                    <label className="custom-color-field">
                      <span>Buttons / Accent</span>
                      <input
                        type="color"
                        value={customTheme.buttonColor}
                        onChange={(e) => setCustomTheme((prev) => ({ ...prev, buttonColor: e.target.value }))}
                      />
                    </label>
                    <label className="custom-color-field">
                      <span>Text</span>
                      <input
                        type="color"
                        value={customTheme.textColor}
                        onChange={(e) => setCustomTheme((prev) => ({ ...prev, textColor: e.target.value }))}
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="setup-panel-header setup-panel-header-centered setup-branding-header">
                <h3>Branding</h3>
                <p>Optional for branding. This logo is not currently shown on the player screens.</p>
              </div>

              <div className="setup-field-group setup-branding-field">
                <label htmlFor="logo-upload">Tournament Logo</label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedLogoFile(e.target.files[0] || null)}
                />
                <p className="setup-help-text">Optional. Upload an image to use as your tournament logo.</p>
              </div>

              {(previewUrl || currentLogoUrl) && (
                <div className="logo-preview-card">
                  <p>{selectedLogoFile ? `Selected file: ${selectedLogoFile.name}` : "Current logo"}</p>
                  <img
                    src={previewUrl || currentLogoUrl}
                    alt="Tournament logo preview"
                    className="logo-preview-image"
                  />
                  {currentLogoUrl && !selectedLogoFile && (
                    <button type="button" className="admin-secondary-button" onClick={onRemoveLogo}>
                      Remove Logo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="setup-actions">
          {goBack && (
            <button type="button" className="admin-secondary-button" onClick={goBack}>
              Back
            </button>
          )}
          <button type="button" className="admin-primary-button" onClick={onContinue}>
            {eventFormat === "individual" ? "Continue to Player Setup" : "Continue to Team Setup"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default SetupOptions;
