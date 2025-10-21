let currentA, currentB, currentX, currentY;
let questionType = "y";
let graphA, graphB, graphChart;
let currentGameQuestionType = "algebra";

// ゲーム用変数
let score = 0;
let life = 3;
let level = 1;
let timer = 30;
let timerInterval = null;
let gameActive = false;

let totalQuestions = 10; // 問題数。UIで設定
let currentQuestion = 0;
let correctCount = 0;
let quizMode = false;
let wrongProblems = [];
let currentMode = "";

// ユーザー定義範囲
let customRanges = {
  aMin: 1, aMax: 3,
  bMin: -3, bMax: 3,
  xMin: 0, xMax: 5
};

function setDifficultyRange(difficulty) {
  let range = {};
  if (difficulty === "easy") {
    range = { aMin: 1, aMax: 3, bMin: -3, bMax: 3, xMin: 0, xMax: 5 };
  } else if (difficulty === "normal") {
    range = { aMin: -5, aMax: 5, bMin: -5, bMax: 5, xMin: -5, xMax: 10 };
  } else {
    range = { aMin: -10, aMax: 10, bMin: -10, bMax: 10, xMin: -10, xMax: 20 };
  }
  document.getElementById("aMin").value = range.aMin;
  document.getElementById("aMax").value = range.aMax;
  document.getElementById("bMin").value = range.bMin;
  document.getElementById("bMax").value = range.bMax;
  document.getElementById("xMin").value = range.xMin;
  document.getElementById("xMax").value = range.xMax;
  customRanges = { ...range };
}

function applyCustomRange() {
  customRanges.aMin = Number(document.getElementById("aMin").value);
  customRanges.aMax = Number(document.getElementById("aMax").value);
  customRanges.bMin = Number(document.getElementById("bMin").value);
  customRanges.bMax = Number(document.getElementById("bMax").value);
  customRanges.xMin = Number(document.getElementById("xMin").value);
  customRanges.xMax = Number(document.getElementById("xMax").value);

  // 問題数も反映
  let tq = Number(document.getElementById("totalQuestionsInput").value);
  if (tq >= 1) totalQuestions = tq;
}

function getRanges() {
  return customRanges;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function onProblemTypeChange() {
  const val = document.getElementById("problemType").value;
  if (val === "algebra" || val === "graph" || val === "mix") {
    currentGameQuestionType = val;
  }
}

function startGame() {
  score = 0;
  life = 3;
  level = 1;
  timer = 30;
  gameActive = true;
  currentQuestion = 0;
  correctCount = 0;
  document.getElementById("score").textContent = score;
  document.getElementById("life").textContent = life;
  document.getElementById("level").textContent = level;
  document.getElementById("timer").textContent = timer;
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("gameOverPanel").style.display = "none";
  document.getElementById("retryBtn").style.display = "none";
  applyCustomRange(); // 最新の問題数等を反映
  generateGameQuestion();
  startTimer();
}

function retryGame() {
  startGame();
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameActive) {
      clearInterval(timerInterval);
      return;
    }
    timer--;
    document.getElementById("timer").textContent = timer;
    if (timer <= 0) {
      loseLife();
    }
  }, 1000);
}

function loseLife() {
  life--;
  document.getElementById("life").textContent = life;
  timer = 30;
  document.getElementById("timer").textContent = timer;
  if (life <= 0) {
    endGame();
  } else {
    setTimeout(generateGameQuestion, 1000);
  }
}

function endGame() {
  gameActive = false;
  clearInterval(timerInterval);
  document.getElementById("gameOverPanel").style.display = "block";
  document.getElementById("retryBtn").style.display = "inline";
  document.getElementById("checkBtn").style.display = "none";
  document.getElementById("graphCheckBtn").style.display = "none";
  document.getElementById("graphPanel").style.display = "none";
  document.getElementById("questionNumber").textContent = "";
  document.getElementById("resultSummary").textContent =
    `終了！正解数: ${correctCount} / ${totalQuestions}（正答率: ${Math.round((correctCount/totalQuestions)*100)}%）`;
}

