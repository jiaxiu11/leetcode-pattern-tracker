import { useState, useEffect, useCallback, useMemo } from "react";

const PATTERNS = [
  "Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack",
  "Binary Search", "Linked List", "Trees", "Tries", "Backtracking",
  "Heap / Priority Queue", "Graphs", "Dynamic Programming",
  "Greedy", "Intervals", "Math & Bit Manipulation", "Other"
];

const RATING_CONFIG = {
  3: { label: "Solved independently", color: "#2d6a4f", bg: "#d8f3dc", reviewDays: 14, emoji: "✓" },
  2: { label: "Needed a nudge", color: "#e07c24", bg: "#fef3e2", reviewDays: 3, emoji: "~" },
  1: { label: "Needed full solution", color: "#c0392b", bg: "#fce4e4", reviewDays: 1, emoji: "✗" },
};

// NeetCode 150 lookup: slug → [name, difficulty, pattern]
const NC150 = {
  // Arrays & Hashing
  "contains-duplicate":["Contains Duplicate","Easy","Arrays & Hashing"],
  "is-anagram":["Valid Anagram","Easy","Arrays & Hashing"],
  "two-integer-sum":["Two Sum","Easy","Arrays & Hashing"],
  "anagram-groups":["Group Anagrams","Medium","Arrays & Hashing"],
  "top-k-elements-in-list":["Top K Frequent Elements","Medium","Arrays & Hashing"],
  "products-of-array-discluding-self":["Product of Array Except Self","Medium","Arrays & Hashing"],
  "valid-sudoku":["Valid Sudoku","Medium","Arrays & Hashing"],
  "encode-and-decode-strings":["Encode and Decode Strings","Medium","Arrays & Hashing"],
  "longest-consecutive-sequence":["Longest Consecutive Sequence","Medium","Arrays & Hashing"],
  // Two Pointers
  "is-palindrome":["Valid Palindrome","Easy","Two Pointers"],
  "two-integer-sum-ii":["Two Sum II","Medium","Two Pointers"],
  "three-integer-sum":["3Sum","Medium","Two Pointers"],
  "max-water-container":["Container With Most Water","Medium","Two Pointers"],
  "trapping-rain-water":["Trapping Rain Water","Hard","Two Pointers"],
  // Sliding Window
  "buy-and-sell-crypto":["Best Time to Buy and Sell Stock","Easy","Sliding Window"],
  "longest-substring-without-duplicates":["Longest Substring Without Repeating Characters","Medium","Sliding Window"],
  "longest-repeating-substring-with-replacement":["Longest Repeating Character Replacement","Medium","Sliding Window"],
  "permutation-string":["Permutation in String","Medium","Sliding Window"],
  "minimum-window-with-characters":["Minimum Window Substring","Hard","Sliding Window"],
  "sliding-window-maximum":["Sliding Window Maximum","Hard","Sliding Window"],
  // Stack
  "validate-parentheses":["Valid Parentheses","Easy","Stack"],
  "minimum-stack":["Min Stack","Medium","Stack"],
  "evaluate-reverse-polish-notation":["Evaluate Reverse Polish Notation","Medium","Stack"],
  "generate-parentheses":["Generate Parentheses","Medium","Stack"],
  "daily-temperatures":["Daily Temperatures","Medium","Stack"],
  "car-fleet":["Car Fleet","Medium","Stack"],
  "largest-rectangle-in-histogram":["Largest Rectangle in Histogram","Hard","Stack"],
  // Binary Search
  "binary-search":["Binary Search","Easy","Binary Search"],
  "search-2d-matrix":["Search a 2D Matrix","Medium","Binary Search"],
  "eating-bananas":["Koko Eating Bananas","Medium","Binary Search"],
  "find-minimum-in-rotated-sorted-array":["Find Minimum in Rotated Sorted Array","Medium","Binary Search"],
  "find-target-in-rotated-sorted-array":["Search in Rotated Sorted Array","Medium","Binary Search"],
  "time-based-key-value-store":["Time Based Key-Value Store","Medium","Binary Search"],
  "median-of-two-sorted-arrays":["Median of Two Sorted Arrays","Hard","Binary Search"],
  // Linked List
  "reverse-a-linked-list":["Reverse Linked List","Easy","Linked List"],
  "merge-two-sorted-linked-lists":["Merge Two Sorted Lists","Easy","Linked List"],
  "linked-list-cycle-detection":["Linked List Cycle","Easy","Linked List"],
  "reorder-linked-list":["Reorder List","Medium","Linked List"],
  "remove-node-from-end-of-linked-list":["Remove Nth Node From End of List","Medium","Linked List"],
  "copy-linked-list-with-random-pointer":["Copy List with Random Pointer","Medium","Linked List"],
  "add-two-numbers":["Add Two Numbers","Medium","Linked List"],
  "find-duplicate-integer":["Find the Duplicate Number","Medium","Linked List"],
  "lru-cache":["LRU Cache","Medium","Linked List"],
  "merge-k-sorted-linked-lists":["Merge K Sorted Lists","Hard","Linked List"],
  "reverse-nodes-in-k-group":["Reverse Nodes in K-Group","Hard","Linked List"],
  // Trees
  "invert-a-binary-tree":["Invert Binary Tree","Easy","Trees"],
  "depth-of-binary-tree":["Maximum Depth of Binary Tree","Easy","Trees"],
  "diameter-of-binary-tree":["Diameter of Binary Tree","Easy","Trees"],
  "balanced-binary-tree":["Balanced Binary Tree","Easy","Trees"],
  "same-binary-tree":["Same Tree","Easy","Trees"],
  "subtree-of-a-binary-tree":["Subtree of Another Tree","Easy","Trees"],
  "lowest-common-ancestor-in-binary-search-tree":["Lowest Common Ancestor of a BST","Medium","Trees"],
  "binary-tree-from-preorder-and-inorder-traversal":["Construct Binary Tree from Preorder and Inorder","Medium","Trees"],
  "binary-tree-level-order-traversal":["Binary Tree Level Order Traversal","Medium","Trees"],
  "binary-tree-right-side-view":["Binary Tree Right Side View","Medium","Trees"],
  "count-good-nodes-in-binary-tree":["Count Good Nodes in Binary Tree","Medium","Trees"],
  "validate-binary-search-tree":["Validate Binary Search Tree","Medium","Trees"],
  "kth-smallest-integer-in-bst":["Kth Smallest Element in a BST","Medium","Trees"],
  "serialize-and-deserialize-binary-tree":["Serialize and Deserialize Binary Tree","Hard","Trees"],
  "binary-tree-maximum-path-sum":["Binary Tree Maximum Path Sum","Hard","Trees"],
  // Tries
  "implement-prefix-tree":["Implement Trie (Prefix Tree)","Medium","Tries"],
  "design-add-and-search-words-data-structure":["Design Add and Search Words Data Structure","Medium","Tries"],
  "search-for-word-ii":["Word Search II","Hard","Tries"],
  // Heap / Priority Queue
  "kth-largest-element-in-a-stream":["Kth Largest Element in a Stream","Easy","Heap / Priority Queue"],
  "last-stone-weight":["Last Stone Weight","Easy","Heap / Priority Queue"],
  "k-closest-points-to-origin":["K Closest Points to Origin","Medium","Heap / Priority Queue"],
  "kth-largest-element-in-an-array":["Kth Largest Element in an Array","Medium","Heap / Priority Queue"],
  "task-scheduling":["Task Scheduler","Medium","Heap / Priority Queue"],
  "design-twitter-feed":["Design Twitter","Medium","Heap / Priority Queue"],
  "find-median-in-a-data-stream":["Find Median from Data Stream","Hard","Heap / Priority Queue"],
  // Backtracking
  "subsets":["Subsets","Medium","Backtracking"],
  "combination-target-sum":["Combination Sum","Medium","Backtracking"],
  "permutations":["Permutations","Medium","Backtracking"],
  "subsets-ii":["Subsets II","Medium","Backtracking"],
  "combination-target-sum-ii":["Combination Sum II","Medium","Backtracking"],
  "search-for-word":["Word Search","Medium","Backtracking"],
  "palindrome-partitioning":["Palindrome Partitioning","Medium","Backtracking"],
  "letter-combinations-of-a-phone-number":["Letter Combinations of a Phone Number","Medium","Backtracking"],
  "n-queens":["N-Queens","Hard","Backtracking"],
  // Graphs
  "count-number-of-islands":["Number of Islands","Medium","Graphs"],
  "clone-graph":["Clone Graph","Medium","Graphs"],
  "max-area-of-island":["Max Area of Island","Medium","Graphs"],
  "pacific-atlantic-water-flow":["Pacific Atlantic Water Flow","Medium","Graphs"],
  "surrounded-regions":["Surrounded Regions","Medium","Graphs"],
  "rotting-oranges":["Rotting Oranges","Medium","Graphs"],
  "walls-and-gates":["Walls and Gates","Medium","Graphs"],
  "course-schedule":["Course Schedule","Medium","Graphs"],
  "course-schedule-ii":["Course Schedule II","Medium","Graphs"],
  "graph-valid-tree":["Graph Valid Tree","Medium","Graphs"],
  "count-connected-components":["Number of Connected Components in an Undirected Graph","Medium","Graphs"],
  "redundant-connection":["Redundant Connection","Medium","Graphs"],
  "word-ladder":["Word Ladder","Hard","Graphs"],
  // Advanced Graphs
  "reconstruct-flight-path":["Reconstruct Itinerary","Hard","Graphs"],
  "min-cost-to-connect-all-points":["Min Cost to Connect All Points","Medium","Graphs"],
  "network-delay-time":["Network Delay Time","Medium","Graphs"],
  "swim-in-rising-water":["Swim in Rising Water","Hard","Graphs"],
  "foreign-dictionary":["Alien Dictionary","Hard","Graphs"],
  "cheapest-flights-within-k-stops":["Cheapest Flights Within K Stops","Medium","Graphs"],
  // 1-D Dynamic Programming
  "climbing-stairs":["Climbing Stairs","Easy","Dynamic Programming"],
  "minimum-cost-climbing-stairs":["Min Cost Climbing Stairs","Easy","Dynamic Programming"],
  "house-robber":["House Robber","Medium","Dynamic Programming"],
  "house-robber-ii":["House Robber II","Medium","Dynamic Programming"],
  "longest-palindromic-substring":["Longest Palindromic Substring","Medium","Dynamic Programming"],
  "palindromic-substrings":["Palindromic Substrings","Medium","Dynamic Programming"],
  "count-number-of-decodings":["Decode Ways","Medium","Dynamic Programming"],
  "coin-change":["Coin Change","Medium","Dynamic Programming"],
  "maximum-product-subarray":["Maximum Product Subarray","Medium","Dynamic Programming"],
  "word-break":["Word Break","Medium","Dynamic Programming"],
  "longest-increasing-subsequence":["Longest Increasing Subsequence","Medium","Dynamic Programming"],
  "partition-equal-subset-sum":["Partition Equal Subset Sum","Medium","Dynamic Programming"],
  // 2-D Dynamic Programming
  "unique-paths":["Unique Paths","Medium","Dynamic Programming"],
  "longest-common-subsequence":["Longest Common Subsequence","Medium","Dynamic Programming"],
  "best-time-to-buy-and-sell-stock-with-cooldown":["Best Time to Buy and Sell Stock with Cooldown","Medium","Dynamic Programming"],
  "count-paths":["Target Sum","Medium","Dynamic Programming"],
  "coin-change-ii":["Coin Change II","Medium","Dynamic Programming"],
  "interleaving-string":["Interleaving String","Medium","Dynamic Programming"],
  "longest-increasing-path-in-matrix":["Longest Increasing Path in a Matrix","Hard","Dynamic Programming"],
  "distinct-subsequences":["Distinct Subsequences","Hard","Dynamic Programming"],
  "edit-distance":["Edit Distance","Medium","Dynamic Programming"],
  "burst-balloons":["Burst Balloons","Hard","Dynamic Programming"],
  "regular-expression-matching":["Regular Expression Matching","Hard","Dynamic Programming"],
  // Greedy
  "maximum-subarray":["Maximum Subarray","Medium","Greedy"],
  "jump-game":["Jump Game","Medium","Greedy"],
  "jump-game-ii":["Jump Game II","Medium","Greedy"],
  "gas-station":["Gas Station","Medium","Greedy"],
  "hand-of-straights":["Hand of Straights","Medium","Greedy"],
  "merge-triplets-to-form-target":["Merge Triplets to Form Target Triplet","Medium","Greedy"],
  "partition-labels":["Partition Labels","Medium","Greedy"],
  "valid-parenthesis-string":["Valid Parenthesis String","Medium","Greedy"],
  // Intervals
  "insert-new-interval":["Insert Interval","Medium","Intervals"],
  "merge-intervals":["Merge Intervals","Medium","Intervals"],
  "non-overlapping-intervals":["Non-overlapping Intervals","Medium","Intervals"],
  "meeting-schedule":["Meeting Rooms","Easy","Intervals"],
  "meeting-schedule-ii":["Meeting Rooms II","Medium","Intervals"],
  "minimum-interval-including-query":["Minimum Interval to Include Each Query","Hard","Intervals"],
  // Math & Geometry
  "rotate-image":["Rotate Image","Medium","Math & Bit Manipulation"],
  "spiral-matrix":["Spiral Matrix","Medium","Math & Bit Manipulation"],
  "set-zeroes-in-matrix":["Set Matrix Zeroes","Medium","Math & Bit Manipulation"],
  "happy-number":["Happy Number","Easy","Math & Bit Manipulation"],
  "plus-one":["Plus One","Easy","Math & Bit Manipulation"],
  "pow-x-n":["Pow(x, n)","Medium","Math & Bit Manipulation"],
  "multiply-strings":["Multiply Strings","Medium","Math & Bit Manipulation"],
  "detect-squares":["Detect Squares","Medium","Math & Bit Manipulation"],
  // Bit Manipulation
  "single-number":["Single Number","Easy","Math & Bit Manipulation"],
  "number-of-one-bits":["Number of 1 Bits","Easy","Math & Bit Manipulation"],
  "counting-bits":["Counting Bits","Easy","Math & Bit Manipulation"],
  "reverse-bits":["Reverse Bits","Easy","Math & Bit Manipulation"],
  "missing-number":["Missing Number","Easy","Math & Bit Manipulation"],
  "sum-of-two-integers":["Sum of Two Integers","Medium","Math & Bit Manipulation"],
  "reverse-integer":["Reverse Integer","Medium","Math & Bit Manipulation"],
};

