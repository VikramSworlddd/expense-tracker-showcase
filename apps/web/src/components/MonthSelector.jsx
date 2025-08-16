export default function MonthSelector({ value, onChange }) {
  function handlePrev() {
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    onChange(formatMonth(date));
  }

  function handleNext() {
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month, 1);
    onChange(formatMonth(date));
  }

  function formatMonth(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  function getDisplayMonth() {
    const [year, month] = value.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePrev}
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
        aria-label="Previous month"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <span className="min-w-[150px] text-center font-medium text-slate-100">
        {getDisplayMonth()}
      </span>
      <button
        onClick={handleNext}
        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-300"
        aria-label="Next month"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

