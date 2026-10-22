"use strict";

/*

* MedQ Bank V9
* Educational demonstration question bank.
* Review medical content before production use.
  */

const QUESTION_BANK = [
{
id: 1,
category: "Anatomy",
difficulty: "Easy",
question: "Which chamber of the heart pumps blood into the aorta?",
options: [
"Right atrium",
"Right ventricle",
"Left atrium",
"Left ventricle"
],
answer: 3,
explanation:
"The left ventricle pumps oxygenated blood into the aorta for systemic circulation."
},
{
id: 2,
category: "Physiology",
difficulty: "Easy",
question: "Which organ is primarily responsible for producing insulin?",
options: [
"Liver",
"Pancreas",
"Kidney",
"Spleen"
],
answer: 1,
explanation:
"Beta cells in the pancreatic islets of Langerhans produce insulin."
},
{
id: 3,
category: "Cardiology",
difficulty: "Easy",
question: "Which electrical wave on a normal ECG represents atrial depolarization?",
options: [
"P wave",
"QRS complex",
"T wave",
"U wave"
],
answer: 0,
explanation:
"The P wave represents atrial depolarization."
},
{
id: 4,
category: "Pharmacology",
difficulty: "Easy",
question: "Which medication class is commonly used to reduce fever?",
options: [
"Anticoagulants",
"Antipyretics",
"Antifungals",
"Antacids"
],
answer: 1,
explanation:
"Antipyretics, such as paracetamol, are used to reduce fever. Medication choice and dosing depend on the patient and clinical context."
},
{
id: 5,
category: "Anatomy",
difficulty: "Easy",
question: "What is the largest organ of the human body?",
options: [
"Liver",
"Lung",
"Skin",
"Brain"
],
answer: 2,
explanation:
"The skin is the largest organ of the human body by surface area."
},
{
id: 6,
category: "Physiology",
difficulty: "Easy",
question: "Which blood cells primarily transport oxygen?",
options: [
"Platelets",
"Red blood cells",
"Neutrophils",
"Lymphocytes"
],
answer: 1,
explanation:
"Red blood cells contain hemoglobin, which carries most oxygen in the blood."
},
{
id: 7,
category: "Cardiology",
difficulty: "Easy",
question: "Which blood vessels carry blood away from the heart?",
options: [
"Veins",
"Arteries",
"Capillaries only",
"Lymphatic vessels"
],
answer: 1,
explanation:
"Arteries carry blood away from the heart. The oxygen content depends on the circulation; pulmonary arteries carry deoxygenated blood."
},
{
id: 8,
category: "Pharmacology",
difficulty: "Easy",
question: "Which route of medication administration delivers a drug directly into a vein?",
options: [
"Oral",
"Topical",
"Intravenous",
"Inhaled"
],
answer: 2,
explanation:
"Intravenous administration delivers medication directly into the venous circulation."
},
{
id: 9,
category: "Anatomy",
difficulty: "Easy",
question: "How many chambers does a normal human heart have?",
options: [
"Two",
"Three",
"Four",
"Five"
],
answer: 2,
explanation:
"The heart has two atria and two ventricles, making four chambers."
},
{
id: 10,
category: "Physiology",
difficulty: "Easy",
question: "Which part of the nephron is the main site of blood filtration?",
options: [
"Collecting duct",
"Glomerulus",
"Loop of Henle",
"Distal tubule"
],
answer: 1,
explanation:
"Blood filtration begins across the glomerular filtration barrier."
},
{
id: 11,
category: "Cardiology",
difficulty: "Easy",
question: "Which structure normally initiates the heartbeat?",
options: [
"AV node",
"SA node",
"Bundle branches",
"Purkinje fibers"
],
answer: 1,
explanation:
"The sinoatrial node normally acts as the heart's primary pacemaker."
},
{
id: 12,
category: "Pharmacology",
difficulty: "Easy",
question: "Antibiotics are primarily used to treat infections caused by which organisms?",
options: [
"Bacteria",
"All viruses",
"All allergies",
"All genetic disorders"
],
answer: 0,
explanation:
"Antibiotics target susceptible bacteria. They do not treat viral infections, and their use should follow appropriate clinical guidance."
}
];

const DEFAULT_STATS = {
answered: 0,
correct: 0,
xp: 0,
streak: 0,
lastStudyDate: "",
incorrectIds: [],
answeredIds: []
};

const STATS_KEY = "medq_v9_stats";
const REVIEW_KEY = "medq_v9_review";

