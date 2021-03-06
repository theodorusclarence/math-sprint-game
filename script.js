// Pages
const gamePage = document.getElementById("game-page");
const scorePage = document.getElementById("score-page");
const splashPage = document.getElementById("splash-page");
const countdownPage = document.getElementById("countdown-page");
// Splash Page
const startForm = document.getElementById("start-form");
const radioContainers = document.querySelectorAll(".radio-container");
const radioInputs = document.querySelectorAll("input");
const bestScores = document.querySelectorAll(".best-score-value");
// Countdown Page
const countdown = document.querySelector(".countdown");
// Game Page
const itemContainer = document.querySelector(".item-container");
// Score Page
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtn = document.querySelector(".play-again");

// Equations
let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoreArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

// Scroll
let valueY = 0;

// Refresh Splash Page best scores
function bestScoresToDOM() {
    bestScores.forEach((bestScore, index) => {
        const bestScoreEl = bestScore;
        bestScoreEl.textContent = `${bestScoreArray[index].bestScore}s`;
    });
}

// Check local storage for bestscores, and set it
function getSavedBestScores() {
    if (localStorage.getItem("bestScores")) {
        bestScoreArray = JSON.parse(localStorage.getItem("bestScores"));
    } else {
        bestScoreArray = [
            { questions: 10, bestScore: finalTimeDisplay },
            { questions: 25, bestScore: finalTimeDisplay },
            { questions: 50, bestScore: finalTimeDisplay },
            { questions: 99, bestScore: finalTimeDisplay },
        ];
        localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
    }
    bestScoresToDOM();
}

// Update best score array
function updateBestScore() {
    bestScoreArray.forEach((score, index) => {
        // select correct best score to update
        if (questionAmount == score.questions) {
            // Return best score as number with one decmmal
            const savedBestScores = Number(bestScoreArray[index].bestScore);
            // Update if the new final score is less or replacing zero
            if (savedBestScores === 0 || savedBestScores > finalTime) {
                bestScoreArray[index].bestScore = finalTimeDisplay;
            }
        }
    });
    // Update splash page
    bestScoresToDOM();
    // Save to local storage
    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
}

// Reset Game
function playAgain() {
    gamePage.addEventListener("click", startTimer);
    scorePage.hidden = true;
    splashPage.hidden = false;
    equationsArray = [];
    playerGuessArray = [];
    valueY = 0;
    playAgainBtn.hidden = true;
}

// Show score page
function showScorePage() {
    // Show play again button after 1 s
    setTimeout(() => {
        playAgainBtn.hidden = false;
    }, 1000);
    gamePage.hidden = true;
    scorePage.hidden = false;
}

// Format & Display Time in DOM
function scoresToDOM() {
    finalTimeDisplay = finalTime.toFixed(1);
    baseTime = timePlayed.toFixed(1);
    penaltyTime = penaltyTime.toFixed(1);

    baseTimeEl.textContent = `Base Time: ${baseTime}s`;
    penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
    finalTimeEl.textContent = `${finalTimeDisplay}s`;
    updateBestScore();
    // Scroll to top, go to score page
    itemContainer.scrollTo({ top: 0, behavior: "instant" });
    showScorePage();
}

// Stop timer, process results, go to score page
function checkTime() {
    console.log(timePlayed);
    if (playerGuessArray.length == questionAmount) {
        console.log("player guess", playerGuessArray);
        clearInterval(timer);

        // Check for wrong guesses, add penalty time
        equationsArray.forEach((equation, i) => {
            if (equation.evaluated === playerGuessArray[i]) {
                // Correct Guess, no penalty
            } else {
                // Incorrect guess, add penalty
                penaltyTime += 2;
            }
        });

        finalTime = timePlayed + penaltyTime;
        console.log("time", timePlayed, "penalty", penaltyTime, "final", finalTime);
        scoresToDOM();
    }
}

// Add a tenth of a second to timePlayed
function addTime() {
    timePlayed += 0.1;
    checkTime();
}

