const ExplorePagination = () => {
  return (
    <div className="mt-16 mb-20 flex justify-center gap-4 text-sm text-text-primary">
      {[1, 2, 3, 4, 5].map((page) => (
        <button
          key={page}
          type="button"
          className={`h-7 w-7 rounded ${
            page === 1 ? "bg-primary text-white" : "bg-white"
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default ExplorePagination;