let stats = loadStats();
let quizQuestions = [];
let questionIndex = 0;
let sessionCorrect = 0;
let sessionWrong = 0;
let sessionXP = 0;
let answerLocked = false;
let currentPage = "dashboardPage";

const $ = (id) => document.getElementById(id);

function safeArray(value) {
return Array.isArray(value) ? value : [];
}

function loadStats() {
try {
const saved = localStorage.getItem(STATS_KEY);

if (!saved) {
  return { ...DEFAULT_STATS };
}

const parsed = JSON.parse(saved);

if (!parsed || typeof parsed !== "object") {
  return { ...DEFAULT_STATS };
}

return {
  ...DEFAULT_STATS,
  ...parsed,
  incorrectIds: safeArray(parsed.incorrectIds),
  answeredIds: safeArray(parsed.answeredIds)
};

} catch (error) {
console.warn("Unable to load saved statistics.", error);
return { ...DEFAULT_STATS };
}
}

function saveStats() {
try {
localStorage.setItem(STATS_KEY, JSON.stringify(stats));
return true;
} catch (error) {
console.warn("Unable to save statistics.", error);
return false;
}
}

function updateDashboard(currentStats = stats) {
const answered = Math.max(0, Number(currentStats.answered) || 0);
const correct = Math.max(0, Number(currentStats.correct) || 0);
const xp = Math.max(0, Number(currentStats.xp) || 0);
const streak = Math.max(0, Number(currentStats.streak) || 0);

const accuracy = answered > 0
? Math.round((Math.min(correct, answered) / answered) * 100)
: 0;

$("answeredCount").textContent = answered;
$("accuracyCount").textContent = accuracy + "%";
$("streakCount").textContent = streak;
$("xpCount").textContent = xp;

$("progressLabel").textContent = accuracy + "%";
$("progressBar").style.width = accuracy + "%";

$("progressMessage").textContent = answered > 0
? "You've answered ${answered} questions. Keep practicing!"
: "Answer your first question to start tracking progress.";
}

function showPage(pageId) {
const pageIds = [
"dashboardPage",
"quizPage",
"resultsPage",
"reviewPage"
];

if (!pageIds.includes(pageId)) return;

pageIds.forEach((id) => {
$(id).classList.toggle("hidden", id !== pageId);
});

currentPage = pageId;

document.querySelectorAll(".nav-btn").forEach((button) => {
button.classList.toggle(
"active",
button.dataset.page === pageId ||
(pageId === "resultsPage" && button.dataset.page === "dashboardPage")
);
});

window.scrollTo({ top: 0, behavior: "smooth" });
}

function shuffle(array) {
const result = [...array];

for (let i = result.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[result[i], result[j]] = [result[j], result[i]];
}

return result;
}

function startQuiz() {
const category = $("categorySelect").value;
const limitValue = $("questionLimit").value;

let pool = QUESTION_BANK.filter((question) => {
return category === "All" || question.category === category;
});

if (pool.length === 0) {
alert("No questions are available for this subject yet.");
return;
}

pool = shuffle(pool);

const limit = limitValue === "all"
? pool.length
: Number(limitValue);

quizQuestions = pool.slice(0, limit);

questionIndex = 0;
sessionCorrect = 0;
sessionWrong = 0;
sessionXP = 0;
answerLocked = false;

showPage("quizPage");
renderQuestion();
}

function renderQuestion() {
const question = quizQuestions[questionIndex];

if (!question) {
finishQuiz();
return;
}

answerLocked = false;

$("quizCategory").textContent = question.category;
$("questionCounter").textContent =
"Question ${questionIndex + 1} of ${quizQuestions.length}";

$("questionText").textContent = question.question;

const progress =
(questionIndex / quizQuestions.length) * 100;

$("quizProgressBar").style.width = progress + "%";

$("explanationBox").classList.add("hidden");
$("nextQuestionBtn").classList.add("hidden");

const container = $("optionsContainer");
container.replaceChildren();

question.options.forEach((option, index) => {
const button = document.createElement("button");
button.type = "button";
button.className = "opt";

const letter = document.createElement("span");
letter.className = "opt-letter";
letter.textContent = String.fromCharCode(65 + index);

const text = document.createElement("span");
text.textContent = option;

button.append(letter, text);
button.addEventListener("click", () => selectAnswer(index));

container.appendChild(button);

});
}

