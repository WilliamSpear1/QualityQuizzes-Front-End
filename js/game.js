/* Constants */
const question            = document.getElementById("question");
const choices             = Array.from(document.getElementsByClassName("choice-text"));
const CORRECT_BONUS       = 10;
const MAX_QUESTIONS       = 3;
const progressText        = document.getElementById("progressText");
const scoreText           = document.getElementById("score");
const progressBarFull     = document.getElementById("progressBarFull")
const loader              = document.getElementById("loader")
const game                = document.getElementById("game")

/* Variables */
let currentQuestion    = {};
let acceptingAnswers   = false;
let score              = 0;
let questionCounter    = 0;
let availableQuestions = [];

let questions = [];

fetch(
  "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple"
)
  .then((res) => {
    return res.json();
  })
  .then(loadedQuestions => {
    console.log(loadedQuestions.results);
    
    questions = loadedQuestions.results.map(loadedQuestion => {
      const formattedQuestion = {
        question: loadedQuestion.question
      };

      const answerChoices = [...loadedQuestion.incorrect_answers];

      // Gives random index from 0 to 3.
      formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      
      answerChoices.splice(
        formattedQuestion.answer - 1, //ensures it 0 based index.
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice; // assigs answer to choice on the page.
      });

      return formattedQuestion;
    });

    startGame();
  })
  .catch((err) => {
    console.error(err);
  });

/* Functions */
startGame = () => {
  questionCounter = 0;
  score           = 0;

  availableQuestions = [...questions]; // Used spread operator to get full copy of questions array.
  getNewQuestion();
  game.classList.remove("hidden");
  loader.classList.add("hidden");
};

getNewQuestion = () => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    // go to page with user score. 
    return window.location.assign("../html/userScore.html");
  }

  questionCounter++;
  progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;

  progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion     = availableQuestions[questionIndex];
  question.innerText  = currentQuestion.question;

  choices.forEach((choice) => {
    const number     = choice.dataset["number"];
    choice.innerText = currentQuestion["choice" + number];
  });

  availableQuestions.splice(questionIndex, 1);

  acceptingAnswers = true;
};

choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers     = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if (classToApply == "correct") incrementScore(CORRECT_BONUS);

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});

incrementScore = (num) => {
  score               += num;
  scoreText.innerText = score;
};
