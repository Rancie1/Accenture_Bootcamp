import { useState } from "react";

// Import page components
import Index from "./pages/Index";
import Budget from "./pages/Budget";
import List from "./pages/List";
import Results from "./pages/Results";

export default function App() {

  // Controls which page/screen is currently shown
  // Possible values: "index", "budget", "list", "results"
  const [page, setPage] = useState("index");

  // Total savings
  // Total money the user has saved
  // This will later be updated after price comparisons
  const [savings, setSavings] = useState(0);

  // Level logic
  // Every $50 saved = 1 level up

  /*
    Level formula:

    Every $50 saved = 1 level up

    Example:
    $0   → Level 1
    $50  → Level 2
    $120 → Level 3

    Math.floor removes decimals.
    +1 ensures users start at Level 1 instead of Level 0.
  */

  const level = Math.floor(savings / 50) + 1;

  /*
    Progress toward next level.

    % 50 gets the remainder after division.

    Example:
    $135 saved
    135 % 50 = 35 progress toward next level
  */

  const progress = savings % 50;

  // Home / Creature dashboard
  if (page === "index") {
    return (
      <Index
        setPage={setPage}
        level={level}
        progress={progress}
      />
    );
  }

  // Budget input page
  if (page === "budget") {
    return <Budget setPage={setPage} />;
  }

  // Shopping list creation page
  if (page === "list") {
    return <List setPage={setPage} />;
  }

  // Price comparison + savings results page
  if (page === "results") {
    return <Results setPage={setPage} />;
  }
}