// Start timer when game page is clicked
function startTimer() {
    // Reset times
    timePlayed = 0;
    penaltyTime = 0;
    finalTime = 0;

    timer = setInterval(addTime, 100);
    gamePage.removeEventListener("click", startTimer);
}

// Scrooll, Store user selection in playerGuessArray
function select(guessedTrue) {
    // Scroll 80 pixels
    valueY += 80;
    itemContainer.scroll(0, valueY);
    return guessedTrue ? playerGuessArray.push("true") : playerGuessArray.push("false");
}

// Displays Game Page
function showGamePage() {
    gamePage.hidden = false;
    countdownPage.hidden = true;
}

// Create random number up to max
function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}

// Create Correct/Incorrect Random Equations
function createEquations() {
    // Randomly choose how many correct equations there should be
    const correctEquations = getRandomInt(questionAmount);
    // Set amount of wrong equations
    const wrongEquations = questionAmount - correctEquations;
    // Loop through, multiply random numbers up to 9, push to array
    for (let i = 0; i < correctEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);
        const equationValue = firstNumber * secondNumber;
        const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
        equationObject = { value: equation, evaluated: "true" };
        equationsArray.push(equationObject);
    }
    // Loop through, mess with the equation results, push to array
    for (let i = 0; i < wrongEquations; i++) {
        firstNumber = getRandomInt(9);
        secondNumber = getRandomInt(9);
        const equationValue = firstNumber * secondNumber;
        wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
        wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
        wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
        const formatChoice = getRandomInt(3) - 1;
        const equation = wrongFormat[formatChoice];
        equationObject = { value: equation, evaluated: "false" };
        equationsArray.push(equationObject);
    }
    shuffle(equationsArray);
    console.log(equationsArray);
}

// Add Equations to DOM
function equationsToDOM() {
    equationsArray.forEach((equation) => {
        // Item
        const item = document.createElement("div");
        item.classList.add("item");
        // Equation text
        const equationText = document.createElement("h1");
        equationText.textContent = equation.value;
        // Append
        item.appendChild(equationText);
        itemContainer.appendChild(item);
    });
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
    // Reset DOM, Set Blank Space Above
    itemContainer.textContent = "";
    // Spacer
    const topSpacer = document.createElement("div");
    topSpacer.classList.add("height-240");
    // Selected Item
    const selectedItem = document.createElement("div");
    selectedItem.classList.add("selected-item");
    // Append
    itemContainer.append(topSpacer, selectedItem);

    // Create Equations, Build Elements in DOM
    createEquations();
    equationsToDOM();
    // Set Blank Space Belowc
    const bottomSpacer = document.createElement("div");
    bottomSpacer.classList.add("height-500");
    itemContainer.appendChild(bottomSpacer);
}

// Displays 3,2,1 go
function countdownStart() {
    let current = 3;
    countdown.textContent = current;

    const counting = setInterval(() => {
        current--;
        countdown.textContent = current;

        if (current === 0) {
            countdown.textContent = "GO!";
            clearInterval(counting);
        }
    }, 1000);
}

// Navigate from splash page to countdown page
function showCountdown() {
    countdownPage.hidden = false;
    splashPage.hidden = true;
    countdownStart();
    populateGamePage();
    setTimeout(showGamePage, 4000);
}

// Get the value from selected radio button
function getRadioValue() {
    let radioValue;
    radioInputs.forEach((radioInput) => {
        if (radioInput.checked) {
            radioValue = radioInput.value;
        }
    });
    return radioValue;
}

// Form that decides amount of questions
function selectQuestionAmount(e) {
    e.preventDefault();
    questionAmount = getRadioValue();
    if (questionAmount) {
        showCountdown();
    }
}

startForm.addEventListener("click", () => {
    radioContainers.forEach((radioEl) => {
        //Remove Selected label styling
        radioEl.classList.remove("selected-label");
        // Add it back if radio input is checked
        if (radioEl.children[1].checked) {
            radioEl.classList.add("selected-label");
        }
    });
});

// Event Listeners
startForm.addEventListener("submit", selectQuestionAmount);
gamePage.addEventListener("click", startTimer);

// On load
getSavedBestScores();
