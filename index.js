document.addEventListener('DOMContentLoaded', () => {
  const difficultyButtons = document.querySelectorAll('.button-group button');
  const categorySelect = document.querySelector('.dropdown');
  const startButton = document.querySelector('.start-btn');
  let selectedDifficulty = 'Hard';

  // Handle difficulty button clicks
  difficultyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // 1. Reset all buttons to the default secondary state
      difficultyButtons.forEach(btn => {
        btn.classList.remove('btn-primary-outline');
        btn.classList.add('btn-secondary');
      });

      // 2. Set the clicked button to the active primary state
      const clickedBtn = e.target;
      clickedBtn.classList.remove('btn-secondary');
      clickedBtn.classList.add('btn-primary-outline');

      // 3. Update the selected difficulty value
      selectedDifficulty = clickedBtn.textContent;
    });
  });

  // Handle 'Start Quiz' button click
  startButton.addEventListener('click', () => {
    // Gather all the configuration details
    const quizConfig = {
      category: categorySelect.value,
      difficulty: selectedDifficulty,
      // Grabbing the hardcoded values from the UI summary text
      questions: document.querySelectorAll('.summary-item .value')[0].textContent,
      timePerQuestion: document.querySelectorAll('.summary-item .value')[1].textContent,
      type: document.querySelectorAll('.summary-item .value')[2].textContent
    };

    // Output the configuration to the console (you would replace this with your actual app logic)
    console.log('Quiz Configuration:', quizConfig);
    
    // Simple visual feedback for the user
    alert(`Ready to start!\n\nCategory: ${quizConfig.category}\nDifficulty: ${quizConfig.difficulty}`);
  });
});
