
const STORAGE_KEY = 'todos-v2-advanced';
const GOALS_KEY = 'annual-goals-v1';
let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let goals = JSON.parse(localStorage.getItem(GOALS_KEY) || '[]');
let isListening = false;


// --- Todoリスト要素 ---
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const deadlineInput = document.getElementById('deadline-input');
const list = document.getElementById('todo-list');
const voiceBtn = document.getElementById('voice-btn');

// --- 年間目標リスト要素（PC） ---
const goalForm = document.getElementById('goal-form');
const goalInput = document.getElementById('goal-input');
const goalList = document.getElementById('goal-list');

// --- 年間目標リスト要素（スマホ新UI） ---
const goalFloatBar = document.getElementById('goal-float-bar');
const goalFloatExpand = document.getElementById('goal-float-expand');
const goalFloatCollapse = document.getElementById('goal-float-collapse');
const goalFloatBarBody = goalFloatBar ? goalFloatBar.querySelector('.goal-float-bar-body') : null;
const goalFloatForm = document.getElementById('goal-float-form');
const goalFloatInput = document.getElementById('goal-float-input');
const goalFloatList = document.getElementById('goal-float-list');

// 音声認識の初期化
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.lang = 'ja-JP';
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    isListening = true;
    voiceBtn.classList.add('recording');
    voiceBtn.textContent = '🎙️ 録音中...';
  };

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        input.value = transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    if (interimTranscript) {
      input.placeholder = interimTranscript;
    }
  };

  recognition.onend = () => {
    isListening = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.textContent = '🎙️';
  };

  recognition.onerror = (event) => {
    console.error('音声認識エラー:', event.error);
    voiceBtn.classList.remove('recording');
    voiceBtn.textContent = '🎙️';
  };
}

voiceBtn.addEventListener('click', () => {
  if (!recognition) {
    alert('お使いのブラウザは音声入力に対応していません。');
    return;
  }
  if (isListening) {
    recognition.stop();
  } else {
    recognition.start();
  }
});


function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
function saveGoals() {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}
// 年間目標削除モーダル制御
let goalDeleteIndex = null;
const goalDeleteModal = document.getElementById('goal-delete-modal');
const goalModalCancel = document.getElementById('goal-modal-cancel');
const goalModalDelete = document.getElementById('goal-modal-delete');

function openGoalDeleteModal(index) {
  goalDeleteIndex = index;
  if (goalDeleteModal) goalDeleteModal.classList.add('active');
}
function closeGoalDeleteModal() {
  goalDeleteIndex = null;
  if (goalDeleteModal) goalDeleteModal.classList.remove('active');
}
if (goalModalCancel) {
  goalModalCancel.addEventListener('click', closeGoalDeleteModal);
}
if (goalModalDelete) {
  goalModalDelete.addEventListener('click', () => {
    if (goalDeleteIndex !== null) {
      goals.splice(goalDeleteIndex, 1);
      saveGoals();
      renderGoals();
      renderGoalsFloat();
    }
    closeGoalDeleteModal();
  });
}

// 年間目標リストの描画（PC）
function renderGoals() {
  if (!goalList) return;
  goalList.innerHTML = '';
  goals.forEach((g, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'goal-text';
    span.textContent = g.text;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.title = '削除';
    del.addEventListener('click', () => {
      openGoalDeleteModal(i);
    });
    li.appendChild(span);
    li.appendChild(del);
    goalList.appendChild(li);
  });
}

// 年間目標リストの描画（スマホ・フローティングバー新UI）
function renderGoalsFloat() {
  if (!goalFloatList) return;
  goalFloatList.innerHTML = '';
  goals.forEach((g, i) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'goal-text';
    span.textContent = g.text;
    const del = document.createElement('button');
    del.textContent = '✕';
    del.title = '削除';
    del.addEventListener('click', () => {
      openGoalDeleteModal(i);
    });
    li.appendChild(span);
    li.appendChild(del);
    goalFloatList.appendChild(li);
  });
}

