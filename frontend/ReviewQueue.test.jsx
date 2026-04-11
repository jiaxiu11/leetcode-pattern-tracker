import { render, screen, fireEvent, act, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ReviewQueue } from "./leetcode-pattern-tracker.jsx";

// Helpers
function makeProblems(overrides = []) {
  const base = [
    {
      id: "1",
      name: "Two Sum",
      nextReview: "2026-04-10",
      rating: 2,
      link: "https://leetcode.com/problems/two-sum/",
      difficulty: "Easy",
      pattern: "Array",
      reviewHistory: [],
    },
    {
      id: "2",
      name: "Three Sum",
      nextReview: "2026-04-10",
      rating: 1,
      link: "https://leetcode.com/problems/3sum/",
      difficulty: "Medium",
      pattern: "Array",
      reviewHistory: [],
    },
    {
      id: "3",
      name: "Best Time to Buy and Sell Stock",
      nextReview: "2026-04-09",
      rating: 3,
      link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      difficulty: "Easy",
      pattern: "Sliding Window",
      reviewHistory: [],
    },
  ];
  return base.map((p, i) => ({ ...p, ...(overrides[i] || {}) }));
}

function makeProps(problems, persistMock = vi.fn()) {
  return {
    data: { problems },
    persist: persistMock,
    stats: { dueForReview: problems },
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ReviewQueue – stable problem display", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows the earliest-due problem first", () => {
    const problems = makeProblems();
    // id=3 has nextReview 2026-04-09, earlier than id=1 and id=2 (2026-04-10)
    render(<ReviewQueue {...makeProps(problems)} />);
    expect(screen.getByText("Best Time to Buy and Sell Stock")).toBeInTheDocument();
  });

  it("does NOT change the displayed problem when Copy is clicked", () => {
    const problems = makeProblems();
    render(<ReviewQueue {...makeProps(problems)} />);

    // Earliest-due problem is shown first
    expect(screen.getByText("Best Time to Buy and Sell Stock")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Copy"));

    // Problem must be identical after clicking Copy
    expect(screen.getByText("Best Time to Buy and Sell Stock")).toBeInTheDocument();
    // The other problems must NOT be showing
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
    expect(screen.queryByText("Three Sum")).not.toBeInTheDocument();
  });

  it("still shows the same problem after the Copied! label resets (1.5 s)", () => {
    const problems = makeProblems();
    render(<ReviewQueue {...makeProps(problems)} />);

    fireEvent.click(screen.getByText("Copy"));
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    // Advance timer to clear the copied state – this triggers a re-render
    act(() => { vi.advanceTimersByTime(1500); });

    // Button resets but problem must not have changed
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.getByText("Best Time to Buy and Sell Stock")).toBeInTheDocument();
    expect(screen.queryByText("Two Sum")).not.toBeInTheDocument();
  });

  it("keeps showing due[0] when problems share the same nextReview date after re-renders", () => {
    // All three problems have identical nextReview – worst case for sort instability
    const problems = makeProblems([
      { nextReview: "2026-04-10" },
      { nextReview: "2026-04-10" },
      { nextReview: "2026-04-10" },
    ]);
    render(<ReviewQueue {...makeProps(problems)} />);

    const initialName = screen.getByText(/Two Sum|Three Sum|Best Time/).textContent;

    // Trigger multiple re-renders via Copy
    fireEvent.click(screen.getByText("Copy"));
    act(() => { vi.advanceTimersByTime(1500); });
    fireEvent.click(screen.getByText("Copy"));
    act(() => { vi.advanceTimersByTime(1500); });

    // Must still show the same problem – never flipped to another
    expect(screen.getByText(initialName)).toBeInTheDocument();
  });
});

describe("ReviewQueue – copied state does not bleed across problems", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("Copy button resets to 'Copy' on the next problem after celebration ends", () => {
    const twoProblems = [
      { id: "a", name: "First Problem",  nextReview: "2026-04-10", rating: 2, link: "https://lc.com/a", difficulty: "Easy",   pattern: "Array", reviewHistory: [] },
      { id: "b", name: "Second Problem", nextReview: "2026-04-11", rating: 1, link: "https://lc.com/b", difficulty: "Medium", pattern: "Array", reviewHistory: [] },
    ];
    const persistSimple = vi.fn();
    const { rerender } = render(
      <ReviewQueue data={{ problems: twoProblems }} persist={persistSimple} stats={{ dueForReview: twoProblems }} />
    );

    // Copy Problem A's link THEN immediately rate it
    fireEvent.click(screen.getByText("Copy"));
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Solved independently"));

    // Advance 1.5 s: copied timer fires (during dino screen – should be invisible)
    act(() => { vi.advanceTimersByTime(1500); });

    // Simulate parent updating stats (A rated → removed from dueForReview)
    const updatedProblems = twoProblems.map((p) =>
      p.id === "a" ? { ...p, nextReview: "2026-04-25" } : p
    );
    act(() => {
      rerender(
        <ReviewQueue
          data={{ problems: updatedProblems }}
          persist={persistSimple}
          stats={{ dueForReview: [twoProblems[1]] }}
        />
      );
    });

    // Advance past celebration end (2 s from rating)
    act(() => { vi.advanceTimersByTime(500); }); // total 2 s elapsed

    // Second Problem appears – Copy button must NOT show "Copied!" (stale state)
    expect(screen.getByText("Second Problem")).toBeInTheDocument();
    expect(screen.getByText("Copy")).toBeInTheDocument();
    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
  });
});

