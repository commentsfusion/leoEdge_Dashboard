import React from "react";

const TWButton = ({ children, onClick, disabled, label, active }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={[
      "min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-md text-sm font-medium",
      "transition border",
      active
        ? "bg-gray-900 text-white border-gray-900"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
      disabled ? "opacity-50 cursor-not-allowed hover:bg-white" : "cursor-pointer",
    ].join(" ")}
  >
    {children}
  </button>
);

const Ellipsis = () => (
  <span className="min-w-9 h-9 px-3 inline-flex items-center justify-center text-sm text-gray-400 select-none">
    …
  </span>
);

const CustomPagination = ({ currentPage, totalPages, onPageChange }) => {
  const clampGo = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) onPageChange(page);
  };

  const getRange = () => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (!totalPages || totalPages <= 1) return null;

  const range = getRange();

  return (
    <nav
      aria-label="Pagination"
      className="w-full flex justify-center mt-4"
    >
      <div className="inline-flex items-center gap-2">
        {/* First / Prev */}
        <TWButton
          label="First page"
          onClick={() => clampGo(1)}
          disabled={currentPage === 1}
        >
          «
        </TWButton>
        <TWButton
          label="Previous page"
          onClick={() => clampGo(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ‹
        </TWButton>

        {/* Leading edge + ellipsis */}
        {currentPage > 3 && (
          <>
            <TWButton
              label="Page 1"
              onClick={() => clampGo(1)}
            >
              1
            </TWButton>
            <Ellipsis />
          </>
        )}

        {/* Middle pages */}
        {range.map((p) => (
          <TWButton
            key={p}
            label={`Page ${p}`}
            onClick={() => clampGo(p)}
            active={p === currentPage}
          >
            {p}
          </TWButton>
        ))}

        {/* Trailing ellipsis + last */}
        {currentPage < totalPages - 2 && (
          <>
            <Ellipsis />
            <TWButton
              label={`Page ${totalPages}`}
              onClick={() => clampGo(totalPages)}
            >
              {totalPages}
            </TWButton>
          </>
        )}

        {/* Next / Last */}
        <TWButton
          label="Next page"
          onClick={() => clampGo(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          ›
        </TWButton>
        <TWButton
          label="Last page"
          onClick={() => clampGo(totalPages)}
          disabled={currentPage === totalPages}
        >
          »
        </TWButton>
      </div>
    </nav>
  );
};

export default CustomPagination;
