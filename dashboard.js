// =========================================
// Dashboard — Read localStorage, compute stats, render analytics
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const dashboardMain = document.getElementById('dashboard-main');
    const sessions = JSON.parse(localStorage.getItem('quizerr_sessions')) || [];

    if (sessions.length === 0) {
        renderEmptyState();
        return;
    }

    renderDashboard(sessions);
});

// ---- Empty State ----
function renderEmptyState() {
    const main = document.getElementById('dashboard-main');
    main.innerHTML = `
        <div class="dashboard-header">
            <div>
                <h1>Progress Dashboard</h1>
                <p>Track your quiz performance over time</p>
            </div>
        </div>
        <div class="empty-state">
            <div class="empty-state-icon">📊</div>
            <h2>No Quiz Data Yet</h2>
            <p>Complete your first quiz to see your stats and progress here.</p>
            <a href="newquiz.html" class="text-decoration-none">
                <button class="start-btn" style="max-width:300px;margin:0 auto;">
                    <i class="bi bi-caret-right-fill"></i> Take a Quiz
                </button>
            </a>
        </div>
    `;
}

// ---- Full Dashboard ----
function renderDashboard(sessions) {
    const main = document.getElementById('dashboard-main');

    // Compute stats
    const totalQuizzes = sessions.length;
    const totalCorrect = sessions.reduce((s, x) => s + x.correctCount, 0);
    const totalQuestions = sessions.reduce((s, x) => s + x.totalQuestions, 0);
    const avgScore = Math.round((totalCorrect / totalQuestions) * 100);
    const bestScore = Math.max(...sessions.map(s => Math.round((s.score / s.totalQuestions) * 100)));

    // Category analysis
    const categoryMap = {};
    sessions.forEach(s => {
        const cat = s.category || 'Unknown';
        if (!categoryMap[cat]) categoryMap[cat] = { correct: 0, total: 0, count: 0 };
        categoryMap[cat].correct += s.correctCount;
        categoryMap[cat].total += s.totalQuestions;
        categoryMap[cat].count++;
    });

    let strongest = { name: '—', avg: 0 };
    let weakest = { name: '—', avg: 100 };
    for (const [cat, data] of Object.entries(categoryMap)) {
        const avg = Math.round((data.correct / data.total) * 100);
        if (avg >= strongest.avg) { strongest = { name: cat, avg, count: data.count }; }
        if (avg <= weakest.avg) { weakest = { name: cat, avg, count: data.count }; }
    }

    // If only one category, weakest is the same as strongest
    if (Object.keys(categoryMap).length === 1) {
        weakest = { ...strongest };
    }

    // Build HTML
    main.innerHTML = `
        <div class="dashboard-header">
            <div>
                <h1>Progress Dashboard</h1>
                <p>Track your quiz performance over time</p>
            </div>
            <button class="clear-btn" id="clear-history-btn">
                <i class="bi bi-trash3"></i> Clear History
            </button>
        </div>

        <!-- Overview Stats -->
        <div class="dashboard-stats">
            <div class="dash-stat-card">
                <div class="dash-stat-icon purple"><i class="bi bi-controller"></i></div>
                <div class="dash-stat-value">${totalQuizzes}</div>
                <div class="dash-stat-label">Quizzes Taken</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon cyan"><i class="bi bi-bullseye"></i></div>
                <div class="dash-stat-value">${avgScore}%</div>
                <div class="dash-stat-label">Average Score</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon green"><i class="bi bi-trophy-fill"></i></div>
                <div class="dash-stat-value">${bestScore}%</div>
                <div class="dash-stat-label">Best Score</div>
            </div>
            <div class="dash-stat-card">
                <div class="dash-stat-icon pink"><i class="bi bi-check2-all"></i></div>
                <div class="dash-stat-value">${totalCorrect}/${totalQuestions}</div>
                <div class="dash-stat-label">Total Correct</div>
            </div>
        </div>

        <!-- Category Analysis -->
        <div class="category-analysis">
            <div class="category-card strongest">
                <div class="category-card-title">💪 Strongest Category</div>
                <div class="category-card-value">${strongest.name}</div>
                <div class="category-card-score">Average: ${strongest.avg}% · ${strongest.count || 0} quiz${(strongest.count || 0) !== 1 ? 'zes' : ''}</div>
            </div>
            <div class="category-card weakest">
                <div class="category-card-title">📖 Needs Improvement</div>
                <div class="category-card-value">${weakest.name}</div>
                <div class="category-card-score">Average: ${weakest.avg}% · ${weakest.count || 0} quiz${(weakest.count || 0) !== 1 ? 'zes' : ''}</div>
            </div>
        </div>

        <!-- Score Trend Bars -->
        <div class="section-title"><i class="bi bi-graph-up"></i> Score Trend</div>
        <div class="chart-container">
            <div class="bar-chart" id="bar-chart">
                ${renderBars(sessions)}
            </div>
        </div>

        <!-- Session History -->
        <div class="sessions-section">
            <div class="section-title"><i class="bi bi-clock-history"></i> Session History</div>
            <div class="sessions-table-wrapper">
                <table class="sessions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Category</th>
                            <th>Difficulty</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sessions.slice().reverse().map(s => {
                            const pct = Math.round((s.score / s.totalQuestions) * 100);
                            const badgeClass = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';
                            const date = new Date(s.date);
                            const dateStr = date.toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            });
                            return `
                                <tr>
                                    <td>${dateStr}</td>
                                    <td>${s.category || 'Any'}</td>
                                    <td><span class="difficulty-badge">${s.difficulty || 'any'}</span></td>
                                    <td><span class="score-badge ${badgeClass}">${s.score}/${s.totalQuestions} (${pct}%)</span></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Animate bars after render
    setTimeout(() => {
        document.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.height = bar.dataset.height;
        });
    }, 100);

    // Clear history handler
    document.getElementById('clear-history-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all quiz history? This cannot be undone.')) {
            localStorage.removeItem('quizerr_sessions');
            location.reload();
        }
    });
}

// ---- CSS-Only Bar Chart Builder ----
function renderBars(sessions) {
    // Show last 10 sessions
    const recent = sessions.slice(-10);
    return recent.map((s, i) => {
        const pct = Math.round((s.score / s.totalQuestions) * 100);
        const heightPct = Math.max(pct, 5); // Minimum visible height
        const colorClass = pct >= 70 ? 'high' : pct >= 40 ? 'medium' : 'low';
        const label = (s.category || 'Any').split(':').pop().trim().substring(0, 8);
        return `
            <div class="bar-item">
                <div class="bar-score">${pct}%</div>
                <div class="bar-fill ${colorClass}" data-height="${heightPct}%" style="height: 0%;"></div>
                <div class="bar-label" title="${s.category || 'Any'}">#${i + 1}</div>
            </div>
        `;
    }).join('');
}
