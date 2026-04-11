import "@testing-library/jest-dom";

// Mock clipboard API (not available in jsdom)
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
  writable: true,
});

// Silence fetch errors from saveData; tests don't need a real backend
global.fetch = vi.fn().mockResolvedValue({ ok: true });
