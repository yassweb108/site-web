(() => {
  const canvas = document.querySelector('#game');
  const ctx = canvas.getContext('2d');
  const scoreElement = document.querySelector('#score');
  const bestElement = document.querySelector('#best');
  const message = document.querySelector('#screen-message');
  const messageTitle = document.querySelector('#message-title');
  const messageText = document.querySelector('#message-text');
  const startButton = document.querySelector('#start-button');
  const pauseButton = document.querySelector('#pause-button');
  const statusText = document.querySelector('#status-text');
  const statusDot = document.querySelector('#status-dot');

  const cells = 20;
  const cellSize = canvas.width / cells;
  const directions = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
    left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };
  let snake;
  let direction;
  let nextDirection;
  let food;
  let score = 0;
  let best = Number(localStorage.getItem('snake-best') || 0);
  let timer = null;
  let running = false;
  let gameOver = false;

  bestElement.textContent = best;
  draw();

  function placeFood() {
    let candidate;
    do {
      candidate = { x: Math.floor(Math.random() * cells), y: Math.floor(Math.random() * cells) };
    } while (snake.some((segment) => segment.x === candidate.x && segment.y === candidate.y));
    return candidate;
  }

  function newGame() {
    snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    direction = directions.right;
    nextDirection = direction;
    score = 0;
    scoreElement.textContent = score;
    food = placeFood();
    gameOver = false;
    running = true;
    pauseButton.disabled = false;
    pauseButton.innerHTML = 'Ⅱ <span>Pause</span>';
    startButton.innerHTML = '↻ <span>Recommencer</span>';
    statusText.textContent = 'En cours';
    statusDot.classList.add('active');
    message.classList.add('hidden');
    clearInterval(timer);
    timer = setInterval(tick, 115);
    draw();
  }

  function setPaused(paused) {
    running = !paused;
    clearInterval(timer);
    if (running) {
      timer = setInterval(tick, 115);
      pauseButton.innerHTML = 'Ⅱ <span>Pause</span>';
      statusText.textContent = 'En cours';
      statusDot.classList.add('active');
      message.classList.add('hidden');
    } else {
      pauseButton.innerHTML = '▶ <span>Reprendre</span>';
      statusText.textContent = 'En pause';
      statusDot.classList.remove('active');
      showMessage('En pause', 'Appuie sur Reprendre pour continuer');
    }
  }

  function showMessage(title, text) {
    messageTitle.textContent = title;
    messageText.textContent = text;
    message.classList.remove('hidden');
  }

  function endGame() {
    running = false;
    gameOver = true;
    clearInterval(timer);
    pauseButton.disabled = true;
    statusText.textContent = 'Partie terminée';
    statusDot.classList.remove('active');
    startButton.innerHTML = '↻ <span>Rejouer</span>';
    showMessage('Perdu !', `Score : ${score} · Appuie sur Rejouer`);
  }

  function tick() {
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const ateFood = head.x === food.x && head.y === food.y;
    const bodyToCheck = ateFood ? snake : snake.slice(0, -1);
    if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells || bodyToCheck.some((part) => part.x === head.x && part.y === head.y)) {
      endGame();
      draw();
      return;
    }
    snake.unshift(head);
    if (ateFood) {
      score += 1;
      scoreElement.textContent = score;
      if (score > best) {
        best = score;
        bestElement.textContent = best;
        localStorage.setItem('snake-best', best);
      }
      food = placeFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    ctx.fillStyle = '#131927';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#ffffff08';
    ctx.lineWidth = 1;
    for (let i = 1; i < cells; i += 1) {
      ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, canvas.height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(canvas.width, i * cellSize); ctx.stroke();
    }
    if (!snake || !food) return;
    ctx.fillStyle = '#ff7185';
    ctx.beginPath();
    ctx.arc(food.x * cellSize + cellSize / 2, food.y * cellSize + cellSize / 2, cellSize * .34, 0, Math.PI * 2);
    ctx.fill();
    snake.forEach((part, index) => {
      const inset = 2;
      ctx.fillStyle = index === 0 ? '#c1ff91' : '#8dd95d';
      ctx.beginPath();
      ctx.roundRect(part.x * cellSize + inset, part.y * cellSize + inset, cellSize - inset * 2, cellSize - inset * 2, 5);
      ctx.fill();
    });
  }

  function changeDirection(name) {
    const chosen = directions[name];
    if (!chosen) return;
    if (!running && !gameOver) newGame();
    if (!running) return;
    if (chosen.x + direction.x === 0 && chosen.y + direction.y === 0) return;
    nextDirection = chosen;
  }

  document.addEventListener('keydown', (event) => {
    const keys = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
    if (keys[event.key]) {
      event.preventDefault();
      if (!running && !gameOver) newGame();
      changeDirection(keys[event.key]);
    } else if (event.code === 'Space') {
      event.preventDefault();
      if (gameOver) newGame();
      else if (!running && snake) setPaused(false);
      else if (!running) newGame();
      else setPaused(true);
    }
  });
  document.querySelectorAll('[data-direction]').forEach((button) => {
    button.addEventListener('click', () => changeDirection(button.dataset.direction));
  });
  startButton.addEventListener('click', newGame);
  pauseButton.addEventListener('click', () => {
    if (!running && snake && !gameOver) setPaused(false);
    else if (running) setPaused(true);
  });
})();
