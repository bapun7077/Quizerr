// =========================================
// Quiz Engine — Renders questions, manages timer, tracks scoring
// =========================================

document.addEventListener('DOMContentLoaded', () => {
    // Retrieve quiz data from sessionStorage (set by index.js on setup page)
    const quizData = JSON.parse(sessionStorage.getItem('quizData'));

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        window.location.href = 'newquiz.html';
        return;
    }

    const questions = quizData.questions;
    const totalQuestions = questions.length;
    const timePerQuestion = 20;
    const circumference = 2 * Math.PI * 26; // r=26 from SVG circle

    let currentIndex = 0;
    let score = 0;
    let selectedAnswer = null;
    let answered = false;
    let timer = null;
    let timeLeft = timePerQuestion;
    let results = [];

    // DOM references
    const categoryBadge = document.getElementById('quiz-category');
    const difficultyBadge = document.getElementById('quiz-difficulty');
    const timerProgress = document.getElementById('timer-progress');
    const timerValueEl = document.getElementById('timer-value');
    const currentQ = document.getElementById('current-q');
    const totalQ = document.getElementById('total-q');
    const progressFill = document.getElementById('progress-fill');
    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const answersGrid = document.getElementById('answers-grid');
    const nextBtn = document.getElementById('next-btn');

    // Display quiz metadata
    categoryBadge.textContent = quizData.category || 'Any Category';
    const diff = quizData.difficulty || 'any';
    difficultyBadge.textContent = diff.charAt(0).toUpperCase() + diff.slice(1);
    totalQ.textContent = totalQuestions;

    // ---- Utility Functions ----

    /** Fisher-Yates shuffle */
    function shuffleArray(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /** Decode HTML entities returned by the API */
    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    // ---- Timer Logic ----

    function startTimer() {
        timeLeft = timePerQuestion;
        timerValueEl.textContent = timeLeft;
        timerProgress.style.strokeDashoffset = '0';
        timerProgress.classList.remove('warning', 'danger');

        timer = setInterval(() => {
            timeLeft--;
            timerValueEl.textContent = timeLeft;

            // Update circular progress offset
            const offset = ((timePerQuestion - timeLeft) / timePerQuestion) * circumference;
            timerProgress.style.strokeDashoffset = offset;

            // Color coding for urgency
            if (timeLeft <= 5) {
                timerProgress.classList.add('danger');
                timerProgress.classList.remove('warning');
            } else if (timeLeft <= 10) {
                timerProgress.classList.add('warning');
            }

            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimeout();
            }
        }, 1000);
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    // ---- Answer Handling ----

    /** Called when timer runs out with no selection */
    function handleTimeout() {
        answered = true;
        const q = questions[currentIndex];
        const correctAnswer = decodeHTML(q.correct_answer);

        results.push({
            question: decodeHTML(q.question),
            correct_answer: correctAnswer,
            selected_answer: null,
            all_answers: q.shuffledAnswers,
            is_correct: false
        });

        // Reveal the correct answer
        const options = answersGrid.querySelectorAll('.answer-option');
        options.forEach(opt => {
            opt.classList.add('disabled');
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            }
        });

        activateNextBtn();
    }

    /** Called when user clicks an answer */
    function selectAnswer(option, answer) {
        if (answered) return;
        answered = true;
        stopTimer();

        selectedAnswer = answer;
        const q = questions[currentIndex];
        const correctAnswer = decodeHTML(q.correct_answer);
        const isCorrect = answer === correctAnswer;

        if (isCorrect) score++;

        results.push({
            question: decodeHTML(q.question),
            correct_answer: correctAnswer,
            selected_answer: answer,
            all_answers: q.shuffledAnswers,
            is_correct: isCorrect
        });

        // Visual feedback on all options
        const options = answersGrid.querySelectorAll('.answer-option');
        options.forEach(opt => {
            opt.classList.add('disabled');
            if (opt.dataset.answer === correctAnswer) {
                opt.classList.add('correct');
            }
            if (opt.dataset.answer === answer && !isCorrect) {
                opt.classList.add('wrong');
            }
        });

        activateNextBtn();
    }

    function activateNextBtn() {
        nextBtn.classList.add('active');
        if (currentIndex === totalQuestions - 1) {
            nextBtn.innerHTML = 'View Results <i class="bi bi-trophy-fill"></i>';
        }
    }

    // ---- Rendering ----

    function renderQuestion() {
        const q = questions[currentIndex];
        answered = false;
        selectedAnswer = null;

        // Update progress indicators
        currentQ.textContent = currentIndex + 1;
        progressFill.style.width = `${((currentIndex + 1) / totalQuestions) * 100}%`;
        questionNumber.textContent = `Question ${currentIndex + 1}`;
        questionText.textContent = decodeHTML(q.question);

        // Shuffle answer options
        const allAnswers = shuffleArray([
            ...q.incorrect_answers.map(a => decodeHTML(a)),
            decodeHTML(q.correct_answer)
        ]);
        q.shuffledAnswers = allAnswers;

        // Build answer option cards
        const labels = ['A', 'B', 'C', 'D'];
        answersGrid.innerHTML = allAnswers.map((answer, i) => `
            <div class="answer-option" data-answer="${answer.replace(/"/g, '&quot;')}" id="answer-${i}">
                <span class="answer-label">${labels[i]}</span>
                <span class="answer-text">${answer}</span>
            </div>
        `).join('');

        // Attach click handlers
        answersGrid.querySelectorAll('.answer-option').forEach(opt => {
            opt.addEventListener('click', () => selectAnswer(opt, opt.dataset.answer));
        });

        // Reset next button & start countdown
        nextBtn.classList.remove('active');
        nextBtn.innerHTML = 'Next Question <i class="bi bi-arrow-right"></i>';
        startTimer();

        // Re-trigger entrance animation
        const card = document.getElementById('question-card');
        card.style.animation = 'none';
        card.offsetHeight; // force reflow
        card.style.animation = 'popup 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
    }

    // ---- Navigation ----

    nextBtn.addEventListener('click', () => {
        if (!nextBtn.classList.contains('active')) return;

        currentIndex++;
        if (currentIndex >= totalQuestions) {
            // Quiz finished — save results and navigate
            const quizResults = {
                category: quizData.category,
                categoryId: quizData.categoryId,
                difficulty: quizData.difficulty,
                totalQuestions: totalQuestions,
                score: score,
                correctCount: score,
                wrongCount: totalQuestions - score,
                timePerQuestion: timePerQuestion,
                questions: results
            };
            sessionStorage.setItem('quizResults', JSON.stringify(quizResults));
            window.location.href = 'results.html';
        } else {
            renderQuestion();
        }
    });

    // ---- Kick off ----
    renderQuestion();
});
