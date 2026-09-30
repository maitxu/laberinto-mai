/*
 * app.js
 * Gestión de interfaz, tablero, escenarios, dibujo y animación.
 */

const ROWS = 20;
const COLS = 20;

const mazeElement = document.getElementById("maze");
const speedElement = document.getElementById("speed");
const speedValueElement = document.getElementById("speedValue");
const showExplorationElement = document.getElementById("showExploration");

const runBtn = document.getElementById("runBtn");
const compareBtn = document.getElementById("compareBtn");
const pauseBtn = document.getElementById("pauseBtn");
const randomBtn = document.getElementById("randomBtn");
const clearBtn = document.getElementById("clearBtn");

const tileWeightElement = document.getElementById("tileWeight");
const goalCostElement = document.getElementById("goalCost");
const randomGoalsElement = document.getElementById("randomGoals");

const statusElement = document.querySelector("#status span");
const resultCardsElement = document.getElementById("resultCards");

let grid = [];
let start = { row: 1, col: 1 };
let goals = [{ row: ROWS - 2, col: COLS - 2, cost: 10 }];
let selectedGoal = 0;

let selectedTool = "wall";
let running = false;
let paused = false;
let pauseResolver = null;
let animationToken = 0;

let pointerDrawing = false;

/* ================= UTILIDADES ================= */

const algorithmNames = {
  bfs: "BFS",
  dfs: "DFS",
  ucs: "Coste uniforme",
  astar: "A*"
};

function createEmptyGrid() {
  grid = [];

  for (let row = 0; row < ROWS; row++) {
    const current = [];

    for (let col = 0; col < COLS; col++) {
      current.push({
        row,
        col,
        wall: false,
        weight: 1,
        goalCost: 0
      });
    }

    grid.push(current);
  }
}

function isStart(row, col) {
  return row === start.row && col === start.col;
}

function getGoalAt(row, col) {
  return goals.find(goal => goal.row === row && goal.col === col);
}

function getPrimaryGoal() {
  return goals[selectedGoal] || goals[0];
}

function setStatus(text) {
  statusElement.textContent = text;
}

function clearVisualization() {
  document.querySelectorAll(".node.explored, .node.path").forEach(cell => {
    cell.classList.remove("explored", "path");
  });
}

function clearResults() {
  resultCardsElement.innerHTML =
    '<p class="empty">Ejecuta un algoritmo para ver sus resultados.</p>';
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitIfPaused() {
  if (!paused) return;

  await new Promise(resolve => {
    pauseResolver = resolve;
  });

  pauseResolver = null;
}

function getSelectedAlgorithm() {
  return document.getElementById("algorithm").value;
}

function getCell(row, col) {
  return mazeElement.querySelector(
    `.node[data-row="${row}"][data-col="${col}"]`
  );
}

/* ================= RENDER ================= */

function renderGrid() {
  mazeElement.innerHTML = "";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const data = grid[row][col];
      const cell = document.createElement("div");

      cell.className = "node";
      cell.dataset.row = row;
      cell.dataset.col = col;

      if (data.wall) {
        cell.classList.add("wall");
      }

      if (data.weight > 1 && !data.wall) {
        cell.classList.add("weight");
        cell.dataset.weight = data.weight;
      }

      if (isStart(row, col)) {
        cell.classList.add("start");
      }

      const goal = getGoalAt(row, col);

      if (goal) {
        cell.classList.add("goal");

        if (goal.cost > 0) {
          cell.classList.add("goal-weight");
          cell.dataset.goalCost = goal.cost;
        }
      }

      mazeElement.appendChild(cell);
    }
  }
}

/* ================= HERRAMIENTAS DE DIBUJO ================= */

function setTool(tool) {
  selectedTool = tool;

  document.querySelectorAll(".tool-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tool === tool
    );
  });

  const names = {
    wall: "Obstáculo seleccionado.",
    erase: "Borrar seleccionado.",
    start: "Inicio seleccionado.",
    goal: "Meta seleccionada.",
    weight: "Peso seleccionado."
  };

  setStatus(names[tool]);
}

