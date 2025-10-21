let currentA, currentB, currentX, currentY;
let questionType = "y";
let graphA, graphB, graphChart;

// 連続出題モード用
let totalQuestions = 10; // 出題数
let currentQuestion = 0;
let correctCount = 0;
let quizMode = false;
let wrongProblems = []; // 間違えた問題の記録

// 現在のモード
let currentMode = "";

function getRanges() {
  const difficulty = document.getElementById("difficulty") ? document.getElementById("difficulty").value : "easy";
  if (difficulty === "easy") {
    return { aMin: 1, aMax: 3, bMin: -3, bMax: 3, xMin: 0, xMax: 5 };
  } else if (difficulty === "normal") {
    return { aMin: -5, aMax: 5, bMin: -5, bMax: 5, xMin: -5, xMax: 10 };
  } else {
    return { aMin: -10, aMax: 10, bMin: -10, bMax: 10, xMin: -10, xMax: 20 };
  }
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// モード選択時の表示制御
function selectMode() {
  currentMode = document.getElementById("modeSelect").value;
  document.getElementById("questionNumber").textContent = "";
  document.getElementById("resultSummary").textContent = "";
  document.getElementById("question").textContent = "";
  document.getElementById("answerResult").textContent = "";
  document.getElementById("answerInput").value = "";
  document.getElementById("answerInputA").value = "";
  document.getElementById("answerInputB").value = "";
  document.getElementById("answerInput").style.display = "none";
  document.getElementById("answerInputA").style.display = "none";
  document.getElementById("answerInputB").style.display = "none";
  document.getElementById("checkBtn").style.display = "none";
  document.getElementById("graphPanel").style.display = "none";
  let panel = document.getElementById("modePanel");
  panel.innerHTML = "";

  if (currentMode === "one") {
    panel.innerHTML = `
      <label>難易度:
        <select id="difficulty">
          <option value="easy">簡単</option>
          <option value="normal">普通</option>
          <option value="hard">難しい</option>
        </select>
      </label>
      <button onclick="generateQuestion()">計算問題を作る</button>
    `;
  } else if (currentMode === "quiz") {
    panel.innerHTML = `
      <label>難易度:
        <select id="difficulty">
          <option value="easy">簡単</option>
          <option value="normal">普通</option>
          <option value="hard">難しい</option>
        </select>
      </label>
      <button onclick="startQuiz()">問題を連続で解く（${totalQuestions}問）</button>
    `;
  } else if (currentMode === "similar") {
    panel.innerHTML = `<button onclick="showSimilarProblem()">類似問題を表示</button>`;
  } else if (currentMode === "graph") {
    document.getElementById("graphPanel").style.display = "block";
  }
}

// 連続出題モード
function startQuiz() {
  quizMode = true;
  currentQuestion = 0;
  correctCount = 0;
  wrongProblems = [];
  document.getElementById("resultSummary").textContent = "";
  nextQuizQuestion();
}

function nextQuizQuestion() {
  if (currentQuestion < totalQuestions) {
    currentQuestion++;
    generateQuestion();
    document.getElementById("questionNumber").textContent = `【第${currentQuestion}問 / 全${totalQuestions}問】`;
  } else {
    quizMode = false;
    let rate = Math.round((correctCount / totalQuestions) * 100);
    document.getElementById("resultSummary").textContent =
      `終了！正解数: ${correctCount} / ${totalQuestions}（正答率: ${rate}%）`;
    document.getElementById("questionNumber").textContent = "";
    document.getElementById("checkBtn").style.display = "none";
  }
}

function generateQuestion() {
  const range = getRanges();
  currentA = randInt(range.aMin, range.aMax);
  currentB = randInt(range.bMin, range.bMax);
  currentX = randInt(range.xMin, range.xMax);
  currentY = currentA * currentX + currentB;

  const difficulty = document.getElementById("difficulty") ? document.getElementById("difficulty").value : "easy";
  let types;
  if (difficulty === "easy") {
    questionType = "ab";
    document.getElementById("question").textContent = `一次関数の式「y = ax + b」のa（傾き）とb（切片）を答えてください。\n（例：y = ${currentA}x + ${currentB}）`;
    document.getElementById("answerInput").style.display = "none";
    document.getElementById("answerInputA").style.display = "inline";
    document.getElementById("answerInputB").style.display = "inline";
  } else {
    types = ["y", "a", "b"];
    questionType = types[randInt(0, types.length - 1)];

    let questionText = "";
    if (questionType === "y") {
      questionText = `y = ${currentA}x + ${currentB} のとき、x = ${currentX} の y の値は？`;
      document.getElementById("answerInput").placeholder = "yの値を入力";
    } else if (questionType === "a") {
      questionText = `x = ${currentX} のとき、y = ${currentY} となる一次関数 y = ax + ${currentB} の傾き a の値は？`;
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
}

function checkAnswer() {
  const difficulty = document.getElementById("difficulty") ? document.getElementById("difficulty").value : "easy";
  const resultDiv = document.getElementById("answerResult");
  let isCorrect = false;

  if (difficulty === "easy" && questionType === "ab") {
    const userA = Number(document.getElementById("answerInputA").value);
    const userB = Number(document.getElementById("answerInputB").value);
    isCorrect = (userA === currentA && userB === currentB);
    if (isCorrect) {
      resultDiv.textContent = "正解！";
      resultDiv.style.color = "green";
    } else {
      resultDiv.textContent = `不正解… 正しい答えは a=${currentA}、b=${currentB} です。`;
      resultDiv.style.color = "red";
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
      resultDiv.textContent = "正解！";
      resultDiv.style.color = "green";
    } else {
      resultDiv.textContent = `不正解… 正しい答えは ${ansLabel} = ${correctAns} です。`;
      resultDiv.style.color = "red";
    }
  }

  // 間違った問題の記録
  if (quizMode) {
    if (isCorrect) correctCount++;
    else {
      wrongProblems.push({
        a: currentA,
        b: currentB,
        x: currentX,
        y: currentY,
        type: questionType,
        difficulty: difficulty
      });
    }
    setTimeout(nextQuizQuestion, 1000);
  }
}

// 間違えた問題の類似問題を出す
function showSimilarProblem() {
  if (wrongProblems.length === 0) {
    alert("類似問題はありません！");
    return;
  }
  // 最新の間違い問題のデータを使う
  const p = wrongProblems[wrongProblems.length - 1];
  // 類似問題生成（xをランダムで変える。a,b,typeは同じ）
  let newX = randInt(-10, 10);
  let newY = p.a * newX + p.b;
  currentA = p.a;
  currentB = p.b;
  currentX = newX;
  currentY = newY;
  questionType = p.type;

  let questionText = "";
  if (questionType === "y") {
    questionText = `y = ${currentA}x + ${currentB} のとき、x = ${currentX} の y の値は？`;
    document.getElementById("answerInput").placeholder = "yの値を入力";
    document.getElementById("answerInput").style.display = "inline";
    document.getElementById("answerInputA").style.display = "none";
    document.getElementById("answerInputB").style.display = "none";
  } else if (questionType === "a") {
    questionText = `x = ${currentX} のとき、y = ${currentY} となる一次関数 y = ax + ${currentB} の傾き a の値は？`;
    document.getElementById("answerInput").placeholder = "傾きを入力";
    document.getElementById("answerInput").style.display = "inline";
    document.getElementById("answerInputA").style.display = "none";
    document.getElementById("answerInputB").style.display = "none";
  } else if (questionType === "b") {
    questionText = `x = ${currentX} のとき、y = ${newY} となる一次関数 y = ${currentA}x + b の切片 b の値は？`;
    document.getElementById("answerInput").placeholder = "切片を入力";
    document.getElementById("answerInput").style.display = "inline";
    document.getElementById("answerInputA").style.display = "none";
    document.getElementById("answerInputB").style.display = "none";
  } else if (questionType === "ab") {
    questionText = `一次関数の式「y = ax + b」のa（傾き）とb（切片）を答えてください。\n（例：y = ${currentA}x + ${currentB}）`;
    document.getElementById("answerInput").style.display = "none";
    document.getElementById("answerInputA").style.display = "inline";
    document.getElementById("answerInputB").style.display = "inline";
  }
  document.getElementById("question").textContent = questionText;
  document.getElementById("answerInput").value = "";
  document.getElementById("answerInputA").value = "";
  document.getElementById("answerInputB").value = "";
  document.getElementById("answerResult").textContent = "";
  document.getElementById("checkBtn").style.display = "inline";
  document.getElementById("questionNumber").textContent = "【類似問題】";
}

// グラフ問題
function generateGraphQuestion() {
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
        tension: 0  // 直線
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

        // x軸（正の方向）
        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(chartArea.right - 15, yZero);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        // x軸矢印ヘッド（正）
        ctx.beginPath();
        ctx.moveTo(chartArea.right - 15, yZero);
        ctx.lineTo(chartArea.right - 25, yZero - 7);
        ctx.lineTo(chartArea.right - 25, yZero + 7);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        // x軸（負の方向）
        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(chartArea.left + 15, yZero);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        // x軸矢印ヘッド（負）
        ctx.beginPath();
        ctx.moveTo(chartArea.left + 15, yZero);
        ctx.lineTo(chartArea.left + 25, yZero - 7);
        ctx.lineTo(chartArea.left + 25, yZero + 7);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        // y軸（正の方向）
        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(xZero, chartArea.top + 15);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        // y軸矢印ヘッド（正）
        ctx.beginPath();
        ctx.moveTo(xZero, chartArea.top + 15);
        ctx.lineTo(xZero - 7, chartArea.top + 25);
        ctx.lineTo(xZero + 7, chartArea.top + 25);
        ctx.closePath();
        ctx.fillStyle = "black";
        ctx.fill();

        // y軸（負の方向）
        ctx.beginPath();
        ctx.moveTo(xZero, yZero);
        ctx.lineTo(xZero, chartArea.bottom - 15);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.stroke();
        // y軸矢印ヘッド（負）
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

  document.getElementById("graphProblem").textContent =
    `上のグラフの一次関数：傾き(a)と切片(b)を答えてください。`;

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
    resultDiv.textContent = "正解！";
    resultDiv.style.color = "green";
  } else {
    resultDiv.textContent = `不正解… 正しい答えは 傾き(a)=${graphA}、切片(b)=${graphB} です。`;
    resultDiv.style.color = "red";
  }
}
