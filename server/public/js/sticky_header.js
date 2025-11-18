function setupStickyHeader() {
            const header = document.getElementById('main-nav');
            const headerHeight = header ? header.offsetHeight : 0;
            
            if (header) {
                window.addEventListener('scroll', function() {
                    if (window.scrollY > headerHeight) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                });
            }
        }
setupStickyHeader();