describe("ReviewQueue – clipboard content correctness", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("copies the currently displayed problem's link, not a previously shown problem's link", () => {
    const twoProblems = [
      { id: "a", name: "First Problem",  nextReview: "2026-04-10", rating: 2, link: "https://lc.com/first",  difficulty: "Easy",   pattern: "Array", reviewHistory: [] },
      { id: "b", name: "Second Problem", nextReview: "2026-04-11", rating: 1, link: "https://lc.com/second", difficulty: "Medium", pattern: "Array", reviewHistory: [] },
    ];
    const persistSimple = vi.fn();
    const { rerender } = render(
      <ReviewQueue data={{ problems: twoProblems }} persist={persistSimple} stats={{ dueForReview: twoProblems }} />
    );

    // Rate first problem
    act(() => {
      fireEvent.click(screen.getByText("Solved independently"));
    });

    // Simulate parent updating stats (first problem removed)
    const updatedProblems = twoProblems.map((p) =>
      p.id === "a" ? { ...p, nextReview: "2026-04-25" } : p
    );
    act(() => {
      rerender(
        <ReviewQueue
          data={{ problems: updatedProblems }}
          persist={persistSimple}
          stats={{ dueForReview: [twoProblems[1]] }}
        />
      );
      vi.advanceTimersByTime(2000);
    });

    // Now on Second Problem – copy it
    expect(screen.getByText("Second Problem")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Copy"));

    // Clipboard must have Second Problem's link, NOT First Problem's link
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("https://lc.com/second");
    expect(navigator.clipboard.writeText).not.toHaveBeenCalledWith("https://lc.com/first");
  });
});

describe("ReviewQueue – celebration screen correctness", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("celebration screen shows the name of the rated problem, not the next one", () => {
    const twoProblems = [
      { id: "a", name: "First Problem",  nextReview: "2026-04-10", rating: 2, link: "https://lc.com/a", difficulty: "Easy",   pattern: "Array", reviewHistory: [] },
      { id: "b", name: "Second Problem", nextReview: "2026-04-11", rating: 1, link: "https://lc.com/b", difficulty: "Medium", pattern: "Array", reviewHistory: [] },
    ];
    const persistSimple = vi.fn();
    const { rerender } = render(
      <ReviewQueue data={{ problems: twoProblems }} persist={persistSimple} stats={{ dueForReview: twoProblems }} />
    );

    act(() => {
      fireEvent.click(screen.getByText("Solved independently"));
      const updatedProblems = twoProblems.map((p) =>
        p.id === "a" ? { ...p, nextReview: "2026-04-25" } : p
      );
      rerender(
        <ReviewQueue
          data={{ problems: updatedProblems }}
          persist={persistSimple}
          stats={{ dueForReview: [twoProblems[1]] }}
        />
      );
    });

    // Celebration must show the JUST-RATED problem's name
    expect(screen.getByText("First Problem")).toBeInTheDocument();
    expect(screen.getByText("reviewed")).toBeInTheDocument();
    // The NEXT problem must NOT be shown during celebration
    expect(screen.queryByText("Second Problem")).not.toBeInTheDocument();

    // After celebration ends, show the next problem
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText("Second Problem")).toBeInTheDocument();
    expect(screen.queryByText("First Problem")).not.toBeInTheDocument();
  });

  it("copied timer (1.5 s) firing during celebration does not disrupt the dino screen", () => {
    const twoProblems = [
      { id: "a", name: "First Problem",  nextReview: "2026-04-10", rating: 2, link: "https://lc.com/a", difficulty: "Easy",   pattern: "Array", reviewHistory: [] },
      { id: "b", name: "Second Problem", nextReview: "2026-04-11", rating: 1, link: "https://lc.com/b", difficulty: "Medium", pattern: "Array", reviewHistory: [] },
    ];
    const persistSimple = vi.fn();
    const { rerender } = render(
      <ReviewQueue data={{ problems: twoProblems }} persist={persistSimple} stats={{ dueForReview: twoProblems }} />
    );

    // Copy then immediately rate
    act(() => {
      fireEvent.click(screen.getByText("Copy"));
      fireEvent.click(screen.getByText("Solved independently"));
      const updatedProblems = twoProblems.map((p) =>
        p.id === "a" ? { ...p, nextReview: "2026-04-25" } : p
      );
      rerender(
        <ReviewQueue
          data={{ problems: updatedProblems }}
          persist={persistSimple}
          stats={{ dueForReview: [twoProblems[1]] }}
        />
      );
    });

    // Dino is showing
    expect(screen.getByText("First Problem")).toBeInTheDocument();
    expect(screen.getByText("reviewed")).toBeInTheDocument();

    // copied timer fires at 1.5 s – must NOT disrupt the celebration
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByText("First Problem")).toBeInTheDocument();
    expect(screen.getByText("reviewed")).toBeInTheDocument();
    // Second Problem must NOT appear during celebration
    expect(screen.queryByText("Second Problem")).not.toBeInTheDocument();

    // Celebration ends at 2 s – next problem appears
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.getByText("Second Problem")).toBeInTheDocument();
    expect(screen.queryByText("First Problem")).not.toBeInTheDocument();
  });
});