function generateGameQuestion() {
  if (!gameActive) return;
  // 問題数制御
  if (currentQuestion >= totalQuestions) {
    endGame();
    return;
  }

  currentQuestion++;
  document.getElementById("questionNumber").textContent = `【第${currentQuestion}問 / 全${totalQuestions}問】`;

  document.getElementById("answerResult").textContent = "";
  document.getElementById("graphAnswerResult").textContent = "";
  document.getElementById("answerInput").style.display = "none";
  document.getElementById("answerInputA").style.display = "none";
  document.getElementById("answerInputB").style.display = "none";
  document.getElementById("checkBtn").style.display = "none";
  document.getElementById("graphPanel").style.display = "none";
  document.getElementById("graphCheckBtn").style.display = "none";
  document.getElementById("resultSummary").textContent = "";

  let type = currentGameQuestionType;
  if (type === "mix") {
    type = randInt(0, 1) === 0 ? "algebra" : "graph";
  }

  if (type === "algebra") {
    generateAlgebraQuestion();
  } else if (type === "graph") {
    generateGraphQuestion(true);
  }
}

function generateAlgebraQuestion() {
  if (!gameActive) return;
  const range = getRanges();
  currentA = randInt(range.aMin, range.aMax);
  currentB = randInt(range.bMin, range.bMax);
  currentX = randInt(range.xMin, range.xMax);
  currentY = currentA * currentX + currentB;

  const difficulty = document.getElementById("difficulty") ? document.getElementById("difficulty").value : "easy";
  const getFunctionString = (a, b) => {
    if (b === 0) return `y = ${a}x`;
    if (b > 0) return `y = ${a}x + ${b}`;
    return `y = ${a}x - ${Math.abs(b)}`;
  };
  if (difficulty === "easy") {
    questionType = "ab";
    document.getElementById("question").textContent = `一次関数の式「y = ax + b」のa（傾き）とb（切片）を答えてください。\n（例：${getFunctionString(currentA, currentB)}）`;
    document.getElementById("answerInput").style.display = "none";
    document.getElementById("answerInputA").style.display = "inline";
    document.getElementById("answerInputB").style.display = "inline";
  } else {
    const types = ["y", "a", "b"];
    questionType = types[randInt(0, types.length - 1)];
    let questionText = "";
    if (questionType === "y") {
      questionText = `${getFunctionString(currentA, currentB)} のとき、x = ${currentX} の y の値は？`;
      document.getElementById("answerInput").placeholder = "yの値を入力";
    } else if (questionType === "a") {
      questionText = `x = ${currentX} のとき、y = ${currentY} となる一次関数 y = ax ${currentB === 0 ? "" : (currentB > 0 ? `+ ${currentB}` : `- ${Math.abs(currentB)}`)} の傾き a の値は？`;
      document.getElementById("answerInput").placeholder = "傾きを入力";
    } else if (questionType === "b") {
      questionText = `x = ${currentX} のとき、y = ${currentY} となる一次関数 y = ${currentA}x + b の切片 b の値は？`;
      document.getElementById("answerInput").placeholder = "切片を入力";
    }
    document.getElementById("question").textContent = questionText;
    document.getElementById("answerInput").style.display = "inline";
    document.getElementById("answerInputA").style.display = "none";
    document.getElementById("answerInputB").style.display = "none";
  }
  document.getElementById("answerInput").value = "";
  document.getElementById("answerInputA").value = "";
  document.getElementById("answerInputB").value = "";
  document.getElementById("answerResult").textContent = "";
  document.getElementById("checkBtn").style.display = "inline";

  document.getElementById("graphPanel").style.display = "block";
  document.getElementById("graphProblem").textContent =
    `この一次関数 ${getFunctionString(currentA, currentB)} のグラフです。`;
  drawAlgebraGraph(currentA, currentB);
  document.getElementById("graphAnswerResult").textContent = "";
  document.getElementById("graphCheckBtn").style.display = "none";
}

