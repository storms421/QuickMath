// Game Constants
const GAME_DURATION = 60;  // Total seconds per game round
const PENALTY_DURATION = 3;  // Penalty duration for wrong answer clicked
const TOTAL_ACHIEVEMENTS = 8;  // Used to check if every achievement has been unlocked

// Default leaderboard that is loaded first time game runs
const LEADERBOARD = [
  { name: "AAA", score: 40},
  { name: "BBB", score: 38},
  { name: "CCC", score: 36},
  { name: "DDD", score: 30},
  { name: "EEE", score: 28},
  { name: "FFF", score: 26},
  { name: "GGG", score: 24},
  { name: "HHH", score: 22},
  { name: "III", score: 20},
  { name: "JJJ", score: 15},
];

// Used as a list to check if achievement is unlocked or not
const ACHIEVEMENTS = {
  bronze: false,
  silver: false,
  gold: false,
  platinum: false,
  diamond: false,
  redFlame: false,
  blueFlame: false,
  purpleFlame: false,
  completelyWrong: false,
  allUnlockedAchievements: false
};

// Track states during a game
let score = 0;  // Current player score
let timeLeft = GAME_DURATION;  // Seconds left on clock
let timerInterval = null;  // Holds setInterval ID so it can be cancelled later
let currentStreak = 0;  // Counts consecutive correct answers
let currentAnswer = null;  // Holds current correct answer
let liveLeaderboard = [];  // Working leaderboard that is loaded from localStorage
let wrongAnswers = 0;  // Checks for platinum achievement (1 wrong answer, and it cannot be achieved)
let earnedAchievements = {};  // Current achievement unlock state
let currentProblem = "";  // Math expression shown on screen
// Snapshot of achievements taken at start of game to detect which ones were newly earned each round
let previousAchievements = {};

// DOM References - Main Screens
// Returns HTML element whose id matches the string
/* Storing them in variables means we only have to search the DOM once
instead of every time we need the element */
const mainMenu = document.getElementById("main-menu");
const game = document.getElementById("game");
const leaderboard = document.getElementById("leaderboard");
const results = document.getElementById("results");
const achievements = document.getElementById("achievements");


// DOM References - Buttons
const leaderboardBackButton = document.getElementById("back-to-main-menu-leaderboard");
const achievementBackButton = document.getElementById("back-to-main-menu-achievements");
const resultsMainMenuButton = document.getElementById("back-to-menu-results");
const resultsPlayAgain = document.getElementById("play-again");
const playGame = document.getElementById("start-game");
const toLeaderboards = document.getElementById("show-leaderboard");
const toAchievements = document.getElementById("show-achievements");
const achievementMessage = document.getElementById("achievement-message");

// DOM References - Additional Elements
const timer = document.getElementById("timer");
const scoreDisplay = document.getElementById("score");
const problemBox = document.getElementById("problem");
const penaltyOverlay = document.getElementById("penalty");
const countdown = document.getElementById("countdown");
const answerButton = document.getElementById("answer-buttons");
const resultsLeaderBoardList = document.getElementById("results-leaderboard-list");
const playerFinalScore = document.getElementById("player-score");
const leaderboardScreenList = document.getElementById("leaderboard-screen-list");
const achievementList = document.getElementById("achievements-list");

// Collects every screen in one array so that we can loop through them
const allScreens = [mainMenu, game, leaderboard, results, achievements];

// Determines which screens to hide/show (Screen Navigation)
function showScreen(targetScreen){
  for(const screen of allScreens) {
    if (screen === targetScreen) {
      screen.classList.remove("hidden");  // Reveals screen
    } else {
      screen.classList.add("hidden");  // Hides screen
    }
  }
}

