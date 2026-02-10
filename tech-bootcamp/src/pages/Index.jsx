export default function Index({
  setPage,
  level,
  progress
}) {
  const nextLevel = level + 1;

  return (
    <div className="index-bg">

      <div className="index-card">

        <img
          src="/placeholder_snorlax.png"
          className="creature-img"
        />

        {/* Level text */}
        <h2 className="level-text">
          Level <span>{level}</span>
        </h2>

        {/* Progress bar */}
        <div className="level-bar">

          <span>{level}</span>

          <div className="bar-bg">
            <div
              className="bar-fill"
              style={{
                width: `${(progress / 50) * 100}%`
              }}
            />
          </div>

          <span>{nextLevel}</span>

        </div>

        <button
          className="start-btn"
          onClick={() => setPage("budget")}
        >
          Start Saving
        </button>

      </div>
    </div>
  );
}