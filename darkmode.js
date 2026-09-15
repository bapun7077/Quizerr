// =========================================
// Dark Mode Toggle — Shared across all pages
// =========================================

(function () {
    // Apply saved preference on page load (runs immediately)
    const savedMode = localStorage.getItem('quizerr_darkmode');
    if (savedMode === 'light') {
        document.body.classList.add('light-mode');
    }

    // Update toggle button icon based on current mode
    function updateToggleIcon() {
        const btn = document.querySelector('.mode-toggle');
        if (!btn) return;
        const isLight = document.body.classList.contains('light-mode');
        btn.innerHTML = isLight
            ? '<i class="bi bi-sun-fill"></i> Light'
            : '<i class="bi bi-moon-stars-fill"></i> Dark';
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateToggleIcon);
    } else {
        updateToggleIcon();
    }

    // Global toggle function
    window.toggleDarkMode = function () {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('quizerr_darkmode', isLight ? 'light' : 'dark');
        updateToggleIcon();
    };
})();