function drawAlgebraGraph(a, b) {
  const range = getRanges();
  let xValues = [];
  let yValues = [];
  for (let x = range.xMin; x <= range.xMax; x++) {
    xValues.push(x);
    yValues.push(a * x + b);
  }
  if (graphChart) graphChart.destroy();
  const ctx = document.getElementById('graphCanvas').getContext('2d');
  graphChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: [{
        label: 'y = ax + b',
        data: yValues,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        pointRadius: 6,
        pointBackgroundColor: 'blue',
        borderWidth: 4,
        tension: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: { color: 'black', font: { size: 16 } }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'x軸', font: { size: 20 } },
          grid: { color: 'rgba(0,0,0,0.2)' },
          ticks: { color: 'black', font: { size: 14 } }
        },
        y: {
          title: { display: true, text: 'y軸', font: { size: 20 } },
          grid: { color: 'rgba(0,0,0,0.2)' },
          ticks: { color: 'black', font: { size: 14 } }
        }
      },
      animation: false
    }
  });
}

function checkAnswer() {
  if (!gameActive) return;
  if (currentGameQuestionType === "graph" && document.getElementById("graphPanel").style.display === "block") {
    checkGraphAnswer();
    return;
  }
  const difficulty = document.getElementById("difficulty") ? document.getElementById("difficulty").value : "easy";
  const resultDiv = document.getElementById("answerResult");
  let isCorrect = false;

  if (difficulty === "easy" && questionType === "ab") {
    const userA = Number(document.getElementById("answerInputA").value);
    const userB = Number(document.getElementById("answerInputB").value);
    isCorrect = (userA === currentA && userB === currentB);
    if (isCorrect) {
      resultDiv.textContent = "正解！ +10点";
      resultDiv.style.color = "green";
      score += 10;
      correctCount++;
      document.getElementById("score").textContent = score;
      if (score % 50 === 0) levelUp();
    } else {
      resultDiv.textContent = `不正解… 正しい答えは a=${currentA}、b=${currentB} です。 -1ライフ`;
      resultDiv.style.color = "red";
      loseLife();
      return;
    }
  } else {
    const userAns = Number(document.getElementById("answerInput").value);
    let correctAns = "";
    let ansLabel = "";
    if (questionType === "y") {
      isCorrect = (userAns === currentY);
      correctAns = currentY;
      ansLabel = "y";
    } else if (questionType === "a") {
      isCorrect = (userAns === currentA);
      correctAns = currentA;
      ansLabel = "傾き a";
    } else if (questionType === "b") {
      isCorrect = (userAns === currentB);
      correctAns = currentB;
      ansLabel = "切片 b";
    }
    if (isCorrect) {
      resultDiv.textContent = "正解！ +10点";
      resultDiv.style.color = "green";
      score += 10;
      correctCount++;
      document.getElementById("score").textContent = score;
      if (score % 50 === 0) levelUp();
    } else {
      resultDiv.textContent = `不正解… 正しい答えは ${ansLabel} = ${correctAns} です。 -1ライフ`;
      resultDiv.style.color = "red";
      loseLife();
      return;
    }
  }
  if (gameActive) {
    timer = 30;
    document.getElementById("timer").textContent = timer;
    setTimeout(generateGameQuestion, 1000);
  }
}

function levelUp() {
  level++;
  document.getElementById("level").textContent = level;
  if (level >= 3) {
    document.getElementById("difficulty").value = "hard";
  } else if (level === 2) {
    document.getElementById("difficulty").value = "normal";
  } else {
    document.getElementById("difficulty").value = "easy";
  }
  setDifficultyRange(document.getElementById("difficulty").value);
}