// Return a random whole number between min/max
function randomInt(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Resets all state variables and game session
function startGame(){
  timeLeft = GAME_DURATION;
  score = 0;
  wrongAnswers = 0;
  currentStreak = 0;

  /* Creates shallow copy of earnedAchievements to do comparison
  for newly earned achievements each round */
  previousAchievements = {...earnedAchievements};
  achievementMessage.textContent = "";
  scoreDisplay.textContent = 0;
  showScreen(game);
  generateProblem();
  startTimer();
}

// Creates a random math problem to display
function generateProblem(){

  // Pick a random operator
  // 1 (Addition), 2 (Subtraction), 3 (Multiplication), 4 (Division)
  const randomOperator = randomInt(1, 4);

  switch(randomOperator) {
    // Addition Problem
    case 1: {
      let firstAddend = randomInt(1, 15);
      let secondAddend = randomInt(1, 15);
      currentAnswer = firstAddend + secondAddend;
      currentProblem = firstAddend + " + " + secondAddend;
      break;
    }
    // Subtraction problem
    case 2: {
      let minuend = randomInt(1, 15);
      let subtrahend = randomInt(1, 15);
      currentAnswer = minuend - subtrahend;
      currentProblem = minuend + " - " + subtrahend;
      break;
    }
    // Multiplication problem
    case 3: {
      let multiplier = randomInt(1, 12);
      let multiplicand = randomInt(1, 12);
      currentAnswer = multiplier * multiplicand;
      currentProblem = multiplier + " x " + multiplicand;
      break;
    }
    // Division problem
    case 4: {
      /* Built a division problem that always has a whole number,
      where the answer and divisor are picked first, then multiplied
      against each other to get the dividend.
       */
      let quotient = randomInt(1, 12);
      let divisor = randomInt(1, 12);
      let dividend = quotient * divisor;
      currentAnswer = dividend / divisor;
      currentProblem = dividend + " / " + divisor;
      break;
    }
    default:
      // error
      break;
  }

  renderProblem();
}

// Builds three wrong answers and one correct answer
function generateRandomAnswers(){

  const wrongAnswers = [];

  // Keep generating offsets until we have 3 created wrong answers
  while(wrongAnswers.length < 3){
    // Random offset 1-10 (can produce negatives with subtraction)
    const offset = randomInt(1, 10) * (Math.random() < 0.5 ? 1 : -1);
    const incorrectAnswers = currentAnswer + offset;

    // Avoid duplicates in wrong answer list (no need to worry about correct answers either)
    if(!wrongAnswers.includes(incorrectAnswers)){
      wrongAnswers.push(incorrectAnswers);
    }
  }

  // Transfer wrong answers and correct answer into one array
  const allAnswers = [];
  while(wrongAnswers.length !== 0){
    allAnswers.push(wrongAnswers.pop());
  }

  allAnswers.push(currentAnswer);

  // Mixes the answers
  for(let i = allAnswers.length - 1; i > 0; i--){
    const j = randomInt(0, i);
    const temp = allAnswers[i];
    allAnswers[i] = allAnswers[j];
    allAnswers[j] = temp;
  }

  // Write each shuffled value into their corresponding button's label
  const buttons = answerButton.querySelectorAll("button");
  for(let i = 0; i < buttons.length; i++){
    buttons[i].textContent = allAnswers[i];
  }

}

// Updates the problem display and refreshes answer buttons
function renderProblem(){
  problemBox.textContent = (currentProblem);
  generateRandomAnswers();
}

// Compare clicked answer with correct answer
function checkAnswer(event){
  const clicked = event.target;

  // Since textContent is always a string, we convert currentAnswer
  if(String(currentAnswer) === clicked.textContent){
    score++; // Score +1
    scoreDisplay.textContent = score;
    currentStreak++; // Current Streak
    generateProblem();
  }
  else{
    clicked.classList.add("wrong");  // Activate red screen overlay
    wrongAnswers++;  // Used to determine platinum achievement
    currentStreak = 0;  // Resets streak
    penalty(clicked);  // Punishes player for wrong answer

  }

}

// Start countdown - Updates timer display with each tick
function startTimer(){
  timer.textContent = timeLeft;

  // setInterval runs callback every 1000 ms (1 second basically)
  // ID returned is stored so stopTimer() can cancel later
  timerInterval = setInterval(function() {
    timeLeft--;
    timer.textContent = timeLeft;

    if(timeLeft === 0){
      endGame();
    }
  }, 1000);

}

// Stop when timer hits 0
function stopTimer(){
  clearInterval(timerInterval);
}

// Events to take place after timer hits 0
function endGame(){
  stopTimer();
  showScreen(results);
  playerFinalScore.textContent = score;
  renderLeaderboard();

  // Looks to find the first entry the player has potentially beaten
  let leaderboardPlaced = 0;
  let onLeaderboard = false;
  for(let i = 0; i < liveLeaderboard.length; i ++){
    if(score >= liveLeaderboard[i].score){
      leaderboardPlaced = i;
      onLeaderboard = true;
      break;
    }
  }

  // If player has placed on the leaderboard
  if(onLeaderboard){
    // Removes lowest score on leaderboard to keep the lists fixed length
    liveLeaderboard.pop();
    // Insert player's placeholder entry at correct position
    liveLeaderboard.splice(leaderboardPlaced, 0, {name: "???", score: score})

    // Build an overlay that prompts player for their initials for leaderboard
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    const prompt = document.createElement("p");
    prompt.textContent = "Enter your initials:";

    const inputField = document.createElement("input");
    inputField.maxLength = 3; // Sets initial input limit to 3

    overlay.appendChild(prompt);
    overlay.appendChild(inputField);
    results.appendChild(overlay);

    // Wait for the player to press enter before saving entry
    inputField.addEventListener("keydown", function(event) {
      if(event.key === "Enter"){
        liveLeaderboard[leaderboardPlaced].name = inputField.value;
        saveLeaderboard();
        renderLeaderboard();
        overlay.remove();
        // Pass leaderboard rank so that checkAchievements can see if an achievement has been earned
        checkAchievements(leaderboardPlaced + 1);
      }
    });

  } else {
    // Player did not make leaderboard, but we still check achievements
    checkAchievements(null);
  }

}

// Handles lockout and countdown (Locks player out from any interaction)
function penalty(clicked){

  penaltyOverlay.classList.remove("hidden");
  countdown.textContent = PENALTY_DURATION;

  let timeRemaining = PENALTY_DURATION;

  const myInterval = setInterval(function() {
    timeRemaining--;
    countdown.textContent = timeRemaining;

    if(timeRemaining === 0) {
      clearInterval(myInterval);
      clicked.classList.remove("wrong");  // Removes red overlay
      penaltyOverlay.classList.add("hidden");  // Hides penalty overlay again
      generateProblem();  // Generates next problem
    }
  }, 1000);

}

// **************************************** LEADERBOARD ************************************************

// Load leaderboard information from localStorage
function loadLeaderboard(){
  // Retrieve what is currently in localStorage
  const saved = localStorage.getItem("leaderboard");

  /* If something was found, parse back into an array and store in
  our liveLeaderboard, else default to LEADERBOARD */
  if (saved){
    liveLeaderboard = JSON.parse(saved);
  }
  else{
    liveLeaderboard = LEADERBOARD;
  }
}

// Save leaderboard information to localStorage
function saveLeaderboard(){
  // Converts array of objects into string since localStorage can only store strings
  localStorage.setItem("leaderboard", JSON.stringify(liveLeaderboard));
}

// Builds leaderboard <li> and inserts them into leaderboard and results screen
function renderLeaderboard(){
  // Clear any existing lists to prevent duplicates
  leaderboardScreenList.innerHTML = "";
  resultsLeaderBoardList.innerHTML = "";

  for(const leadB of liveLeaderboard) {
    // Creates a new <li> HTML element in memory
    const li = document.createElement("li");
    // Sets text inside <li> using current entry's name and score properties
    li.textContent = (leadB.name + " - " + leadB.score);
    resultsLeaderBoardList.appendChild(li);
    // Makes exact copy of element since only a DOM element can exist in one place at a time
    leaderboardScreenList.appendChild(li.cloneNode(true));
  }

}

// **************************************** ACHIEVEMENTS ************************************************

// Loads achievement information from localStorage
function loadAchievements(){
  // Retrieve what is currently in localStorage
  const savedAchievements = localStorage.getItem("achievements");

  /* If something was found, parse back into an array and store in
  our earnedAchievements, else default to ACHIEVEMENTS */
  if(savedAchievements){
    earnedAchievements = JSON.parse(savedAchievements);
  }
  else{
    earnedAchievements = ACHIEVEMENTS;
  }

}

// Save achievement information to localStorage
function saveAchievements(){
  localStorage.setItem("achievements", JSON.stringify(earnedAchievements));
}

// Reads earnedAchievements and rebuilds the visible achievement list (only shows unlocked ones)
function renderAchievements(){

  achievementList.innerHTML = "";

  for(const key in earnedAchievements){
    if(earnedAchievements[key] === true){
      const li = document.createElement("li");
      li.textContent = (key);
      // CSS classes let each achievement has its own color
      li.classList.add("achievement-item", "achievement-" + key);
      achievementList.appendChild(li);

    }
  }
}

// Checks leaderboard based achievements
function checkLeaderboardAchievements(position){

  // Unlocks Bronze - Top 3 finish
  if(position !== null && position <= 3 && earnedAchievements.bronze === false){
    earnedAchievements.bronze = true;
  }

  // Unlocks Silver - Top 2 finish
  if(position !== null && position <= 2 && earnedAchievements.silver === false){
    earnedAchievements.silver = true;
  }

  // Unlocks Gold - First place finish
  if(position !== null && position === 1 && earnedAchievements.gold === false){
    earnedAchievements.gold = true;
  }
}

// Checks score and accuracy based achievements
function checkPerformanceAchievements(){

  // Unlocks Platinum - Score 40+ && No incorrect answers
  if(wrongAnswers === 0 && score >= 40 && earnedAchievements.platinum === false){
    earnedAchievements.platinum = true;
  }

  // Unlocks Diamond - Score 45+
  if(score >= 45 && earnedAchievements.platinum === false){
    earnedAchievements.diamond = true;
  }

  // Unlocks Completely Wrong - 0 correct answers
  if(score === 0 && earnedAchievements.completelyWrong === false){
    earnedAchievements.completelyWrong = true;
  }
}

// Checks streak based achievements
function checkStreakAchievements(){

  // Unlocks Red Flame - 5 correct answers in a row
  if(currentStreak >= 5 && earnedAchievements.redFlame === false){
    earnedAchievements.redFlame = true;
  }

  // Unlocks Blue Flame - 10 correct answers in a row
  if(currentStreak >= 10 && earnedAchievements.blueFlame === false){
    earnedAchievements.blueFlame = true;
  }

  // Unlocks Purple Flame - 20 correct answers in a row
  if(currentStreak >= 20 && earnedAchievements.purpleFlame === false) {
    earnedAchievements.purpleFlame = true;
  }
}

// Checks for if achievements were earned and displays message
function isAchievementEarned(){

  // Find which achievements were locked before game round starts from snapshot
  const newlyEarned = [];
  for(const key in earnedAchievements){
    if(earnedAchievements[key] === true && previousAchievements[key] === false){
      newlyEarned.push(key);
    }
  }

  // Display message of achievement earned if a new achievement was earned
  if(newlyEarned.length > 0){
    achievementMessage.textContent = "You earned " + newlyEarned.length + " achievement(s)";
  }
}

// Checks to see if any achievements were earned
// Position is used to check if player placed on leaderboard
function checkAchievements(position){

  checkLeaderboardAchievements(position);
  checkPerformanceAchievements();
  checkStreakAchievements();

  // Unlocks All Unlocked - Every achievement is earned!
  /* Returns an array containing only items that are true and comparing
  that to how many total achievements there should be */
  if(Object.values(earnedAchievements).filter(achievement => achievement === true).length === TOTAL_ACHIEVEMENTS){
    earnedAchievements.allUnlockedAchievements = true;
  }

  isAchievementEarned();

  // Save updated information and then render the information
  saveAchievements();
  renderAchievements();

}

// Initialization - these run when page first loads to restore any saved data
loadLeaderboard();
renderLeaderboard();
loadAchievements();
renderAchievements();

// Event Listeners - watches for a "click" on a specific button and then calls appropriate function
leaderboardBackButton.addEventListener("click", function(){
  showScreen(mainMenu);
  });
achievementBackButton.addEventListener("click", function(){
  showScreen(mainMenu);
  });
resultsMainMenuButton.addEventListener("click", function(){
  showScreen(mainMenu);
});
resultsPlayAgain.addEventListener("click", function(){
  startGame();
});
playGame.addEventListener("click", function(){
  startGame();
});
toLeaderboards.addEventListener("click", function(){
  showScreen(leaderboard);
});
toAchievements.addEventListener("click", function(){
  showScreen(achievements);
});

// Listens on parent container since there is multiple possibilities for what this event does
answerButton.addEventListener("click", function(event){
  checkAnswer(event);
});

