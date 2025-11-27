document.addEventListener('DOMContentLoaded', function() {
    // Select category tabs and gallery items
    const categoryTabs = document.querySelectorAll('.category-tab');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Add click event listeners to category tabs
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Get selected category
            const selectedCategory = this.dataset.category;
            
            // remove active class from all tabs
            categoryTabs.forEach(t => t.classList.remove('active', 'bg-slate-900', 'text-white'));
            
            // add active class to clicked tab
            this.classList.add('active', 'bg-slate-900', 'text-white');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                // Show all items if 'all' is selected
                if (selectedCategory === 'all' || item.dataset.category === selectedCategory) {
                    item.style.display = 'block';
                    // Use setTimeout to ensure 'display' is applied before adding the animation class
                    // allowing CSS transitions to trigger correctly in a new execution frame (a single run of js event loop before the browser render update)
                    setTimeout(() => item.classList.add('animate-in'), 10);
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});