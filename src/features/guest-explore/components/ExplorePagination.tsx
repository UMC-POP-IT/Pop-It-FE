interface ExplorePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const ExplorePagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: ExplorePaginationProps) => {
  return (
    <div className="mt-16 mb-20 flex justify-center gap-4 text-sm text-text-primary">
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? "page" : undefined}
            onClick={() => onPageChange(page)}
            className={`h-7 w-7 rounded ${
              page === currentPage ? "bg-primary text-white" : "bg-white"
            }`}
          >
            {page}
          </button>
        ),
      )}
    </div>
  );
};

export default ExplorePagination;
