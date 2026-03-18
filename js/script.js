// Game Constants
const GAME_DURATION = 60;
const PENALTY_DURATION = 3;
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

// Track states during a game
let score = 0;
let timeLeft = GAME_DURATION;
let timerInterval = null;
let currentStreak = 0;
let currentAnswer = null;
let liveLeaderboard = [];

// Grab HTML elements to be interacted with (Main Screens)
const mainMenu = document.getElementById("main-menu");
const game = document.getElementById("game");
const leaderboard = document.getElementById("leaderboard");
const results = document.getElementById("results");
const achievements = document.getElementById("achievements");

// Grab HTML elements to be interacted with (Additional Elements)
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
const achievementEarned = document.getElementById("achievement-earned");
const achievementReceived = document.querySelector(".achievement-received");

const allScreens = [mainMenu, game, leaderboard, results, achievements];

// Determines which screens to hide/show
function showScreen(targetScreen){
  for(const screen of allScreens) {
    if (screen === targetScreen) {
      screen.classList.remove("hidden");
    } else {
      screen.classList.add("hidden");
    }
  }
}

// Load leaderboard information from localStorage
function loadLeaderboard(){
  // Retrieve what is currently in localStorage
  const saved = localStorage.getItem("leaderboard");

  // If something was found, parse back into an array and store in our liveLeaderboard, else default to LEADERBOARD
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

// Resets all state variables and game session
function startGame(){}

// Create random math problem to display
function generateProblem(){}

// Create random math answers to display
function generateRandomAnswers(){}

// Displays problems on screen
function renderProblem(){}

// Compare clicked answer with correct answer
function checkAnswer(){}

// Start countdown
function startTimer(){}

// Stop when timer hits 0
function stopTimer(){}

// Events to take place after timer hits 0
function endGame(){}

// Handles lockout and countdown
function penalty(){}




// Loads achievement information from localStorage
function loadAchievements(){}

// Save achievement information to localStorage
function saveAchievements(){}

function renderAchievements(){}

// Checks to see if any achievements were earned
function checkAchievements(){}



function randomInt(min, max){

  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNum;
}



