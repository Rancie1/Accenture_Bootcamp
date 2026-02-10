export default function List({ setPage }) {
  return (
    <div style={{ textAlign: "center" }}>
      <h1>Shopping List</h1>

      <p>List input coming next</p>

      <button onClick={() => setPage("results")}>
        Compare
      </button>
    </div>
  );
}