function extractSlug(url) {
  if (!url) return null;
  // Match neetcode.io/problems/<slug>/...
  const m = url.match(/neetcode\.io\/problems\/([^/?#]+)/);
  if (m) return m[1];
  // Also try leetcode.com/problems/<slug>/...
  const lc = url.match(/leetcode\.com\/problems\/([^/?#]+)/);
  if (lc) return lc[1];
  return null;
}

function lookupProblem(url) {
  const slug = extractSlug(url);
  if (!slug || !NC150[slug]) return null;
  const [name, difficulty, pattern] = NC150[slug];
  return { name, difficulty, pattern };
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

// Persistence via PostgreSQL backend
const API_URL = import.meta.env.VITE_API_URL ?? "";

async function loadData() {
  try {
    const res = await fetch(`${API_URL}/api/data`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("Load failed:", e);
    return null;
  }
}

async function saveData(data) {
  try {
    const res = await fetch(`${API_URL}/api/data`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.error("Save failed:", e);
  }
}

const DEFAULT_STATE = { problems: [], patternNotes: {} };

export default function LeetCodeTracker() {
  const [data, setData] = useState(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("dashboard"); // dashboard | add | review | patterns | all
  const [editingId, setEditingId] = useState(null);
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [filterPattern, setFilterPattern] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    loadData().then(d => {
      if (d && d.problems) setData(d);
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((newData) => {
    setData(newData);
    saveData(newData);
  }, []);

  // Derived stats
  const stats = useMemo(() => {
    const p = data.problems;
    const todayStr = today();
    const dueForReview = p.filter(x => x.nextReview <= todayStr);
    const byPattern = {};
    PATTERNS.forEach(pat => { byPattern[pat] = { total: 0, confident: 0, shaky: 0, learning: 0 }; });
    p.forEach(prob => {
      const pat = prob.pattern || "Other";
      if (!byPattern[pat]) byPattern[pat] = { total: 0, confident: 0, shaky: 0, learning: 0 };
      byPattern[pat].total++;
      if (prob.rating === 3) byPattern[pat].confident++;
      else if (prob.rating === 2) byPattern[pat].shaky++;
      else byPattern[pat].learning++;
    });
    const confidentPatterns = Object.entries(byPattern).filter(([_, v]) => v.confident >= 3 && v.total >= 3).length;
    const totalSolved = p.length;
    const avgTime = p.length > 0 ? Math.round(p.reduce((s, x) => s + (x.time || 0), 0) / p.length) : 0;
    return { dueForReview, byPattern, confidentPatterns, totalSolved, avgTime };
  }, [data.problems]);

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8" }}>Loading...</div>;

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      background: "#0a0f1a",
      color: "#e2e8f0",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6 !important; }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1e293b",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0d1320",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#3b82f6", letterSpacing: -0.5 }}>LC</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "#94a3b8" }}>Pattern Tracker</span>
        </div>
        <Nav view={view} setView={setView} dueCount={stats.dueForReview.length} />
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        {view === "dashboard" && <Dashboard stats={stats} data={data} setView={setView} />}
        {view === "add" && <AddProblem data={data} persist={persist} editingId={editingId} setEditingId={setEditingId} setView={setView} showToast={showToast} />}
        {view === "review" && <ReviewQueue data={data} persist={persist} stats={stats} />}
        {view === "patterns" && <PatternView stats={stats} data={data} persist={persist} />}
        {view === "all" && <AllProblems data={data} persist={persist} setView={setView} setEditingId={setEditingId} sortField={sortField} setSortField={setSortField} sortDir={sortDir} setSortDir={setSortDir} filterPattern={filterPattern} setFilterPattern={setFilterPattern} />}
      </div>
      {toast && (
        <div style={{
          position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)",
          background: "#2d6a4f", color: "#d8f3dc",
          padding: "12px 20px", borderRadius: 8,
          fontSize: 13, fontWeight: 500,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function Nav({ view, setView, dueCount }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "add", label: "+ Add" },
    { id: "review", label: "Review", badge: dueCount },
    { id: "patterns", label: "Patterns" },
    { id: "all", label: "All" },
  ];
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setView(t.id)} style={{
          padding: "6px 14px",
          borderRadius: 6,
          border: "none",
          background: view === t.id ? "#1e293b" : "transparent",
          color: view === t.id ? "#e2e8f0" : "#64748b",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s",
        }}>
          {t.label}
          {t.badge > 0 && (
            <span style={{
              background: "#ef4444",
              color: "#fff",
              borderRadius: 10,
              padding: "1px 7px",
              fontSize: 10,
              fontWeight: 700,
            }}>{t.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#0d1320",
      border: "1px solid #1e293b",
      borderRadius: 8,
      padding: "16px 20px",
      flex: 1,
      minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: accent || "#e2e8f0", letterSpacing: -1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Dino pet ──────────────────────────────────────────────────────────────
const DINO_GRIDS = {
  happy: [
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,1,2,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,4,4,4,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,1,3,3,3,3,1,1,1,1,0,0,0,0],
    [1,1,3,3,3,3,1,0,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,1,0,0,0,0,0,0],
  ],
  hungry: [
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,1,2,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,4,4,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,1,3,3,3,3,1,1,1,1,0,0,0,0],
    [1,1,3,3,3,3,1,0,1,1,0,0,0,0],
    [0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,1,0,0,0,0,0,0],
  ],
  itchy: [
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,1,2,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,4,4,4,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,5,0],
    [0,0,1,1,1,1,1,1,1,0,1,0,0,0],
    [0,1,3,3,3,3,1,1,0,0,0,0,0,0],
    [1,1,3,3,3,3,1,1,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,0,0,0,0,0],
  ],
  sad: [
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,1,2,1,1,1,1,1,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,4,4,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,1,3,3,3,3,1,1,0,0,0,0,0,0],
    [1,1,3,3,3,3,1,1,1,0,0,0,0,0],
    [0,1,1,1,1,1,1,0,1,5,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,1,1,0,0,0,0,0,0],
  ],
};

const DINO_COLORS = {
  base:   { 0:"transparent", 1:"#4ade80", 2:"#0a0f1a", 3:"#86efac", 4:"#166534", 5:"#60a5fa" },
  hungry: { 0:"transparent", 1:"#a3e635", 2:"#0a0f1a", 3:"#bef264", 4:"#166534", 5:"#60a5fa" },
  sad:    { 0:"transparent", 1:"#94a3b8", 2:"#0a0f1a", 3:"#cbd5e1", 4:"#475569", 5:"#60a5fa" },
};

function DinoPixel({ grid, colors }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${grid[0].length}, 11px)`, gap: 1 }}>
      {grid.flat().map((val, i) => (
        <div key={i} style={{ width: 11, height: 11, borderRadius: 1, background: colors[val] || "transparent" }} />
      ))}
    </div>
  );
}

function DinoCard({ data, stats }) {
  const todayStr = today();
  const lastAdded = data.problems.length > 0
    ? data.problems.reduce((latest, p) => p.date > latest ? p.date : latest, "")
    : null;
  const hungerDays = lastAdded ? daysBetween(lastAdded, todayStr) : 99;
  const dueCount = stats.dueForReview.length;

  const isHungry = hungerDays >= 2;
  const isItchy = dueCount >= 3;
  let state = "happy";
  if (isHungry && isItchy) state = "sad";
  else if (isHungry) state = "hungry";
  else if (isItchy) state = "itchy";

  const hungerPct = Math.max(0, 100 - hungerDays * 25);
  const cleanPct  = Math.max(0, 100 - dueCount * 12);
  const barColor  = pct => pct > 60 ? "#22c55e" : pct > 30 ? "#eab308" : "#ef4444";

  const hungerLabel = hungerDays === 0 ? "full" : hungerDays === 1 ? "peckish" : hungerDays === 2 ? "hungry" : "starving";
  const cleanLabel  = dueCount === 0 ? "squeaky clean" : dueCount <= 2 ? "slightly itchy" : dueCount <= 5 ? "itchy" : "very itchy";

  const speech = {
    happy:  "all good!",
    hungry: `haven't eaten in ${hungerDays}d...`,
    itchy:  `${dueCount} reviews overdue... itchy`,
    sad:    "feed me and shower me please",
  }[state];

  const palette = state === "hungry" ? DINO_COLORS.hungry : state === "sad" ? DINO_COLORS.sad : DINO_COLORS.base;

  return (
    <div style={{ background: "#0d1320", border: "1px solid #1e293b", borderRadius: 8, padding: 20, marginBottom: 24 }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Pet</div>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, padding: "5px 10px", fontSize: 11, color: "#94a3b8", position: "relative", whiteSpace: "nowrap" }}>
            {speech}
            <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #334155" }} />
          </div>
          <DinoPixel grid={DINO_GRIDS[state]} colors={palette} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 5 }}>
              <span>Hunger</span><span style={{ color: barColor(hungerPct) }}>{hungerLabel}</span>
            </div>
            <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${hungerPct}%`, height: "100%", background: barColor(hungerPct), borderRadius: 3, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>solve new problems to feed</div>
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 5 }}>
              <span>Cleanliness</span><span style={{ color: barColor(cleanPct) }}>{cleanLabel}</span>
            </div>
            <div style={{ height: 5, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${cleanPct}%`, height: "100%", background: barColor(cleanPct), borderRadius: 3, transition: "width 0.5s" }} />
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 4 }}>clear review queue to shower</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ stats, data, setView }) {
  const todayStr = today();
  const recent = data.problems.slice().sort((a, b) => b.date > a.date ? 1 : -1).slice(0, 5);
  const weekStart = addDays(todayStr, -6);
  const thisWeek = data.problems.filter(p => p.date >= weekStart).length;

  return (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Solved" value={stats.totalSolved} sub={`${thisWeek} this week`} accent="#3b82f6" />
        <StatCard label="Due for Review" value={stats.dueForReview.length} sub={stats.dueForReview.length > 0 ? "Tap Review to start" : "All caught up"} accent={stats.dueForReview.length > 0 ? "#ef4444" : "#22c55e"} />
        <StatCard label="Patterns Confident" value={`${stats.confidentPatterns}/16`} sub="3+ problems at rating 3" accent="#a855f7" />
        <StatCard label="Avg Time" value={stats.avgTime > 0 ? `${stats.avgTime}m` : "—"} sub="Minutes per problem" />
      </div>

      <DinoCard data={data} stats={stats} />

      {/* Rating distribution */}
      {stats.totalSolved > 0 && (
        <div style={{ background: "#0d1320", border: "1px solid #1e293b", borderRadius: 8, padding: 20, marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Rating Distribution</div>
          <div style={{ display: "flex", gap: 16 }}>
            {[3, 2, 1].map(r => {
              const count = data.problems.filter(p => p.rating === r).length;
              const pct = Math.round((count / stats.totalSolved) * 100);
              const cfg = RATING_CONFIG[r];
              return (
                <div key={r} style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: cfg.color }}>{cfg.emoji} {cfg.label}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{count} ({pct}%)</span>
                  </div>
                  <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: cfg.color, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent problems */}
      {recent.length > 0 && (
        <div style={{ background: "#0d1320", border: "1px solid #1e293b", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>Recent Problems</span>
            <button onClick={() => setView("all")} style={{ fontSize: 11, color: "#3b82f6", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
          </div>
          {recent.map(p => (
            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1a2332" }}>
              <div>
                <span style={{ fontSize: 13, color: "#e2e8f0" }}>{p.name}</span>
                <span style={{ fontSize: 11, color: "#475569", marginLeft: 8 }}>{p.pattern}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {p.time > 0 && <span style={{ fontSize: 11, color: "#475569" }}>{p.time}m</span>}
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: RATING_CONFIG[p.rating]?.color || "#64748b",
                  background: RATING_CONFIG[p.rating]?.bg || "#1e293b",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}>{p.rating}/3</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats.totalSolved === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>∅</div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>No problems tracked yet</div>
          <button onClick={() => setView("add")} style={{
            padding: "8px 20px", background: "#3b82f6", color: "#fff", border: "none",
            borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
          }}>Add your first problem</button>
        </div>
      )}
    </div>
  );
}

function AddProblem({ data, persist, editingId, setEditingId, setView, showToast }) {
  const existing = editingId ? data.problems.find(p => p.id === editingId) : null;
  const [name, setName] = useState(existing?.name || "");
  const [link, setLink] = useState(existing?.link || "");
  const [pattern, setPattern] = useState(existing?.pattern || PATTERNS[0]);
  const [rating, setRating] = useState(existing?.rating || 2);
  const [time, setTime] = useState(existing?.time || "");
  const [patternNote, setPatternNote] = useState(existing?.patternNote || "");
  const [insight, setInsight] = useState(existing?.insight || "");
  const [difficulty, setDifficulty] = useState(existing?.difficulty || "Medium");
  const [autoFilled, setAutoFilled] = useState(false);
  const [timerPhase, setTimerPhase] = useState(existing ? "done" : "idle"); // idle | running | done
  const [timerStart, setTimerStart] = useState(null);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (timerPhase !== "running") return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - timerStart) / 1000)), 1000);
    return () => clearInterval(id);
  }, [timerPhase, timerStart]);

  function fmtElapsed(s) {
    const m = String(Math.floor(s / 60)).padStart(2, "0");
    const sec = String(s % 60).padStart(2, "0");
    return `${m}:${sec}`;
  }

  function handleStartTimer() {
    const now = Date.now();
    setTimerStart(now);
    setElapsed(0);
    setTimerPhase("running");
  }

  function handleDone() {
    setTime(Math.max(1, Math.round(elapsed / 60)));
    setTimerPhase("done");
  }

  function handleLinkChange(url) {
    setLink(url);
    setAutoFilled(false);
    const info = lookupProblem(url);
    if (info) {
      setName(info.name);
      setDifficulty(info.difficulty);
      setPattern(info.pattern);
      setAutoFilled(true);
    }
  }

  useEffect(() => {
    if (existing) {
      setName(existing.name); setLink(existing.link || ""); setPattern(existing.pattern);
      setRating(existing.rating); setTime(existing.time || ""); setPatternNote(existing.patternNote || "");
      setInsight(existing.insight || ""); setDifficulty(existing.difficulty || "Medium");
    }
  }, [editingId, existing]);

  function handleSubmit() {
    if (!name.trim()) return;
    const todayStr = today();
    const reviewDays = RATING_CONFIG[rating].reviewDays;
    const problem = {
      id: existing?.id || Date.now().toString(),
      name: name.trim(),
      link: link.trim(),
      pattern,
      rating,
      time: parseInt(time) || 0,
      patternNote: patternNote.trim(),
      insight: insight.trim(),
      difficulty,
      date: existing?.date || todayStr,
      nextReview: addDays(todayStr, reviewDays),
      reviewHistory: existing?.reviewHistory || [],
      lastUpdated: todayStr,
    };

    let newProblems;
    if (existing) {
      newProblems = data.problems.map(p => p.id === existing.id ? problem : p);
    } else {
      newProblems = [...data.problems, problem];
    }
    persist({ ...data, problems: newProblems });

    if (existing) {
      showToast("Problem updated");
      setName(""); setLink(""); setPattern(PATTERNS[0]); setRating(2);
      setTime(""); setPatternNote(""); setInsight(""); setDifficulty("Medium");
      setAutoFilled(false); setTimerPhase("idle"); setElapsed(0); setTimerStart(null);
      setEditingId(null);
      setView("all");
    } else {
      setCelebrate(true);
      setTimeout(() => {
        setName(""); setLink(""); setPattern(PATTERNS[0]); setRating(2);
        setTime(""); setPatternNote(""); setInsight(""); setDifficulty("Medium");
        setAutoFilled(false); setTimerPhase("idle"); setElapsed(0); setTimerStart(null);
        setCelebrate(false);
      }, 2000);
    }
  }

  const inputStyle = {
    width: "100%", padding: "10px 12px", background: "#0a0f1a", border: "1px solid #1e293b",
    borderRadius: 6, color: "#e2e8f0", fontSize: 13, fontFamily: "inherit",
  };
  const labelStyle = { fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, display: "block" };

  if (celebrate) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{
          background: "#0d1320", border: "1px solid #2d6a4f", borderRadius: 10,
          padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 13, color: "#22c55e", textTransform: "uppercase", letterSpacing: 1 }}>Problem saved</div>
          <div style={{ background: "#1e293b", border: "1px solid #2d6a4f", borderRadius: 8, padding: "6px 16px", fontSize: 12, color: "#86efac", position: "relative", whiteSpace: "nowrap" }}>
            nom nom nom 🍖 fed!
            <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #2d6a4f" }} />
          </div>
          <DinoPixel grid={DINO_GRIDS.happy} colors={DINO_COLORS.base} />
          <div style={{ fontSize: 13, color: "#64748b" }}>
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{name}</span> added
          </div>
        </div>
      </div>
    );
  }

  // Idle phase: URL input + start timer
  if (timerPhase === "idle") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>Start Session</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>NeetCode / LeetCode Link</label>
            <input
              value={link}
              onChange={e => handleLinkChange(e.target.value)}
              placeholder="Paste neetcode.io or leetcode.com URL"
              style={{ ...inputStyle, borderColor: autoFilled ? "#2d6a4f" : "#1e293b" }}
              autoFocus
            />
            {autoFilled && (
              <div style={{ fontSize: 11, color: "#2d6a4f", marginTop: 4 }}>✓ Auto-filled from NeetCode 150</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={handleStartTimer} disabled={!link.trim()} style={{
              padding: "11px 24px", background: "#3b82f6", color: "#fff", border: "none",
              borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: link.trim() ? "pointer" : "not-allowed",
              fontFamily: "inherit", opacity: link.trim() ? 1 : 0.4, transition: "opacity 0.15s",
            }}>
              Start Timer
            </button>
            <button onClick={() => setTimerPhase("done")} style={{
              padding: "11px 16px", background: "transparent", color: "#64748b",
              border: "1px solid #1e293b", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}>
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Running phase: live timer card + done button
  if (timerPhase === "running") {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>In Progress</h2>
        <div style={{
          background: "#0d1320", border: "1px solid #1e293b", borderRadius: 10, padding: "28px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
        }}>
          {name && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0" }}>{name}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{pattern} · {difficulty}</div>
            </div>
          )}
          <div style={{ fontSize: 48, fontWeight: 700, color: "#3b82f6", letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>
            {fmtElapsed(elapsed)}
          </div>
          <button onClick={handleDone} style={{
            padding: "12px 32px", background: "#2d6a4f", color: "#d8f3dc", border: "none",
            borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>
            Done Solving
          </button>
          <button onClick={() => setTimerPhase("idle")} style={{
            background: "none", border: "none", color: "#475569", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 20 }}>
        {existing ? "Edit Problem" : "Log Problem"}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={labelStyle}>NeetCode / LeetCode Link</label>
          <input value={link} onChange={e => handleLinkChange(e.target.value)} placeholder="Paste neetcode.io or leetcode.com URL — auto-fills name, difficulty & pattern" style={{
            ...inputStyle,
            borderColor: autoFilled ? "#2d6a4f" : "#1e293b",
          }} />
          {autoFilled && (
            <div style={{ fontSize: 11, color: "#2d6a4f", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
              <span>✓</span> Auto-filled from NeetCode 150
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 2 }}>
            <label style={labelStyle}>Problem Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Two Sum" style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Difficulty</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} style={inputStyle}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Pattern</label>
            <select value={pattern} onChange={e => setPattern(e.target.value)} style={inputStyle}>
              {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Time (minutes)</label>
            <input type="number" value={time} onChange={e => setTime(e.target.value)} placeholder="25" style={inputStyle} />
          </div>
        </div>

        {/* Rating selector */}
        <div>
          <label style={labelStyle}>How did you solve it?</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[3, 2, 1].map(r => {
              const cfg = RATING_CONFIG[r];
              const selected = rating === r;
              return (
                <button key={r} onClick={() => setRating(r)} style={{
                  flex: 1, padding: "10px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                  border: selected ? `2px solid ${cfg.color}` : "1px solid #1e293b",
                  background: selected ? cfg.bg + "22" : "#0d1320",
                  color: selected ? cfg.color : "#64748b",
                  fontSize: 12, fontWeight: selected ? 600 : 400,
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{cfg.emoji}</div>
                  <div>{r}/3</div>
                  <div style={{ fontSize: 10, marginTop: 2 }}>{cfg.label}</div>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 6 }}>
            Next review: {RATING_CONFIG[rating].reviewDays} day{RATING_CONFIG[rating].reviewDays > 1 ? "s" : ""} from now
          </div>
        </div>

        <div>
          <label style={labelStyle}>Pattern (one sentence)</label>
          <input value={patternNote} onChange={e => setPatternNote(e.target.value)}
            placeholder='e.g., "Sliding window: expand right until invalid, shrink left until valid"' style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Key Insight — what unlocked it?</label>
          <textarea value={insight} onChange={e => setInsight(e.target.value)} rows={3}
            placeholder='e.g., "Sort the array first, then two pointers from both ends"' style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        <button onClick={handleSubmit} style={{
          padding: "12px 24px", background: "#3b82f6", color: "#fff", border: "none",
          borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          opacity: name.trim() ? 1 : 0.4, transition: "opacity 0.15s",
        }}>
          {existing ? "Update Problem" : "Save Problem"}
        </button>
      </div>
    </div>
  );
}

function ReviewQueue({ data, persist, stats }) {
  const due = useMemo(
    () => [...stats.dueForReview].sort((a, b) => a.nextReview < b.nextReview ? -1 : a.nextReview > b.nextReview ? 1 : 0),
    [stats.dueForReview]
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalDue] = useState(due.length);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  const [celebrateProblem, setCelebrateProblem] = useState(null);

  if (celebrateProblem) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{
          background: "#0d1320", border: "1px solid #1e3a5f", borderRadius: 10,
          padding: "40px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
        }}>
          <div style={{ fontSize: 13, color: "#60a5fa", textTransform: "uppercase", letterSpacing: 1 }}>Review complete</div>
          <div style={{ background: "#1e293b", border: "1px solid #1e3a5f", borderRadius: 8, padding: "6px 16px", fontSize: 12, color: "#93c5fd", position: "relative", whiteSpace: "nowrap" }}>
            squeaky clean 🚿
            <div style={{ position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #1e3a5f" }} />
          </div>
          <DinoPixel grid={DINO_GRIDS.happy} colors={DINO_COLORS.base} />
          <div style={{ fontSize: 13, color: "#64748b" }}>
            <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{celebrateProblem}</span> reviewed
          </div>
        </div>
      </div>
    );
  }

  if (due.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 14 }}>No problems due for review</div>
        <div style={{ fontSize: 12, marginTop: 8, color: "#334155" }}>Check back tomorrow</div>
      </div>
    );
  }

  const current = due[0];
  if (!current) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#22c55e" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
        <div style={{ fontSize: 14 }}>Review session complete!</div>
        <div style={{ fontSize: 12, marginTop: 8, color: "#475569" }}>Reviewed {totalDue} problem{totalDue > 1 ? "s" : ""}</div>
      </div>
    );
  }

  function handleRate(newRating) {
    const todayStr = today();
    const reviewDays = RATING_CONFIG[newRating].reviewDays;
    // If rating dropped from previous, use shorter intervals
    let adjustedDays = reviewDays;
    if (newRating === 3 && current.reviewHistory?.length > 0) {
      // Graduated: double the interval each time at rating 3
      const consecutive3s = (current.reviewHistory || []).filter(r => r.rating === 3).length;
      adjustedDays = Math.min(14 * Math.pow(2, consecutive3s), 60); // cap at 60 days
    }

    const updated = {
      ...current,
      rating: newRating,
      nextReview: addDays(todayStr, adjustedDays),
      lastUpdated: todayStr,
      reviewHistory: [...(current.reviewHistory || []), { date: todayStr, rating: newRating }],
    };
    const newProblems = data.problems.map(p => p.id === current.id ? updated : p);
    persist({ ...data, problems: newProblems });
    setCelebrateProblem(current.name);
    setTimeout(() => {
      setShowDetails(false);
      setCurrentIdx(i => i + 1);
      setCelebrateProblem(null);
    }, 2000);
  }

  const daysOverdue = daysBetween(current.nextReview, today());

  function handleCopy() {
    navigator.clipboard.writeText(current.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>
          Reviewing {currentIdx + 1} of {totalDue}
        </span>
        <div style={{ height: 4, flex: 1, background: "#1e293b", borderRadius: 2, margin: "0 16px", overflow: "hidden" }}>
          <div style={{ width: `${(currentIdx / totalDue) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 2, transition: "width 0.3s" }} />
        </div>
      </div>

      <div style={{ background: "#0d1320", border: "1px solid #1e293b", borderRadius: 8, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{current.name}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#3b82f6", background: "#1e293b", padding: "2px 8px", borderRadius: 4 }}>{current.pattern}</span>
              <span style={{ fontSize: 11, color: current.difficulty === "Hard" ? "#ef4444" : current.difficulty === "Medium" ? "#eab308" : "#22c55e" }}>{current.difficulty}</span>
              {daysOverdue > 0 && <span style={{ fontSize: 11, color: "#ef4444" }}>{daysOverdue}d overdue</span>}
            </div>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: RATING_CONFIG[current.rating]?.color,
            background: RATING_CONFIG[current.rating]?.bg + "33",
            padding: "4px 10px", borderRadius: 4,
          }}>Last: {current.rating}/3</span>
        </div>

        {current.link && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "#3b82f6", wordBreak: "break-all" }}>{current.link}</span>
            <button onClick={handleCopy} style={{
              flexShrink: 0, padding: "3px 10px", background: copied ? "#2d6a4f" : "#1e293b",
              color: copied ? "#d8f3dc" : "#94a3b8", border: "none", borderRadius: 4,
              fontSize: 11, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>
            Try solving this problem from scratch before revealing your notes.
          </div>

          <button onClick={() => setShowDetails(!showDetails)} style={{
            padding: "8px 16px", background: "#1e293b", color: "#94a3b8", border: "none",
            borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
          }}>
            {showDetails ? "Hide Notes" : "Reveal Notes"}
          </button>

          {showDetails && (
            <div style={{ marginTop: 12, padding: 16, background: "#0a0f1a", borderRadius: 6, border: "1px solid #1a2332" }}>
              {current.patternNote && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pattern</div>
                  <div style={{ fontSize: 13, color: "#cbd5e1" }}>{current.patternNote}</div>
                </div>
              )}
              {current.insight && (
                <div>
                  <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Key Insight</div>
                  <div style={{ fontSize: 13, color: "#cbd5e1" }}>{current.insight}</div>
                </div>
              )}
              {!current.patternNote && !current.insight && (
                <div style={{ fontSize: 12, color: "#475569" }}>No notes recorded. Consider adding them after this review.</div>
              )}
            </div>
          )}
        </div>

        {/* Rate buttons */}
        <div>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>How did it go this time?</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[3, 2, 1].map(r => {
              const cfg = RATING_CONFIG[r];
              return (
                <button key={r} onClick={() => handleRate(r)} style={{
                  flex: 1, padding: "12px 8px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
                  border: `1px solid ${cfg.color}44`,
                  background: "#0a0f1a",
                  color: cfg.color,
                  fontSize: 12, fontWeight: 500,
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{cfg.emoji}</div>
                  <div>{cfg.label}</div>
                  <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>Review in {cfg.reviewDays}d</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PatternView({ stats, data, persist }) {
  const [expandedPattern, setExpandedPattern] = useState(null);

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Pattern Confidence</h2>
      <p style={{ fontSize: 12, color: "#475569", marginBottom: 20 }}>3+ problems at rating 3 = confident (marked green)</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {PATTERNS.map(pat => {
          const s = stats.byPattern[pat] || { total: 0, confident: 0, shaky: 0, learning: 0 };
          const isConfident = s.confident >= 3 && s.total >= 3;
          const expanded = expandedPattern === pat;
          const problems = data.problems.filter(p => p.pattern === pat);

          return (
            <div key={pat}>
              <button onClick={() => setExpandedPattern(expanded ? null : pat)} style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", background: "#0d1320", border: `1px solid ${isConfident ? "#2d6a4f44" : "#1e293b"}`,
                borderRadius: expanded ? "8px 8px 0 0" : 8, cursor: "pointer", fontFamily: "inherit",
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14, color: isConfident ? "#22c55e" : "#64748b" }}>{isConfident ? "●" : "○"}</span>
                  <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 500 }}>{pat}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 11, color: "#475569" }}>
                    {s.total === 0 ? "—" : `${s.confident}✓ ${s.shaky}~ ${s.learning}✗`}
                  </span>
                  <span style={{ fontSize: 11, color: "#334155" }}>{s.total} total</span>
                  <span style={{ fontSize: 11, color: "#334155" }}>{expanded ? "▲" : "▼"}</span>
                </div>
              </button>
              {expanded && (
                <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderTop: "none", borderRadius: "0 0 8px 8px", padding: 12 }}>
                  {problems.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#475569", padding: 8 }}>No problems in this pattern yet</div>
                  ) : (
                    problems.map(p => (
                      <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 8px", borderBottom: "1px solid #1a2332" }}>
                        <div>
                          <span style={{ fontSize: 12, color: "#e2e8f0" }}>{p.name}</span>
                          {p.patternNote && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{p.patternNote}</div>}
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: RATING_CONFIG[p.rating]?.color,
                          background: RATING_CONFIG[p.rating]?.bg + "22",
                          padding: "2px 8px", borderRadius: 4,
                        }}>{p.rating}/3</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AllProblems({ data, persist, setView, setEditingId, sortField, setSortField, sortDir, setSortDir, filterPattern, setFilterPattern }) {
  let problems = [...data.problems];

  if (filterPattern !== "all") {
    problems = problems.filter(p => p.pattern === filterPattern);
  }

  problems.sort((a, b) => {
    let cmp = 0;
    if (sortField === "date") cmp = a.date > b.date ? 1 : -1;
    else if (sortField === "rating") cmp = a.rating - b.rating;
    else if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "review") cmp = a.nextReview > b.nextReview ? 1 : -1;
    else if (sortField === "time") cmp = (a.time || 0) - (b.time || 0);
    return sortDir === "desc" ? -cmp : cmp;
  });

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  function deleteProblem(id) {
    const newProblems = data.problems.filter(p => p.id !== id);
    persist({ ...data, problems: newProblems });
  }

  const sortIndicator = (field) => sortField === field ? (sortDir === "desc" ? " ↓" : " ↑") : "";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>All Problems ({problems.length})</h2>
        <select value={filterPattern} onChange={e => setFilterPattern(e.target.value)} style={{
          padding: "6px 10px", background: "#0d1320", border: "1px solid #1e293b",
          borderRadius: 6, color: "#94a3b8", fontSize: 12, fontFamily: "inherit",
        }}>
          <option value="all">All Patterns</option>
          {PATTERNS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Sort buttons */}
      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        {[["date", "Date"], ["name", "Name"], ["rating", "Rating"], ["review", "Next Review"], ["time", "Time"]].map(([field, label]) => (
          <button key={field} onClick={() => toggleSort(field)} style={{
            padding: "4px 10px", borderRadius: 4, border: "1px solid #1e293b",
            background: sortField === field ? "#1e293b" : "transparent",
            color: sortField === field ? "#e2e8f0" : "#64748b",
            fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          }}>{label}{sortIndicator(field)}</button>
        ))}
      </div>

      {problems.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#475569", fontSize: 13 }}>No problems found</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {problems.map(p => {
            const isDue = p.nextReview <= today();
            return (
              <div key={p.id} style={{
                background: "#0d1320", border: `1px solid ${isDue ? "#ef444433" : "#1e293b"}`,
                borderRadius: 6, padding: "10px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#e2e8f0" }}>{p.name}</span>
                      <span style={{ fontSize: 10, color: p.difficulty === "Hard" ? "#ef4444" : p.difficulty === "Medium" ? "#eab308" : "#22c55e" }}>{p.difficulty}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#3b82f6", background: "#1e293b", padding: "1px 6px", borderRadius: 3 }}>{p.pattern}</span>
                      {p.time > 0 && <span style={{ fontSize: 11, color: "#475569" }}>{p.time}m</span>}
                      <span style={{ fontSize: 11, color: "#475569" }}>Added {p.date}</span>
                      <span style={{ fontSize: 11, color: isDue ? "#ef4444" : "#475569" }}>
                        {isDue ? "Due now" : `Review ${p.nextReview}`}
                      </span>
                    </div>
                    {p.patternNote && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>{p.patternNote}</div>}
                    {p.insight && <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>💡 {p.insight}</div>}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 12 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: RATING_CONFIG[p.rating]?.color,
                      background: RATING_CONFIG[p.rating]?.bg + "22",
                      padding: "3px 10px", borderRadius: 4,
                    }}>{p.rating}/3</span>
                    <button onClick={() => { setEditingId(p.id); setView("add"); }} style={{
                      padding: "4px 8px", background: "none", border: "1px solid #1e293b",
                      borderRadius: 4, color: "#64748b", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    }}>Edit</button>
                    <button onClick={() => deleteProblem(p.id)} style={{
                      padding: "4px 8px", background: "none", border: "1px solid #1e293b",
                      borderRadius: 4, color: "#ef444488", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                    }}>×</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
