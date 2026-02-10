export default function Results({ setPage }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Results</h1>

      <p>Savings + XP will appear here</p>

      <button onClick={() => setPage("index")}>
        Back Home
      </button>
    </div>
  );
}