function generateGraphQuestion(isGameMode = false) {
  const range = getRanges();
  graphA = randInt(range.aMin, range.aMax);
  if (graphA === 0) graphA = 1;
  graphB = randInt(range.bMin, range.bMax);

  let xValues = [];
  let yValues = [];
  for (let x = range.xMin; x <= range.xMax; x++) {
    xValues.push(x);
    yValues.push(graphA * x + graphB);
  }

  if (graphChart) graphChart.destroy();
  const ctx = document.getElementById('graphCanvas').getContext('2d');
  graphChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: xValues,
      datasets: [{
        label: 'y = ax + b',
        data: yValues,
        borderColor: 'red',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
        pointRadius: 6,
        pointBackgroundColor: 'blue',
        borderWidth: 4,
        tension: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          display: true,
          labels: { color: 'black', font: { size: 16 } }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'x軸', font: { size: 20 } },
          grid: { color: 'rgba(0,0,0,0.2)' },
          ticks: { color: 'black', font: { size: 14 } }
        },
        y: {
          title: { display: true, text: 'y軸', font: { size: 20 } },
          grid: { color: 'rgba(0,0,0,0.2)' },
          ticks: { color: 'black', font: { size: 14 } }
        }
      },
      animation: false
    },
    plugins: [{
      id: 'arrow-plugin',
      afterDraw: chart => {
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const xZero = chart.scales.x.getPixelForValue(0);
        const yZero = chart.scales.y.getPixelForValue(0);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(chartArea.right - 15, yZero);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(chartArea.right - 15, yZero);
        ctx.lineTo(chartArea.right - 25, yZero - 7);
        ctx.lineTo(chartArea.right - 25, yZero + 7);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(chartArea.left + 15, yZero);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(chartArea.left + 15, yZero);
        ctx.lineTo(chartArea.left + 25, yZero - 7);
        ctx.lineTo(chartArea.left + 25, yZero + 7);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(xZero, chartArea.top + 15);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xZero, chartArea.top + 15);
        ctx.lineTo(xZero - 7, chartArea.top + 25);
        ctx.lineTo(xZero + 7, chartArea.top + 25);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(xZero, chartArea.bottom - 15);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xZero, chartArea.bottom - 15);
        ctx.lineTo(xZero - 7, chartArea.bottom - 25);
        ctx.lineTo(xZero + 7, chartArea.bottom - 25);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        ctx.restore();
      }
    }]
  });

  const getFunctionString = (a, b) => {
    if (b === 0) return `y = ${a}x`;
    if (b > 0) return `y = ${a}x + ${b}`;
    return `y = ${a}x - ${Math.abs(b)}`;
  };
  document.getElementById("question").textContent = "";
  document.getElementById("graphPanel").style.display = "block";
  document.getElementById("graphProblem").textContent =
    `上のグラフの一次関数：${getFunctionString(graphA, graphB)} の傾き(a)と切片(b)を答えてください。`;

  document.getElementById("slopeInput").value = "";
  document.getElementById("interceptInput").value = "";
  document.getElementById("graphAnswerResult").textContent = "";
  document.getElementById("graphCheckBtn").style.display = "inline";
}

function checkGraphAnswer() {
  const userSlope = Number(document.getElementById("slopeInput").value);
  const userIntercept = Number(document.getElementById("interceptInput").value);
  const resultDiv = document.getElementById("graphAnswerResult");
  if (userSlope === graphA && userIntercept === graphB) {
    resultDiv.textContent = "正解！ +10点";
    correctCount++;
    score += 10;
    document.getElementById("score").textContent = score;
    if (score % 50 === 0) levelUp();
    timer = 30;
    document.getElementById("timer").textContent = timer;
    setTimeout(generateGameQuestion, 1000);
  } else {
    resultDiv.textContent = `不正解… 正しい答えは 傾き(a)=${graphA}、切片(b)=${graphB} です。 -1ライフ`;
    resultDiv.style.color = "red";
    loseLife();
  }
}
