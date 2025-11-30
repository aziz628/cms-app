

function PaginationButtons({ page, setPage, pageSize, totalPages }) {

    //  render 4 centered page numbers for pagination
    function renderCenteredPages() {
        const pages = [];
        const firstCenteredPage = Math.max(2, page - 2);
        const lastCenteredPage = Math.min(totalPages - 1, page + 2);
        const pagesNumber = lastCenteredPage - firstCenteredPage + 1;

        for (let i=0; i < pagesNumber; i++) {
            const pageNum = firstCenteredPage + i;
            pages.push(<button
                        key={i}
                        onClick={() => setPage(pageNum)}
                        className={`px-4 py-2 border rounded-md ${page === pageNum ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}
                    >{pageNum}
                    </button>);
        }
        return pages;
    }
    // Previous button
    return (
        <>        
        {/* Pagination Controls */}
        {totalPages > 1 && (
        <div className="flex gap-4 flex-wrap mt-4 ">

            {/* if totalPages is less than pageSize, show all page numbers */}
            {totalPages < pageSize ? (
                Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`px-4 py-2 border rounded-md ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}
                    >
                        {i + 1}
                    </button>
                ))
            ) : (
                <>
                {/*else show a range of page numbers */}
                    {/* show previous button */}
                    {page > 1 && (
                        <button
                            onClick={() => setPage(page - 1)}
                            className={`px-4 py-2  rounded-md bg-black text-white hover:bg-gray-700`}
                        >
                            &lt;
                        </button>
                    )}
                    <button onClick={() => setPage(1)} className={`px-4 py-2 border rounded-md ${page === 1 ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}>
                        1
                    </button>
                    {/* Show ellipsis if there are more than 5 pages */}
                    {page > 5 && <span className="px-4 py-2">...</span>}
                    
                    {/* Show 5 page numbers centered around the current page */}
                    {renderCenteredPages()}

                    {/* Show ellipsis if there are more than 5 pages */}
                    {page < totalPages - 5 && <span className="px-4 py-2">...</span>}
                    <button onClick={() => setPage(totalPages)} className={`px-4 py-2 border rounded-md ${page === totalPages ? 'bg-primary text-white' : 'bg-white text-primary border-primary hover:bg-secondary hover:text-white'}`}>
                        {totalPages}
                    </button>
                    {page < totalPages && (
                        <button
                            onClick={() => setPage(page + 1)}
                            className={`px-4 py-2  rounded-md bg-black text-white hover:bg-gray-700`}
                        >
                            &gt;
                        </button>
                    )}
                </>
                )
        }
        </div>
        )}
        </>

    );
}
export default PaginationButtons;