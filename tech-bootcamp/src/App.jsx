import { useState } from "react";

import Index from "./pages/Index";
import Budget from "./pages/Budget";
import List from "./pages/List";
import Results from "./pages/Results";

export default function App() {
  const [page, setPage] = useState("index");

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  if (page === "index") {
    return (
      <Index
        setPage={setPage}
        xp={xp}
        level={level}
      />
    );
  }

  if (page === "budget") {
    return <Budget setPage={setPage} />;
  }

  if (page === "list") {
    return <List setPage={setPage} />;
  }

  if (page === "results") {
    return <Results setPage={setPage} />;
  }
}