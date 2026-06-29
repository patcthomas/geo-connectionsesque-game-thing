import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const componentStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');

  .geo-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 48px 16px;
    font-family: 'Inter', sans-serif;
    background: #f5f3ee;
    transition: background 0.3s ease;
  }
  .geo-wrapper.geo-dark {
    background: #0f1923;
  }
  .geo-card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    padding: 36px 32px 28px;
    width: 100%;
    max-width: 480px;
    transition: background 0.3s ease, box-shadow 0.3s ease;
    position: relative;
  }
  .geo-dark .geo-card {
    background: #1a2535;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  }
  .geo-title {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    color: #1e2d40;
    letter-spacing: -0.5px;
    margin-bottom: 4px;
    text-align: center;
    transition: color 0.3s ease;
  }
  .geo-dark .geo-title {
    color: #e0ddd6;
  }
  .geo-subtitle {
    font-size: 0.82rem;
    color: #7a8694;
    text-align: center;
    margin-bottom: 24px;
  }
  .geo-dark .geo-subtitle {
    color: #8a9ab0;
  }
  .geo-divider {
    border: none;
    border-top: 1px solid #e0ddd6;
    margin: 0 0 16px;
    transition: border-color 0.3s ease;
  }
  .geo-dark .geo-divider {
    border-top-color: #2d3d54;
  }

  /* Dark mode toggle button */
  .geo-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: 2px solid #dedad2;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 0.8rem;
    cursor: pointer;
    color: #7a8694;
    font-family: 'Inter', sans-serif;
    transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
  }
  .geo-toggle:hover {
    border-color: #1e3a5f;
    color: #1e3a5f;
  }
  .geo-dark .geo-toggle {
    border-color: #2d3d54;
    color: #8a9ab0;
  }
  .geo-dark .geo-toggle:hover {
    border-color: #4a90d9;
    color: #4a90d9;
  }

  .geo-tile {
    aspect-ratio: 1 / 1;
    width: 100%;
    border: 2px solid #dedad2;
    border-radius: 10px;
    background: #eeebe3;
    color: #1e2d40;
    font-weight: 600;
    font-size: 0.72rem;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 6px;
    cursor: pointer;
    transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease, transform 0.1s ease;
    line-height: 1.3;
    user-select: none;
  }
  .geo-tile:hover:not(.geo-tile--selected) {
    background: #e0dcd2;
    border-color: #c8c4bc;
    transform: translateY(-2px);
  }
  .geo-tile--selected {
    background: #1e3a5f;
    border-color: #1e3a5f;
    color: #ffffff;
    transform: translateY(-2px);
  }
  .geo-dark .geo-tile {
    background: #243044;
    border-color: #2d3d54;
    color: #e0ddd6;
  }
  .geo-dark .geo-tile:hover:not(.geo-tile--selected) {
    background: #2d3d54;
    border-color: #3d5070;
    transform: translateY(-2px);
  }
  .geo-dark .geo-tile--selected {
    background: #4a90d9;
    border-color: #4a90d9;
    color: #ffffff;
  }

  .geo-solved-row {
    border-radius: 10px;
    padding: 12px 16px;
    margin-bottom: 8px;
    text-align: center;
  }
  .geo-solved-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 2px;
  }
  .geo-solved-items {
    font-size: 0.82rem;
    font-weight: 400;
  }
  .geo-feedback {
    font-size: 0.85rem;
    font-weight: 600;
    color: #1e3a5f;
    min-height: 20px;
    transition: color 0.3s ease;
  }
  .geo-dark .geo-feedback {
    color: #4a90d9;
  }
  .geo-mistake-dot {
    width: 11px;
    height: 11px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 4px;
    transition: background 0.2s ease;
  }
  .geo-mistake-dot--used { background: #1e3a5f; }
  .geo-mistake-dot--empty { background: #dedad2; }
  .geo-dark .geo-mistake-dot--used { background: #4a90d9; }
  .geo-dark .geo-mistake-dot--empty { background: #2d3d54; }

  .geo-mistakes-label {
    font-size: 0.75rem;
    color: #7a8694;
    margin-right: 6px;
    transition: color 0.3s ease;
  }
  .geo-dark .geo-mistakes-label {
    color: #8a9ab0;
  }

  .geo-submit {
    width: 100%;
    border-radius: 999px;
    padding: 11px;
    font-weight: 600;
    font-size: 0.9rem;
    border: 2px solid transparent;
    cursor: pointer;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
    font-family: 'Inter', sans-serif;
  }
  .geo-submit--active { background: #1e3a5f; color: #ffffff; border-color: #1e3a5f; }
  .geo-submit--active:hover { background: #162d4a; }
  .geo-submit--disabled { background: #eeebe3; color: #aaa9a2; border-color: #dedad2; cursor: not-allowed; }
  .geo-dark .geo-submit--active { background: #4a90d9; border-color: #4a90d9; }
  .geo-dark .geo-submit--active:hover { background: #3a80c9; }
  .geo-dark .geo-submit--disabled { background: #243044; color: #4a5a70; border-color: #2d3d54; }

  .geo-end-message {
    text-align: center;
    font-weight: 700;
    font-size: 1rem;
    padding: 10px 0 0;
  }
  .geo-status-message {
    text-align: center;
    color: #7a8694;
    font-size: 0.9rem;
    padding: 24px 0;
  }
  .geo-dark .geo-status-message {
    color: #8a9ab0;
  }
`;

const difficultyTierStyles = {
  1: { background: "#f9df6d", border: "#e0c84a", label: "#5a4a00" },
  2: { background: "#a0c35a", border: "#7da33a", label: "#2a3d10" },
  3: { background: "#6aacdb", border: "#4a8cbb", label: "#0d2a40" },
  4: { background: "#c084d4", border: "#a060b4", label: "#2d0a40" },
};

const maxAllowedMistakes = 4;

// ---------------------------------------------------------------------------
// HELPER FUNCTIONS
// ---------------------------------------------------------------------------
const buildShuffledTileList = (groups) => {
  const allTiles = groups.flatMap((group) =>
    group.countryNames.map((countryName) => ({
      countryName,
      groupId: group.groupId,
      tileKey: `${group.groupId}-${countryName}`,
    }))
  );
  const shuffledTiles = [...allTiles];
  for (let i = shuffledTiles.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [shuffledTiles[i], shuffledTiles[swapIndex]] = [
      shuffledTiles[swapIndex],
      shuffledTiles[i],
    ];
  }
  return shuffledTiles;
};

const findMatchingGroupId = (selectedCountryNames, groups) => {
  const matchingGroup = groups.find((group) => {
    const groupCountrySet = new Set(group.countryNames);
    return selectedCountryNames.every((name) => groupCountrySet.has(name));
  });
  return matchingGroup && selectedCountryNames.length === 4
    ? matchingGroup.groupId
    : null;
};

const countClosestGroupOverlap = (selectedCountryNames, groups) => {
  let highestOverlapCount = 0;
  groups.forEach((group) => {
    const groupCountrySet = new Set(group.countryNames);
    const overlapCount = selectedCountryNames.filter((name) =>
      groupCountrySet.has(name)
    ).length;
    highestOverlapCount = Math.max(highestOverlapCount, overlapCount);
  });
  return highestOverlapCount;
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export const GeoConnectionsGrid = () => {
  const [puzzleGroups, setPuzzleGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [tileList, setTileList] = useState([]);
  const [selectedCountryNames, setSelectedCountryNames] = useState([]);
  const [solvedGroupIds, setSolvedGroupIds] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [gameStatus, setGameStatus] = useState("playing");

  // isDarkMode defaults to false (light mode).
  // We also check localStorage on mount so the player's preference
  // is remembered across page refreshes.
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("geo-dark-mode") === "true";
  });

  // Persist the preference to localStorage whenever it changes.
  // WHY useEffect here instead of inside the toggle handler?
  // Keeping side effects in useEffect means the handler stays pure —
  // it only updates state. The effect reacts to that change separately.
  useEffect(() => {
    localStorage.setItem("geo-dark-mode", isDarkMode);
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((previous) => !previous);
  };

  // Inject component styles once on mount
  useEffect(() => {
    const styleTag = document.createElement("style");
    styleTag.id = "geo-connections-styles";
    styleTag.textContent = componentStyles;
    if (!document.getElementById("geo-connections-styles")) {
      document.head.appendChild(styleTag);
    }
    return () => styleTag.remove();
  }, []);

  // Fetch today's puzzle from the Flask API
  useEffect(() => {
    const fetchTodaysPuzzle = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await fetch(`${backendUrl}/api/puzzle/today`);
        if (!response.ok) {
          throw new Error(`No puzzle found for today (${response.status})`);
        }
        const puzzleData = await response.json();
        setPuzzleGroups(puzzleData.groups);
        setTileList(buildShuffledTileList(puzzleData.groups));
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodaysPuzzle();
  }, []);

  const isCountryInGroup = (countryName, groupId) => {
    const group = puzzleGroups.find((g) => g.groupId === groupId);
    return group ? group.countryNames.includes(countryName) : false;
  };

  const handleTileClick = (countryName) => {
    if (gameStatus !== "playing") return;
    if (solvedGroupIds.some((id) => isCountryInGroup(countryName, id))) return;
    const isAlreadySelected = selectedCountryNames.includes(countryName);
    if (isAlreadySelected) {
      setSelectedCountryNames((prev) => prev.filter((n) => n !== countryName));
      return;
    }
    if (selectedCountryNames.length >= 4) return;
    setSelectedCountryNames((prev) => [...prev, countryName]);
  };

  const handleSubmitGuess = () => {
    if (selectedCountryNames.length !== 4) return;
    const matchedGroupId = findMatchingGroupId(selectedCountryNames, puzzleGroups);
    if (matchedGroupId) {
      const newSolvedGroupIds = [...solvedGroupIds, matchedGroupId];
      setSolvedGroupIds(newSolvedGroupIds);
      setSelectedCountryNames([]);
      setFeedbackMessage("Correct!");
      if (newSolvedGroupIds.length === puzzleGroups.length) setGameStatus("won");
    } else {
      const overlapCount = countClosestGroupOverlap(selectedCountryNames, puzzleGroups);
      const newMistakeCount = mistakeCount + 1;
      setMistakeCount(newMistakeCount);
      setFeedbackMessage(overlapCount === 3 ? "One away..." : "Not quite.");
      setSelectedCountryNames([]);
      if (newMistakeCount >= maxAllowedMistakes) setGameStatus("lost");
    }
    setTimeout(() => setFeedbackMessage(""), 2000);
  };

  const remainingTiles = tileList.filter(
    (tile) => !solvedGroupIds.includes(tile.groupId)
  );

  return (
    <div className={`geo-wrapper${isDarkMode ? " geo-dark" : ""}`}>
      <div className="geo-card">

        {/* Dark mode toggle — top right corner of the card */}
        <button className="geo-toggle" onClick={handleToggleDarkMode}>
          {isDarkMode ? "☀️ Light" : "🌙 Dark"}
        </button>

        <h1 className="geo-title">🌍 GeoConnections</h1>
        <p className="geo-subtitle">
          Find four groups of four — each linked by a hidden geographic trait.
        </p>
        <hr className="geo-divider" />

        {isLoading && (
          <p className="geo-status-message">Loading today's puzzle...</p>
        )}
        {fetchError && (
          <p className="geo-status-message" style={{ color: "#a02020" }}>
            {fetchError}
          </p>
        )}

        {!isLoading && !fetchError && (
          <>
            {solvedGroupIds.map((groupId) => {
              const group = puzzleGroups.find((g) => g.groupId === groupId);
              const tierStyle = difficultyTierStyles[group.difficultyTier];
              return (
                <div
                  key={groupId}
                  className="geo-solved-row"
                  style={{ background: tierStyle.background, border: `2px solid ${tierStyle.border}` }}
                >
                  <div className="geo-solved-label" style={{ color: tierStyle.label }}>
                    {group.traitLabel}
                  </div>
                  <div className="geo-solved-items" style={{ color: tierStyle.label }}>
                    {group.countryNames.join(", ")}
                  </div>
                </div>
              );
            })}

            <div className="row g-2 mb-3">
              {remainingTiles.map((tile) => {
                const isSelected = selectedCountryNames.includes(tile.countryName);
                return (
                  <div className="col-3" key={tile.tileKey}>
                    <button
                      className={`geo-tile${isSelected ? " geo-tile--selected" : ""}`}
                      onClick={() => handleTileClick(tile.countryName)}
                    >
                      {tile.countryName}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="geo-feedback">{feedbackMessage}</span>
              <div className="d-flex align-items-center">
                <span className="geo-mistakes-label">Mistakes:</span>
                {Array.from({ length: maxAllowedMistakes }).map((_, index) => (
                  <span
                    key={index}
                    className={`geo-mistake-dot ${
                      index < mistakeCount ? "geo-mistake-dot--used" : "geo-mistake-dot--empty"
                    }`}
                  />
                ))}
              </div>
            </div>

            {gameStatus === "playing" && (
              <button
                className={`geo-submit ${
                  selectedCountryNames.length === 4
                    ? "geo-submit--active"
                    : "geo-submit--disabled"
                }`}
                onClick={handleSubmitGuess}
                disabled={selectedCountryNames.length !== 4}
              >
                Submit Guess
              </button>
            )}
            {gameStatus === "won" && (
              <p className="geo-end-message" style={{ color: "#2a6e2a" }}>
                Solved it! Well played. 🎉
              </p>
            )}
            {gameStatus === "lost" && (
              <p className="geo-end-message" style={{ color: "#a02020" }}>
                Out of guesses. Better luck on the next puzzle.
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
};