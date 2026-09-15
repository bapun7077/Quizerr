// =========================================
// Quizerr — Shared logic for Home + Setup pages
// =========================================

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // HOME PAGE: Lifetime Stats
    // ============================
    const lifetimeStatsSection = document.getElementById('lifetime-stats');
    if (lifetimeStatsSection) {
        renderLifetimeStats(lifetimeStatsSection);
    }

    // ============================
    // SETUP PAGE: Category + Difficulty + Fetch
    // ============================
    const difficultyButtons = document.querySelectorAll('.button-group button');
    const categorySelect = document.getElementById('category-select');
    const startButton = document.querySelector('.start-btn');
    let selectedDifficulty = ''; // empty = any

    // Handle difficulty button toggle
    if (difficultyButtons.length > 0) {
        difficultyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Reset all to secondary
                difficultyButtons.forEach(btn => {
                    btn.classList.remove('btn-primary-outline');
                    btn.classList.add('btn-secondary');
                });

                // Activate clicked button
                const clickedBtn = e.target;
                clickedBtn.classList.remove('btn-secondary');
                clickedBtn.classList.add('btn-primary-outline');

                // Store the API difficulty value
                selectedDifficulty = clickedBtn.dataset.difficulty || '';
            });
        });
    }

    // Handle "Start Quiz" click — fetch from Open Trivia DB
    if (startButton) {
        startButton.addEventListener('click', async () => {
            const categoryId = categorySelect ? categorySelect.value : '';
            const categoryName = categorySelect
                ? categorySelect.options[categorySelect.selectedIndex].text
                : 'Any Category';

            // Build API URL
            let apiUrl = 'https://opentdb.com/api.php?amount=10&type=multiple';
            if (categoryId) apiUrl += `&category=${categoryId}`;
            if (selectedDifficulty) apiUrl += `&difficulty=${selectedDifficulty}`;

            // Show loading state
            startButton.disabled = true;
            const originalContent = startButton.innerHTML;
            startButton.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;"></span> Fetching Questions...';

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.response_code !== 0 || !data.results || data.results.length === 0) {
                    throw new Error('No questions available for this combination. Try different settings.');
                }

                // Store quiz config + questions in sessionStorage
                sessionStorage.setItem('quizData', JSON.stringify({
                    category: categoryName,
                    categoryId: categoryId,
                    difficulty: selectedDifficulty || 'any',
                    questions: data.results
                }));

                // Navigate to quiz page
                window.location.href = 'quizque.html';
            } catch (error) {
                alert(error.message || 'Failed to fetch questions. Please check your internet connection and try again.');
                startButton.disabled = false;
                startButton.innerHTML = originalContent;
            }
        });
    }
});

// ============================
// Lifetime Stats Renderer (Home Page)
// ============================
function renderLifetimeStats(container) {
    const sessions = JSON.parse(localStorage.getItem('quizerr_sessions')) || [];

    if (sessions.length === 0) {
        // First-time user CTA
        container.innerHTML = `
            <div class="first-quiz-cta">
                <div class="empty-state-icon">🎯</div>
                <h2>Start Your First Quiz</h2>
                <p>Challenge yourself with trivia questions and track your progress over time.</p>
                <a href="newquiz.html" class="text-decoration-none">
                    <button class="custom-btn px-4 py-3">Take a Quiz</button>
                </a>
            </div>
        `;
        return;
    }

    const totalQuizzes = sessions.length;
    const totalCorrect = sessions.reduce((s, x) => s + x.correctCount, 0);
    const totalQ = sessions.reduce((s, x) => s + x.totalQuestions, 0);
    const avgScore = Math.round((totalCorrect / totalQ) * 100);

    // Find best category
    const categoryMap = {};
    sessions.forEach(s => {
        const cat = s.category || 'Unknown';
        if (!categoryMap[cat]) categoryMap[cat] = { correct: 0, total: 0 };
        categoryMap[cat].correct += s.correctCount;
        categoryMap[cat].total += s.totalQuestions;
    });

    let bestCategory = '—';
    let bestAvg = 0;
    for (const [cat, data] of Object.entries(categoryMap)) {
        const avg = (data.correct / data.total) * 100;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestCategory = cat;
        }
    }

    container.innerHTML = `
        <h2 class="lifetime-stats-title"><i class="bi bi-lightning-charge-fill"></i> Your Stats</h2>
        <div class="lifetime-stats-grid">
            <div class="lifetime-stat-card">
                <div class="lifetime-stat-value">${totalQuizzes}</div>
                <div class="lifetime-stat-label">Quizzes Taken</div>
            </div>
            <div class="lifetime-stat-card">
                <div class="lifetime-stat-value">${avgScore}%</div>
                <div class="lifetime-stat-label">Average Score</div>
            </div>
            <div class="lifetime-stat-card">
                <div class="lifetime-stat-value">${bestCategory}</div>
                <div class="lifetime-stat-label">Best Category</div>
            </div>
        </div>
    `;
}