function applyTool(row, col) {
  if (running) return;

  const cell = grid[row][col];

  if (selectedTool === "wall") {
    if (!isStart(row, col) && !getGoalAt(row, col)) {
      cell.wall = true;
      cell.weight = 1;
    }
  }

  if (selectedTool === "erase") {
    cell.wall = false;
    cell.weight = 1;
    cell.goalCost = 0;

    goals = goals.filter(goal => !(goal.row === row && goal.col === col));

    if (!goals.length) {
      goals.push({
        row: ROWS - 2,
        col: COLS - 2,
        cost: Number(goalCostElement.value)
      });
    }

    selectedGoal = Math.min(selectedGoal, goals.length - 1);
  }

  if (selectedTool === "start") {
    if (!getGoalAt(row, col)) {
      start = { row, col };
      cell.wall = false;
      cell.weight = 1;
    }
  }

  if (selectedTool === "goal") {
    if (!isStart(row, col)) {
      cell.wall = false;

      const existing = getGoalAt(row, col);

      if (existing) {
        selectedGoal = goals.indexOf(existing);
      } else {
        goals.push({
          row,
          col,
          cost: Number(goalCostElement.value)
        });

        selectedGoal = goals.length - 1;
      }
    }
  }

  if (selectedTool === "weight") {
    if (!isStart(row, col) && !getGoalAt(row, col)) {
      cell.wall = false;
      cell.weight = Math.max(1, Number(tileWeightElement.value) || 1);
    }
  }

  renderGrid();
}

/* ================= ANIMACIÓN ================= */

async function animateResult(result, name, token) {
  const delay = Number(speedElement.value);

  if (showExplorationElement.checked) {
    for (const node of result.explored) {
      if (token !== animationToken) return false;

      await waitIfPaused();

      const cell = getCell(node.row, node.col);

      if (
        cell &&
        !cell.classList.contains("start") &&
        !cell.classList.contains("goal")
      ) {
        cell.classList.add("explored");
      }

      await sleep(delay);
    }
  }

  if (token !== animationToken) return false;

  for (const node of result.path) {
    if (token !== animationToken) return false;

    await waitIfPaused();

    const cell = getCell(node.row, node.col);

    if (
      cell &&
      !cell.classList.contains("start") &&
      !cell.classList.contains("goal")
    ) {
      cell.classList.remove("explored");
      cell.classList.add("path");
    }

    await sleep(Math.max(25, delay / 2));
  }

  return true;
}

/* ================= EJECUCIÓN ================= */

function getAlgorithmFunction(name) {
  return {
    bfs,
    dfs,
    ucs: uniformCostSearch,
    astar: aStar
  }[name];
}

function executeAlgorithm(name, targetGoal) {
  const algorithm = getAlgorithmFunction(name);

  /*
   * Los algoritmos trabajan con una sola meta durante una ejecución.
   */
  return algorithm(
    grid,
    { ...start },
    { row: targetGoal.row, col: targetGoal.col }
  );
}

async function runAlgorithm() {
  if (running) return;

  running = true;
  paused = false;
  animationToken++;

  clearVisualization();
  clearResults();
  updateButtons();

  const name = getSelectedAlgorithm();
  const target = getPrimaryGoal();

  setStatus(`Ejecutando ${algorithmNames[name]}...`);

  const result = executeAlgorithm(name, target);
  const token = animationToken;

  const completed = await animateResult(
    result,
    algorithmNames[name],
    token
  );

  if (!completed) {
    running = false;
    updateButtons();
    return;
  }

  showResults([{
    name: algorithmNames[name],
    result
  }]);

  setStatus(
    result.found
      ? `${algorithmNames[name]} ha encontrado la meta.`
      : `${algorithmNames[name]} no ha encontrado un camino.`
  );

  running = false;
  updateButtons();
}

