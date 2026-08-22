"use client";

export function DraftToggle({ isDraft, onChange }: { isDraft: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded bg-surface-low px-4 py-3.5">
      {/* Hidden input carries the value into FormData on submit */}
      <input type="hidden" name="isDraft" value={isDraft ? "true" : "false"} />

      <div>
        <p className="text-sm font-medium">Save as draft</p>
        <p className="mt-0.5 text-xs text-on-surface-variant">
          {isDraft
            ? "This issue will be hidden from readers until published."
            : "This issue will publish immediately when saved."}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isDraft}
        onClick={() => onChange(!isDraft)}
        className={`relative ml-4 h-[26px] w-[44px] flex-shrink-0 rounded-full transition-colors duration-250 ${
          isDraft ? "bg-accent" : "bg-outline-variant"
        }`}
      >
        <span
          className="absolute top-[3px] h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-250"
          style={{ left: isDraft ? 21 : 3 }}
        />
      </button>
    </div>
  );
}