export default function Index({
  setPage,
  xp,
  level
}) {
  return (
    <div className="index-container">

      {/* Creature */}
      <img
        src="/placeholder_snorlax.png"
        alt="Creature"
        className="creature-img"
      />

      <h2>Level {level}</h2>

      {/* Start Button */}
      <button
        className="start-btn"
        onClick={() => setPage("budget")}
      >
        Start Saving
      </button>

    </div>
  );
}