async function compareAll() {
  if (running) return;

  running = true;
  paused = false;
  animationToken++;

  clearVisualization();
  clearResults();
  updateButtons();

  const names = ["bfs", "dfs", "ucs", "astar"];
  const results = [];
  const target = getPrimaryGoal();

  /*
   * Todos los algoritmos reciben el mismo tablero y la misma meta.
   */
  for (const name of names) {
    results.push({
      name: algorithmNames[name],
      result: executeAlgorithm(name, target)
    });
  }

  for (const item of results) {
    clearVisualization();

    setStatus(`Mostrando ${item.name}...`);

    const completed = await animateResult(
      item.result,
      item.name,
      animationToken
    );

    if (!completed) {
      running = false;
      updateButtons();
      return;
    }

    await sleep(350);
  }

  showResults(results);

  setStatus("Comparación terminada.");
  running = false;
  updateButtons();
}

function showResults(items) {
  resultCardsElement.innerHTML = "";

  items.forEach(item => {
    const result = item.result;

    const card = document.createElement("article");
    card.className = "result-card";

    const cost = result.found
      ? result.cost
      : "—";

    card.innerHTML = `
      <h3>${item.name}</h3>

      <div class="metric">
        <span>Encontrado</span>
        <b>${result.found ? "Sí" : "No"}</b>
      </div>

      <div class="metric">
        <span>Explorados</span>
        <b>${result.explored.length}</b>
      </div>

      <div class="metric">
        <span>Pasos</span>
        <b>${result.found ? result.path.length - 1 : "—"}</b>
      </div>

      <div class="metric">
        <span>Coste</span>
        <b>${cost}</b>
      </div>
    `;

    resultCardsElement.appendChild(card);
  });
}

/* ================= ESCENARIOS ================= */

function resetScenario() {
  createEmptyGrid();

  start = { row: 1, col: 1 };
  goals = [{
    row: ROWS - 2,
    col: COLS - 2,
    cost: Number(goalCostElement.value) || 10
  }];

  selectedGoal = 0;
}

function scenarioSteps() {
  resetScenario();

  /*
   * Tablero completamente limpio:
   * permite observar la diferencia básica entre algoritmos.
   */
  renderGrid();
  setStatus("Escenario: Menos pasos.");
}

function scenarioWeights() {
  resetScenario();

  /*
   * Creamos una zona de pesos altos que obliga a Coste Uniforme
   * y A* a tener en cuenta el coste, no solamente los pasos.
   */
  for (let col = 4; col <= 19; col++) {
    for (let row = 7; row <= 11; row++) {
      grid[row][col].weight = 8;
    }
  }

  renderGrid();
  setStatus("Escenario: Pesos.");
}

function scenarioGoals() {
  resetScenario();

  /*
   * Varias metas. La meta más cercana tendrá un coste alto.
   * La meta algo más alejada tendrá un coste menor.
   */
  goals = [
    {
      row: 4,
      col: 17,
      cost: 50
    },
    {
      row: 15,
      col: 17,
      cost: 2
    }
  ];

  selectedGoal = 0;

  renderGrid();
  setStatus(
    "Escenario: Metas con costes. Selecciona una meta para ejecutar."
  );
}

function scenarioNoSolution() {
  resetScenario();

  /*
   * Barrera completa en una fila interior.
   */
  const barrierRow = Math.floor(ROWS / 2);

  for (let col = 1; col < COLS - 1; col++) {
    grid[barrierRow][col].wall = true;
  }

  /*
   * Inicio arriba y meta abajo.
   */
  start = {
    row: 2,
    col: Math.floor(COLS / 2)
  };

  goals = [{
    row: ROWS - 3,
    col: Math.floor(COLS / 2),
    cost: 10
  }];

  grid[start.row][start.col].wall = false;
  grid[goals[0].row][goals[0].col].wall = false;

  renderGrid();
  setStatus("Escenario: Sin solución.");
}

