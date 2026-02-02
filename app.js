const fileInput = document.getElementById("fileInput");
const manualInput = document.getElementById("manualInput");
const importBtn = document.getElementById("importBtn");
const drawBtn = document.getElementById("drawBtn");
const resetBtn = document.getElementById("resetBtn");
const stageName = document.getElementById("stageName");
const count = document.getElementById("count");
const winnerCount = document.getElementById("winnerCount");
const winnerList = document.getElementById("winnerList");

const state = {
  participants: [],
  winners: [],
  rolling: false,
  intervalId: null,
};

const parseLines = (text) => {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, id] = line.split(/[,，]/).map((part) => part.trim());
      return { name, id: id || "" };
    });
};

const renderStats = () => {
  count.textContent = state.participants.length;
  winnerCount.textContent = state.winners.length;
};

const renderWinners = () => {
  winnerList.innerHTML = "";
  state.winners.forEach((winner, index) => {
    const li = document.createElement("li");
    const label = document.createElement("div");
    label.textContent = `${index + 1}. ${winner.name}`;

    const meta = document.createElement("span");
    meta.textContent = winner.id ? `工号 ${winner.id}` : "幸运星";

    li.append(label, meta);
    winnerList.appendChild(li);
  });
};

const addParticipants = (items) => {
  const existing = new Set(state.participants.map((p) => p.name));
  const merged = items.filter((item) => !existing.has(item.name));
  state.participants = [...state.participants, ...merged];
  renderStats();
};

const stopRolling = () => {
  state.rolling = false;
  clearInterval(state.intervalId);
  state.intervalId = null;
  drawBtn.textContent = "立即抽奖";
};

const startRolling = () => {
  if (state.participants.length === 0) {
    stageName.textContent = "请先导入名单";
    return;
  }

  if (state.rolling) {
    const winner = state.participants[Math.floor(Math.random() * state.participants.length)];
    state.winners.unshift(winner);
    state.participants = state.participants.filter((p) => p !== winner);
    stopRolling();
    stageName.textContent = winner.name;
    renderStats();
    renderWinners();
    return;
  }

  state.rolling = true;
  drawBtn.textContent = "停止";
  state.intervalId = setInterval(() => {
    const pick = state.participants[Math.floor(Math.random() * state.participants.length)];
    stageName.textContent = pick.name;
  }, 80);
};

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const text = await file.text();
  addParticipants(parseLines(text));
  manualInput.value = "";
});

importBtn.addEventListener("click", () => {
  if (!manualInput.value.trim()) return;
  addParticipants(parseLines(manualInput.value));
  manualInput.value = "";
});

drawBtn.addEventListener("click", startRolling);

resetBtn.addEventListener("click", () => {
  stopRolling();
  state.participants = [];
  state.winners = [];
  stageName.textContent = "等待抽奖";
  manualInput.value = "";
  fileInput.value = "";
  renderStats();
  renderWinners();
});

renderStats();
