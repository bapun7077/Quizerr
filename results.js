// =========================================
// Results Page — Display score, breakdown, save session to localStorage
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    const quizResults = JSON.parse(sessionStorage.getItem('quizResults'));

    if (!quizResults) {
        window.location.href = 'newquiz.html';
        return;
    }

    const { score, totalQuestions, questions } = quizResults;
    const skippedCount = questions.filter(q => q.selected_answer === null).length;
    const correctCount = score;
    const actualWrong = totalQuestions - score - skippedCount;
    const percentage = Math.round((score / totalQuestions) * 100);

    // ---- Dynamic Title based on performance ----
    const titleEl = document.getElementById('results-title');
    const subtitleEl = document.getElementById('results-subtitle');

    if (percentage >= 80) {
        titleEl.textContent = '🎉 Excellent!';
        subtitleEl.textContent = 'You absolutely crushed it!';
    } else if (percentage >= 60) {
        titleEl.textContent = '👏 Well Done!';
        subtitleEl.textContent = 'Great effort, keep it up!';
    } else if (percentage >= 40) {
        titleEl.textContent = '💪 Not Bad!';
        subtitleEl.textContent = 'Room for improvement, try again!';
    } else {
        titleEl.textContent = '📚 Keep Learning!';
        subtitleEl.textContent = 'Practice makes perfect!';
    }

    // ---- Animated Score Ring ----
    const scoreRing = document.getElementById('score-ring');
    const circumference = 2 * Math.PI * 80; // r=80 from SVG
    const targetOffset = circumference - (percentage / 100) * circumference;

    // Color based on score
    let ringColor = '#00ff88';
    if (percentage < 40) ringColor = '#ff4c68';
    else if (percentage < 70) ringColor = '#ff9800';

    scoreRing.style.stroke = ringColor;
    // Trigger animation after a short delay for visual effect
    setTimeout(() => {
        scoreRing.style.strokeDashoffset = targetOffset;
    }, 300);

    // ---- Populate stat cards ----
    document.getElementById('score-value').textContent = `${score}/${totalQuestions}`;
    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('wrong-count').textContent = actualWrong;
    document.getElementById('skipped-count').textContent = skippedCount;

    // ---- Build wrong answer breakdown ----
    const wrongQuestions = questions.filter(q => !q.is_correct);
    const breakdownSection = document.getElementById('breakdown-section');
    const breakdownList = document.getElementById('breakdown-list');

    if (wrongQuestions.length === 0) {
        breakdownSection.innerHTML = `
            <div class="breakdown-title" style="color:#00ff88;">
                <i class="bi bi-trophy-fill"></i> Perfect Score! No incorrect answers.
            </div>`;
    } else {
        breakdownList.innerHTML = wrongQuestions.map((q, i) => `
            <div class="breakdown-item">
                <div class="breakdown-question">${i + 1}. ${q.question}</div>
                <div class="breakdown-answers">
                    ${q.selected_answer
                        ? `<div class="breakdown-answer your-answer">
                               <span class="breakdown-answer-label">Your Answer</span>
                               <span>${q.selected_answer}</span>
                           </div>`
                        : `<div class="breakdown-answer your-answer">
                               <span class="breakdown-answer-label">Your Answer</span>
                               <span>— Skipped —</span>
                           </div>`
                    }
                    <div class="breakdown-answer correct-answer">
                        <span class="breakdown-answer-label">Correct</span>
                        <span>${q.correct_answer}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ---- Save button → localStorage ----
    document.getElementById('save-btn').addEventListener('click', () => {
        const session = {
            id: `session_${Date.now()}`,
            date: new Date().toISOString(),
            category: quizResults.category,
            categoryId: quizResults.categoryId,
            difficulty: quizResults.difficulty,
            totalQuestions: quizResults.totalQuestions,
            score: quizResults.score,
            correctCount: quizResults.score,
            wrongCount: quizResults.totalQuestions - quizResults.score,
            timePerQuestion: quizResults.timePerQuestion,
            questions: quizResults.questions
        };

        // Append to existing sessions array
        const sessions = JSON.parse(localStorage.getItem('quizerr_sessions')) || [];
        sessions.push(session);
        localStorage.setItem('quizerr_sessions', JSON.stringify(sessions));

        // Cleanup sessionStorage
        sessionStorage.removeItem('quizResults');
        sessionStorage.removeItem('quizData');

        // Navigate to dashboard
        window.location.href = 'dashboard.html';
    });
});