// 年間目標追加（PC）
if (goalForm) {
  goalForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = goalInput.value.trim();
    if (!text) return;
    goals.push({ text, done: false, id: Date.now() });
    goalInput.value = '';
    saveGoals();
    renderGoals();
    renderGoalsFloat();
    goalInput.focus();
  });
}

// 年間目標追加（スマホ・フローティング）
if (goalFloatForm) {
  goalFloatForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = goalFloatInput.value.trim();
    if (!text) return;
    goals.push({ text, done: false, id: Date.now() });
    goalFloatInput.value = '';
    saveGoals();
    renderGoals();
    renderGoalsFloat();
    goalFloatInput.focus();
  });
}


// 新スマホ用フローティングバー開閉制御
if (goalFloatBar && goalFloatExpand && goalFloatCollapse && goalFloatBarBody) {
  // 初期状態: minimized
  goalFloatBar.classList.add('minimized');
  goalFloatBar.classList.remove('expanded');
  goalFloatBarBody.style.display = 'none';
  goalFloatExpand.style.display = 'inline-flex';
  goalFloatCollapse.style.display = 'none';

  goalFloatExpand.addEventListener('click', () => {
    goalFloatBar.classList.remove('minimized');
    goalFloatBar.classList.add('expanded');
    goalFloatBarBody.style.display = 'block';
    goalFloatExpand.style.display = 'none';
    goalFloatCollapse.style.display = 'inline-flex';
  });
  goalFloatCollapse.addEventListener('click', () => {
    goalFloatBar.classList.add('minimized');
    goalFloatBar.classList.remove('expanded');
    goalFloatBarBody.style.display = 'none';
    goalFloatExpand.style.display = 'inline-flex';
    goalFloatCollapse.style.display = 'none';
  });
}

// 初期描画
renderGoals();
renderGoalsFloat();

function getUrgencyLevel(deadline) {
  if (!deadline) return 0;
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diffMs = deadlineDate - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 1) return 3; // 赤（1日以内）
  if (diffDays < 3) return 2; // 黄（3日以内）
  return 1;
}

function formatDeadline(deadline) {
  if (!deadline) return '';
  const date = new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
  
  let label = '';
  if (diff === 0) label = '今日';
  else if (diff === 1) label = '明日';
  else if (diff === -1) label = '昨日';
  else if (diff < 0) label = `${Math.abs(diff)}日前`;
  else label = `${diff}日後`;
  
  return `📅 ${label} (${date.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })})`;
}

function sortTodos() {
  // 未完了と完了を分ける
  const incomplete = todos.filter(t => !t.done);
  const complete = todos.filter(t => t.done);
  
  // 未完了を締め切りでソート（近い順）
  incomplete.sort((a, b) => {
    const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return aDeadline - bDeadline;
  });
  
  todos = [...incomplete, ...complete];
}

function render() {
  sortTodos();
  list.innerHTML = '';
  
  todos.forEach((t, i) => {
    const li = document.createElement('li');
    const urgency = getUrgencyLevel(t.deadline);
    
    if (t.done) {
      li.classList.add('done');
    } else {
      if (urgency === 3) li.classList.add('urgent');
      else if (urgency === 2) li.classList.add('warning');
    }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !!t.done;
    checkbox.addEventListener('change', () => {
      t.done = checkbox.checked;
      save();
      render();
    });

    const content = document.createElement('div');
    content.className = 'todo-content';
    
    const span = document.createElement('span');
    span.className = 'todo-text';
    span.textContent = t.text;

    const deadlineSpan = document.createElement('span');
    deadlineSpan.className = 'todo-deadline';
    deadlineSpan.textContent = formatDeadline(t.deadline);

    content.appendChild(span);
    if (t.deadline) content.appendChild(deadlineSpan);

    const del = document.createElement('button');
    del.textContent = '削除';
    del.addEventListener('click', () => {
      todos.splice(i, 1);
      save();
      render();
    });

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(del);
    list.appendChild(li);
  });
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  
  const deadline = deadlineInput.value || null;
  
  todos.push({
    text,
    deadline,
    done: false,
    id: Date.now(),
  });
  
  input.value = '';
  input.placeholder = '新しいタスクを入力';
  deadlineInput.value = '';
  save();
  render();
  input.focus();
});

render();

