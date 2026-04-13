/**
 * TypingIndicator
 * Displays the animated three-dot "TheraFlow is typing..." indicator.
 */
export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 mb-2 animate-fade-in">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-2xl bg-sage-100 flex items-center justify-center text-sm flex-shrink-0">
        🌿
      </div>

      {/* Dots bubble */}
      <div className="bg-white border border-stone-100 rounded-3xl rounded-bl-sm px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-sage-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-sage-400 inline-block" />
          <span className="typing-dot w-2 h-2 rounded-full bg-sage-400 inline-block" />
        </div>
      </div>
    </div>
  );
}
