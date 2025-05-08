let questionsData = [];
let correctAnswers = {};
let currentPage = 1;
const questionsPerPage = 100;

const userAnswers = {};           // сохраняем выбранные ответы
const answeredCorrectly = {};     // отслеживаем правильные ответы

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const questionsResponse = await fetch('questions.json');
        questionsData = await questionsResponse.json();

        const answersResponse = await fetch('answers.json');
        correctAnswers = await answersResponse.json();

        updatePage(currentPage);
        setupNavigation();
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
    }
});

function setupNavigation() {
    const navBars = document.querySelectorAll('.navigation');

    // Верхняя панель
    const topPrevBtn = navBars[0].querySelector('.prev-btn');
    const topNextBtn = navBars[0].querySelector('.next-btn');

    topPrevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePage(currentPage);
        }
    });

    topNextBtn.addEventListener('click', () => {
        if (currentPage < getTotalPages()) {
            currentPage++;
            updatePage(currentPage);
        }
    });

    // Нижняя панель с прокруткой вверх
    const bottomPrevBtn = navBars[1].querySelector('.prev-btn');
    const bottomNextBtn = navBars[1].querySelector('.next-btn');

    bottomPrevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePage(currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    bottomNextBtn.addEventListener('click', () => {
        if (currentPage < getTotalPages()) {
            currentPage++;
            updatePage(currentPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

function getTotalPages() {
    return Math.ceil(questionsData.length / questionsPerPage);
}

function updatePage(pageNumber) {
    const start = (pageNumber - 1) * questionsPerPage;
    const end = start + questionsPerPage;
    const pageQuestions = questionsData.slice(start, end);

    renderQuestions(pageQuestions, correctAnswers);

    document.getElementById('page-number').textContent = pageNumber;

    // Обновляем состояние всех кнопок
    document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.disabled = pageNumber === 1;
    });
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.disabled = pageNumber === getTotalPages();
    });

    updateProgress();
}

function renderQuestions(questions, answers) {
    const container = document.getElementById('test-container');
    container.innerHTML = '';

    questions.forEach(q => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.innerHTML = `<h3>${q.id}. ${q.question}</h3>`;

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'options';

        q.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';

            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = `question-${q.id}`;
            radio.value = i;
            radio.id = `question-${q.id}-option-${i}`;

            const label = document.createElement('label');
            label.htmlFor = `question-${q.id}-option-${i}`;
            label.textContent = option;

            radio.addEventListener('change', function () {
                userAnswers[q.id] = i;
                showAnswerFeedback(q.id, i, optionDiv, answers[q.id]);
                updateProgress();
            });

            // Восстанавливаем выбранный ответ (если есть)
            if (userAnswers[q.id] === i) {
                radio.checked = true;
                setTimeout(() => {
                    showAnswerFeedback(q.id, i, optionDiv, answers[q.id]);
                }, 0);
            }

            optionDiv.appendChild(radio);
            optionDiv.appendChild(label);
            optionsDiv.appendChild(optionDiv);
        });

        questionDiv.appendChild(optionsDiv);
        container.appendChild(questionDiv);
    });
}

function showAnswerFeedback(questionId, selectedIndex, selectedOptionDiv, correctIndex) {
    const options = selectedOptionDiv.parentElement.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('correct', 'incorrect');
    });

    if (selectedIndex === correctIndex) {
        selectedOptionDiv.classList.add('correct');
        answeredCorrectly[questionId] = true;
    } else {
        selectedOptionDiv.classList.add('incorrect');
        if (options[correctIndex]) {
            options[correctIndex].classList.add('correct');
        }
        answeredCorrectly[questionId] = false;
    }
}

function updateProgress() {
    const correctCount = Object.values(answeredCorrectly).filter(val => val === true).length;
    const totalCount = questionsData.length;

    document.getElementById('correct-count').textContent = correctCount;
    document.getElementById('total-count').textContent = totalCount;
}

document.getElementById('scroll-top-btn').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});