describe("ReviewQueue – progression after rating", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows next problem after celebration (2 s) when first problem is rated", () => {
    const problems = makeProblems();
    const persist = vi.fn((newData) => {
      // Simulate the parent updating stats: remove the rated problem from dueForReview
      rerender(
        <ReviewQueue
          data={newData}
          persist={persist}
          stats={{ dueForReview: newData.problems.filter((p) => p.nextReview <= "2026-04-11" && p.id !== "3") }}
        />
      );
    });

    // Simplest setup: just two problems so we can assert exactly which is next
    const twoProblems = [
      { id: "a", name: "First Problem",  nextReview: "2026-04-10", rating: 2, link: "https://lc.com/a", difficulty: "Easy",   pattern: "Array", reviewHistory: [] },
      { id: "b", name: "Second Problem", nextReview: "2026-04-11", rating: 1, link: "https://lc.com/b", difficulty: "Medium", pattern: "Array", reviewHistory: [] },
    ];
    const persistSimple = vi.fn();
    const { rerender } = render(
      <ReviewQueue data={{ problems: twoProblems }} persist={persistSimple} stats={{ dueForReview: twoProblems }} />
    );

    expect(screen.getByText("First Problem")).toBeInTheDocument();

    // Rate it
    fireEvent.click(screen.getByText("Solved independently"));

    // Celebration screen should appear (dino)
    expect(screen.getByText(/First Problem/)).toBeInTheDocument();
    expect(screen.getByText(/reviewed/)).toBeInTheDocument();

    // Simulate parent updating stats after persist was called
    const updatedProblems = twoProblems.map((p) =>
      p.id === "a" ? { ...p, nextReview: "2026-04-25" } : p
    );
    act(() => {
      rerender(
        <ReviewQueue
          data={{ problems: updatedProblems }}
          persist={persistSimple}
          stats={{ dueForReview: [twoProblems[1]] }} // only Second Problem remains due
        />
      );
    });

    // Advance past celebration
    act(() => { vi.advanceTimersByTime(2000); });

    expect(screen.getByText("Second Problem")).toBeInTheDocument();
    expect(screen.queryByText("First Problem")).not.toBeInTheDocument();
  });

  it("never shows a previously-rated problem after it has been removed from dueForReview", () => {
    const twoProblems = [
      { id: "a", name: "First Problem",  nextReview: "2026-04-10", rating: 2, link: "https://lc.com/a", difficulty: "Easy",   pattern: "Array", reviewHistory: [] },
      { id: "b", name: "Second Problem", nextReview: "2026-04-11", rating: 1, link: "https://lc.com/b", difficulty: "Medium", pattern: "Array", reviewHistory: [] },
    ];
    const persistSimple = vi.fn();
    const { rerender } = render(
      <ReviewQueue data={{ problems: twoProblems }} persist={persistSimple} stats={{ dueForReview: twoProblems }} />
    );

    // Rate first problem and update stats (simulating parent persist → state update)
    const updatedProblems = twoProblems.map((p) =>
      p.id === "a" ? { ...p, nextReview: "2026-04-25" } : p
    );
    act(() => {
      fireEvent.click(screen.getByText("Solved independently"));
      rerender(
        <ReviewQueue
          data={{ problems: updatedProblems }}
          persist={persistSimple}
          stats={{ dueForReview: [twoProblems[1]] }}
        />
      );
    });

    // Skip through celebration
    act(() => { vi.advanceTimersByTime(2000); });

    // Now on Second Problem – copy its link
    expect(screen.getByText("Second Problem")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Copy"));

    // Must NOT show First Problem (the previously rated one)
    expect(screen.queryByText("First Problem")).not.toBeInTheDocument();
    // Must still show Second Problem
    expect(screen.getByText("Second Problem")).toBeInTheDocument();
  });
});