function selectAnswer(selectedIndex) {
if (answerLocked) return;

answerLocked = true;

const question = quizQuestions[questionIndex];
const isCorrect = selectedIndex === question.answer;
const buttons = $("optionsContainer").querySelectorAll(".opt");

buttons.forEach((button, index) => {
button.disabled = true;

if (index === question.answer) {
  button.classList.add("correct");
} else if (index === selectedIndex) {
  button.classList.add("wrong");
}

});

stats.answered += 1;

if (isCorrect) {
stats.correct += 1;
sessionCorrect += 1;
sessionXP += 10;

stats.xp += 10;

stats.incorrectIds = stats.incorrectIds.filter(
  (id) => id !== question.id
);

} else {
sessionWrong += 1;

if (!stats.incorrectIds.includes(question.id)) {
  stats.incorrectIds.push(question.id);
}

}

if (!stats.answeredIds.includes(question.id)) {
stats.answeredIds.push(question.id);
}

updateStudyStreak();

saveStats();
updateDashboard();

$("answerFeedback").textContent = isCorrect
? "✓ Correct answer!"
: "✕ Incorrect answer";

$("answerFeedback").style.color = isCorrect
? "var(--success)"
: "var(--danger)";

$("explanationText").textContent = question.explanation;
$("explanationBox").classList.remove("hidden");

$("nextQuestionBtn").textContent =
questionIndex === quizQuestions.length - 1
? "View results →"
: "Next question →";

$("nextQuestionBtn").classList.remove("hidden");
}

function updateStudyStreak() {
const today = new Date().toLocaleDateString("en-CA");
const previous = stats.lastStudyDate;

if (previous === today) return;

if (previous) {
const previousDate = new Date(previous + "T12:00:00");
const todayDate = new Date(today + "T12:00:00");

const dayDifference = Math.round(
  (todayDate - previousDate) / 86400000
);

if (dayDifference === 1) {
  stats.streak += 1;
} else {
  stats.streak = 1;
}

} else {
stats.streak = 1;
}

stats.lastStudyDate = today;
}

function nextQuestion() {
if (!answerLocked) return;

questionIndex += 1;

if (questionIndex >= quizQuestions.length) {
finishQuiz();
return;
}

renderQuestion();
}

function finishQuiz() {
const total = sessionCorrect + sessionWrong;

const accuracy = total > 0
? Math.round((sessionCorrect / total) * 100)
: 0;

$("quizProgressBar").style.width = "100%";
$("finalAccuracy").textContent = accuracy + "%";
$("finalCorrect").textContent = sessionCorrect;
$("finalWrong").textContent = sessionWrong;
$("finalXP").textContent = sessionXP;

$("resultMessage").textContent =
accuracy >= 80
? "Excellent work! Keep building your medical knowledge."
: accuracy >= 50
? "Good effort! Review the explanations and keep practicing."
: "Keep learning. Reviewing each explanation can help you improve.";

saveStats();
updateDashboard();
showPage("resultsPage");
}

function showReview() {
const container = $("reviewContainer");
container.replaceChildren();

const incorrectQuestions = QUESTION_BANK.filter((question) =>
stats.incorrectIds.includes(question.id)
);

if (incorrectQuestions.length === 0) {
const message = document.createElement("article");
message.className = "card";
message.textContent =
"No incorrect answers to review. Complete a quiz to start building your review list.";

container.appendChild(message);
showPage("reviewPage");
return;

}

incorrectQuestions.forEach((question) => {
const card = document.createElement("article");
card.className = "card review-item";

const category = document.createElement("span");
category.className = "pill";
category.textContent = question.category;

const title = document.createElement("h3");
title.textContent = question.question;

const answer = document.createElement("p");
answer.className = "review-answer";
answer.textContent =
  "Correct answer: " + question.options[question.answer];

const explanation = document.createElement("p");
explanation.className = "muted";
explanation.textContent = question.explanation;

card.append(category, title, answer, explanation);
container.appendChild(card);

});

showPage("reviewPage");
}

function goHome() {
updateDashboard();
showPage("dashboardPage");
}

$("startQuizBtn").addEventListener("click", startQuiz);
$("nextQuestionBtn").addEventListener("click", nextQuestion);
$("exitQuizBtn").addEventListener("click", goHome);
$("homeBtn").addEventListener("click", goHome);
$("retryBtn").addEventListener("click", startQuiz);
$("reviewBtn").addEventListener("click", showReview);
$("navReviewBtn").addEventListener("click", showReview);
$("backFromReviewBtn").addEventListener("click", goHome);

$("navQuizBtn").addEventListener("click", startQuiz);

document.querySelectorAll('.nav-btn[data-page="dashboardPage"]')
.forEach((button) => button.addEventListener("click", goHome));

updateDashboard();
