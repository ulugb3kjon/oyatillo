let questions = [];
let quizData = null;
let timerInterval;

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        questions = parseQuestions(event.target.result);
        updateQuestionsList();
        document.getElementById('fileStatus').innerHTML = 
            `<div style="color:green; margin-top:10px;">✅ ${questions.length} ta savol yuklandi!</div>`;
    };

    reader.readAsText(file, 'UTF-8');
});

function parseQuestions(content) {
    return content.split(/\+{4}/).map(block => {
        const lines = block.split(/(?:\r?\n|====)+/)
            .map(l => l.trim())
            .filter(l => l);

        if(lines.length < 2) return null;

        const question = lines[0];
        let correct = '';
        const options = [];

        for(let i = 1; i < lines.length; i++) {
            if(lines[i].startsWith('#')) {
                correct = lines[i].substring(1).trim();
                options.push(correct);
            } else {
                options.push(lines[i]);
            }
        }

        while(options.length < 4) options.push("...");

        return {
            question,
            options: options.slice(0, 4),
            correct
        };
    }).filter(q => q && q.correct);
}

function updateQuestionsList() {
    const menu = document.getElementById('questionMenu');
    menu.innerHTML = '';
    
    questions.forEach((_, i) => {
        const div = document.createElement('div');
        div.className = 'question-number';
        div.textContent = i + 1;
        menu.appendChild(div);
    });
}

function startQuiz() {
    const total = Math.min(
        parseInt(document.getElementById('questionCount').value),
        questions.length
    );
    const time = parseInt(document.getElementById('timerSelect').value);

    if(!total || total < 1) {
        alert("Savollar sonini kiriting!");
        return;
    }

    const shuffledQuestions = shuffle(questions).slice(0, total);

    quizData = {
        questions: shuffledQuestions,
        currentIndex: 0,
        correct: 0,
        timeLeft: time * 60
    };

    startTimer(quizData.timeLeft);
    showQuestion(0);
}

function showQuestion(index) {
    quizData.currentIndex = index;
    const q = quizData.questions[index];

    document.getElementById('questionText').textContent = `${index + 1}. ${q.question}`;
    document.getElementById('counter').textContent = `${index + 1}/${quizData.questions.length}`;

    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    shuffle(q.options).forEach(option => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = option;
        div.onclick = (e) => selectAnswer(option, index, e.target);
        optionsContainer.appendChild(div);
    });
}

function selectAnswer(selected, index, target) {
    target.classList.add('clicked');
    setTimeout(() => target.classList.remove('clicked'), 300);

    const q = quizData.questions[index];
    const isCorrect = (selected === q.correct);

    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        if(opt.textContent === q.correct) {
            opt.classList.add('correct');
        } else if(opt.textContent === selected && !isCorrect) {
            opt.classList.add('wrong');
        }
    });

    if(isCorrect) quizData.correct++;

    setTimeout(() => {
        if(index < quizData.questions.length - 1) {
            showQuestion(index + 1);
        } else {
            endQuiz();
        }
    }, 2000);
}

function startTimer(seconds) {
    let time = seconds;

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        document.getElementById('timer').textContent = 
            `${mins}:${secs.toString().padStart(2, '0')}`;

        if(time <= 0) {
            clearInterval(timerInterval);
            endQuiz();
            return;
        }
        time--;
    }, 1000);
}

function endQuiz() {
    clearInterval(timerInterval);
    alert(`Test yakunlandi!\nTo'g'ri javoblar: ${quizData.correct}/${quizData.questions.length}`);
}

function shuffle(array) {
    for(let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