function randomMaze() {
  animationToken++;
  running = false;
  paused = false;

  createEmptyGrid();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const border =
        row === 0 ||
        row === ROWS - 1 ||
        col === 0 ||
        col === COLS - 1;

      if (border) {
        grid[row][col].wall = true;
      } else {
        grid[row][col].wall = Math.random() < .24;
      }
    }
  }

  start = { row: 1, col: 1 };

  goals = [{
    row: ROWS - 2,
    col: COLS - 2,
    cost: Number(goalCostElement.value) || 10
  }];

  grid[start.row][start.col].wall = false;
  grid[goals[0].row][goals[0].col].wall = false;

  [
    { row: 1, col: 2 },
    { row: 2, col: 1 },
    { row: ROWS - 2, col: COLS - 3 },
    { row: ROWS - 3, col: COLS - 2 }
  ].forEach(position => {
    grid[position.row][position.col].wall = false;
  });

  clearVisualization();
  clearResults();
  renderGrid();

  setStatus("Nuevo laberinto aleatorio generado.");
  updateButtons();
}

function clearMaze() {
  animationToken++;
  running = false;
  paused = false;

  resetScenario();

  clearVisualization();
  clearResults();
  renderGrid();

  setStatus("Tablero limpio.");
  updateButtons();
}

/* ================= PAUSA ================= */

function togglePause() {
  if (!running) return;

  paused = !paused;

  if (!paused && pauseResolver) {
    pauseResolver();
  }

  setStatus(
    paused
      ? "Animación pausada."
      : "Animación continuando..."
  );

  updateButtons();
}

/* ================= BOTONES ================= */

function updateButtons() {
  runBtn.disabled = running;
  compareBtn.disabled = running;
  randomBtn.disabled = running;
  clearBtn.disabled = running;

  pauseBtn.disabled = !running;
  pauseBtn.textContent = paused
    ? "▶ Continuar"
    : "⏸ Pausar";
}

/* ================= EVENTOS DE TABLERO ================= */

function getCellData(event) {
  const cell = event.target.closest(".node");

  if (!cell) return null;

  return {
    row: Number(cell.dataset.row),
    col: Number(cell.dataset.col)
  };
}

mazeElement.addEventListener("pointerdown", event => {
  if (running) return;

  const data = getCellData(event);
  if (!data) return;

  pointerDrawing = true;
  mazeElement.setPointerCapture(event.pointerId);

  applyTool(data.row, data.col);
});

mazeElement.addEventListener("pointermove", event => {
  if (running || !pointerDrawing) return;

  const data = getCellData(event);
  if (!data) return;

  /*
   * Para Inicio y Meta solo usamos la primera celda.
   * Para Obstáculo, Borrar y Peso permitimos arrastrar.
   */
  if (selectedTool === "wall" ||
      selectedTool === "erase" ||
      selectedTool === "weight") {
    applyTool(data.row, data.col);
  }
});

mazeElement.addEventListener("pointerup", () => {
  pointerDrawing = false;
});

mazeElement.addEventListener("pointercancel", () => {
  pointerDrawing = false;
});

/* ================= EVENTOS UI ================= */

document.querySelectorAll(".tool-btn").forEach(button => {
  button.addEventListener("click", () => {
    setTool(button.dataset.tool);
  });
});

document.querySelectorAll(".scenario-btn").forEach(button => {
  button.addEventListener("click", () => {
    const scenario = button.dataset.scenario;

    animationToken++;
    running = false;
    paused = false;

    if (scenario === "steps") scenarioSteps();
    if (scenario === "weights") scenarioWeights();
    if (scenario === "goals") scenarioGoals();
    if (scenario === "no-solution") scenarioNoSolution();

    clearVisualization();
    clearResults();
    updateButtons();
  });
});

speedElement.addEventListener("input", () => {
  speedValueElement.textContent =
    `${speedElement.value} ms`;
});

runBtn.addEventListener("click", runAlgorithm);
compareBtn.addEventListener("click", compareAll);
pauseBtn.addEventListener("click", togglePause);
randomBtn.addEventListener("click", randomMaze);
clearBtn.addEventListener("click", clearMaze);

/*
 * Si cambia el coste de la meta, actualizamos
 * las metas existentes.
 */
goalCostElement.addEventListener("change", () => {
  const cost = Number(goalCostElement.value) || 0;

  goals.forEach(goal => {
    goal.cost = cost;
  });

  renderGrid();
});

/* ================= INICIO ================= */

createEmptyGrid();
scenarioSteps();
updateButtons();
