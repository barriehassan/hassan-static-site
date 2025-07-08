// Projects Page - Search and Filter Functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeProjectsPage();
});

function initializeProjectsPage() {
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const visibleCountEl = document.getElementById('visible-count');
    const totalCountEl = document.getElementById('total-count');
    const noResultsEl = document.getElementById('no-results');
    const projectsGrid = document.getElementById('projects-grid');

    let currentFilter = 'all';
    let currentSearch = '';

    // Set initial counts
    totalCountEl.textContent = projectCards.length;
    updateVisibleCount();

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        currentSearch = e.target.value.toLowerCase().trim();
        filterProjects();
    });

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-electric-blue', 'text-white');
                btn.classList.add('bg-gray-700', 'text-gray-300');
            });
            
            this.classList.add('active', 'bg-electric-blue', 'text-white');
            this.classList.remove('bg-gray-700', 'text-gray-300');

            currentFilter = this.getAttribute('data-filter');
            filterProjects();
        });
    });

    function filterProjects() {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const title = card.getAttribute('data-title').toLowerCase();
            const category = card.getAttribute('data-category').toLowerCase();
            const status = card.getAttribute('data-status').toLowerCase();
            const tech = card.getAttribute('data-tech').toLowerCase();

            // Check search match
            const searchMatch = currentSearch === '' || 
                title.includes(currentSearch) || 
                category.includes(currentSearch) || 
                tech.includes(currentSearch);

            // Check filter match
            let filterMatch = false;
            
            switch(currentFilter) {
                case 'all':
                    filterMatch = true;
                    break;
                case 'web':
                    filterMatch = category.includes('web');
                    break;
                case 'mobile':
                    filterMatch = category.includes('mobile');
                    break;
                case 'design':
                    filterMatch = category.includes('design');
                    break;
                case 'completed':
                    filterMatch = status === 'completed';
                    break;
                case 'progress':
                    filterMatch = status === 'progress';
                    break;
                default:
                    filterMatch = true;
            }

            // Show/hide card based on matches
            if (searchMatch && filterMatch) {
                card.style.display = 'block';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                // Animate in with delay
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                    card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                }, visibleCount * 50);
                
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update visible count
        visibleCountEl.textContent = visibleCount;

        // Show/hide no results message
        if (visibleCount === 0) {
            noResultsEl.classList.remove('hidden');
            projectsGrid.classList.add('hidden');
        } else {
            noResultsEl.classList.add('hidden');
            projectsGrid.classList.remove('hidden');
        }
    }

    function updateVisibleCount() {
        const visibleCards = Array.from(projectCards).filter(card => 
            card.style.display !== 'none'
        );
        visibleCountEl.textContent = visibleCards.length;
    }

    // Clear search functionality
    function clearSearch() {
        searchInput.value = '';
        currentSearch = '';
        filterProjects();
    }

    // Add clear search button functionality
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Escape') {
            clearSearch();
        }
    });

    // Advanced search functionality
    function advancedSearch(query) {
        const terms = query.toLowerCase().split(' ');
        
        projectCards.forEach(card => {
            const searchableText = [
                card.getAttribute('data-title'),
                card.getAttribute('data-category'),
                card.getAttribute('data-tech'),
                card.querySelector('p').textContent
            ].join(' ').toLowerCase();

            const matches = terms.every(term => searchableText.includes(term));
            
            if (matches) {
                highlightSearchTerms(card, terms);
            }
        });
    }

    function highlightSearchTerms(card, terms) {
        const titleElement = card.querySelector('h3');
        const descriptionElement = card.querySelector('p');
        
        // Simple highlighting (can be enhanced)
        terms.forEach(term => {
            if (term.length > 2) { // Only highlight terms longer than 2 characters
                const regex = new RegExp(`(${term})`, 'gi');
                
                if (titleElement.textContent.toLowerCase().includes(term)) {
                    titleElement.innerHTML = titleElement.textContent.replace(regex, '<mark class="bg-electric-blue/30 text-electric-blue">$1</mark>');
                }
            }
        });
    }

    // Sort functionality (optional enhancement)
    function sortProjects(sortBy) {
        const projectsArray = Array.from(projectCards);
        
        projectsArray.sort((a, b) => {
            switch(sortBy) {
                case 'title':
                    return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'));
                case 'status':
                    return a.getAttribute('data-status').localeCompare(b.getAttribute('data-status'));
                default:
                    return 0;
            }
        });

        // Re-append sorted elements
        projectsArray.forEach(card => {
            projectsGrid.appendChild(card);
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });

    // URL state management (optional)
    function updateURLState() {
        const params = new URLSearchParams();
        if (currentSearch) params.set('search', currentSearch);
        if (currentFilter !== 'all') params.set('filter', currentFilter);
        
        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);
    }

    function loadURLState() {
        const params = new URLSearchParams(window.location.search);
        const search = params.get('search');
        const filter = params.get('filter');

        if (search) {
            searchInput.value = search;
            currentSearch = search;
        }

        if (filter && filter !== 'all') {
            const filterButton = document.querySelector(`[data-filter="${filter}"]`);
            if (filterButton) {
                filterButton.click();
            }
        }

        filterProjects();
    }

    // Load state from URL on page load
    loadURLState();

    // Update URL when search or filter changes
    searchInput.addEventListener('input', updateURLState);
    filterButtons.forEach(button => {
        button.addEventListener('click', updateURLState);
    });
}

// Utility function to debounce search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}