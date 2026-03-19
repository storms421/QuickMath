// Game Constants
const GAME_DURATION = 60;
const PENALTY_DURATION = 3;
const TOTAL_ACHIEVEMENTS = 8;
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
const ACHIEVEMENTS = {
  bronze: false,
  silver: false,
  gold: false,
  platinum: false,
  redFlame: false,
  blueFlame: false,
  purpleFlame: false,
  completelyWrong: false,
  allUnlockedAchievements: false
};

// Track states during a game
let score = 0;
let timeLeft = GAME_DURATION;
let timerInterval = null;
let currentStreak = 0;
let currentAnswer = null;
let liveLeaderboard = [];
let wrongAnswers = 0;
let earnedAchievements = {}

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




// Loads achievement information from localStorage
function loadAchievements(){
  const savedAchievements = localStorage.getItem("achievements");

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

function renderAchievements(){

  achievementList.innerHTML = "";

  for(const key in earnedAchievements){
    if(earnedAchievements[key] === true){
      const li = document.createElement("li");
      li.textContent = (key);
      li.classList.add("achievement-item", "achievement-" + key);
      achievementList.appendChild(li);

    }
  }
}


// Creates a new <li> HTML element in memory
const li = document.createElement("li");
// Sets text inside <li> using current entry's name and score properties
li.textContent = (leadB.name + " - " + leadB.score);
resultsLeaderBoardList.appendChild(li);
// Makes exact copy of element since only a DOM element can exist in one place at a time
leaderboardScreenList.appendChild(li.cloneNode(true));


// Checks to see if any achievements were earned
function checkAchievements(position){

  if(position <= 3 && earnedAchievements.bronze === false){
    //unlock bronze
    earnedAchievements.bronze = true;
  }

  if(position <= 2 && earnedAchievements.silver === false){
    // unlock silver
    earnedAchievements.silver = true;
  }

  if(position === 1 && earnedAchievements.gold === false){
    // unlock gold
    earnedAchievements.gold = true;
  }

  if(wrongAnswers === 0 && score >= 40 && earnedAchievements.platinum === false){
    // unlock platinum
    earnedAchievements.platinum = true;
  }

  if(currentStreak >= 5 && earnedAchievements.redFlame === false){
    // unlock red flame
    earnedAchievements.redFlame = true;
  }

  if(currentStreak >= 10 && earnedAchievements.blueFlame === false){
    // unlock blue flame
    earnedAchievements.blueFlame = true;
  }

  if(currentStreak >= 20 && earnedAchievements.purpleFlame === false){
    // unlock purple flame
    earnedAchievements.purpleFlame = true;
  }

  if(score === 0 && earnedAchievements.completelyWrong === false){
    // unlock odds (brown)
    earnedAchievements.completelyWrong = true;

  }

  if(Object.values(earnedAchievements).filter(achievement => achievement === true).length === TOTAL_ACHIEVEMENTS){
    // unlock all achievements (black)
    earnedAchievements.allUnlockedAchievements = true;
  }

  // Save updated information and then render the information
  saveAchievements();
  renderAchievements();

}




