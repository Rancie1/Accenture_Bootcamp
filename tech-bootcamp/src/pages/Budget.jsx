export default function Budget({ setPage }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Enter Budget</h1>

      <input type="number" />

      <br /><br />

      <button onClick={() => setPage("list")}>
        Continue
      </button>
    </div>
  );
}
