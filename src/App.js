import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import './index.css';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const priorities = ['Low', 'Medium', 'High'];
const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Other'];
const taskColors = ['#1E88E5', '#00BCD4', '#0D47A1', '#26C6DA', '#00897B', '#1565C0', '#42A5F5', '#FF6B6B'];

export default function TodoDashboard() {
  // State management
  const [todos, setTodos] = useState([]);
  const [removedTodos, setRemovedTodos] = useState([]);
  const [scope, setScope] = useState('Daily');
  const [view, setView] = useState('pending');
  
  // Task input states
  const [task, setTask] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [date, setDate] = useState('');
  const [repeatDays, setRepeatDays] = useState([]);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Personal');
  const [taskColor, setTaskColor] = useState('#1E88E5');
  const [notes, setNotes] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('1');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showStats, setShowStats] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [expandedTodo, setExpandedTodo] = useState(null);
  // Theme: 'dark' (default) or 'light'
  const [theme, setTheme] = useState('dark');
  // Global shortcuts toolbar
  const [globalShortcutText, setGlobalShortcutText] = useState('');
  
  // Undo/Redo
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  
  // Pomodoro timer
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [selectedTodoForPomodoro, setSelectedTodoForPomodoro] = useState(null);
  const pomodoroRef = useRef(null);
  
  // Stats
  const [dailyGoal, setDailyGoal] = useState(5);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayDay = weekDays[today.getDay()];

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('myTodos');
    const removedStored = localStorage.getItem('removedTodos');
    const streakStored = localStorage.getItem('streak');
    const achievementsStored = localStorage.getItem('achievements');

    if (stored) setTodos(JSON.parse(stored));
    if (removedStored) setRemovedTodos(JSON.parse(removedStored));
    if (streakStored) setStreak(parseInt(streakStored));
    if (achievementsStored) setAchievements(JSON.parse(achievementsStored));

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          document.getElementById('taskInput')?.focus();
        }
        if (e.key === 'z') {
          e.preventDefault();
          handleUndo();
        }
        if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
        if (e.key === 's') {
          e.preventDefault();
          saveTasks();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize theme from localStorage and apply body class
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) setTheme(storedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light');
    else document.body.classList.remove('light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto-save on changes
  useEffect(() => {
    localStorage.setItem('myTodos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('removedTodos', JSON.stringify(removedTodos));
  }, [removedTodos]);

  // Pomodoro timer effect
  useEffect(() => {
    if (!isPomodoroRunning) return;

    pomodoroRef.current = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          setIsPomodoroRunning(false);
          showNotification('⏰ Pomodoro Complete!', { body: 'Great work! Time for a break.' });
          return 25 * 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(pomodoroRef.current);
  }, [isPomodoroRunning]);

  const showNotification = (title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { icon: 'https://i.imgur.com/M1z1egq.png', ...options });
    }
  };

  const saveTasks = () => {
    localStorage.setItem('myTodos', JSON.stringify(todos));
    localStorage.setItem('streak', JSON.stringify(streak));
    localStorage.setItem('achievements', JSON.stringify(achievements));
    showNotification('✅ Tasks Saved Successfully');
  };

  // Export / Import support
  const fileInputRef = useRef(null);

  const handleExportJSON = () => {
    const data = {
      todos,
      removedTodos,
      streak,
      achievements,
      dailyGoal,
      // include other small bits if useful
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);

        if (parsed.todos) setTodos(parsed.todos);
        if (parsed.removedTodos) setRemovedTodos(parsed.removedTodos || []);
        if (parsed.streak !== undefined) setStreak(parsed.streak);
        if (parsed.achievements) setAchievements(parsed.achievements || []);
        if (parsed.dailyGoal !== undefined) setDailyGoal(parsed.dailyGoal);

        // persist into localStorage
        localStorage.setItem('myTodos', JSON.stringify(parsed.todos || []));
        localStorage.setItem('removedTodos', JSON.stringify(parsed.removedTodos || []));
        localStorage.setItem('streak', JSON.stringify(parsed.streak || 0));
        localStorage.setItem('achievements', JSON.stringify(parsed.achievements || []));

        alert('Import successful — data restored.');
      } catch (err) {
        console.error(err);
        alert('Failed to import: invalid JSON file.');
      }
    };
    reader.readAsText(file);
    // reset input so the same file can be selected again later
    e.target.value = '';
  };

  const addTodo = () => {
    if (!task.trim() || !date) {
      alert('Please enter both task and date');
      return;
    }

    const newTodo = {
      id: Date.now(),
      task,
      driveLink: driveLink || '',
      date,
      repeatDays,
      priority,
      category,
      color: taskColor,
      notes,
      estimatedHours: parseFloat(estimatedHours),
      subtasks,
      done: '',
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setTodos([...todos, newTodo]);
    addToUndoStack([...todos]);
    resetForm();
    showNotification('✅ Task Added!');
  };

  const resetForm = () => {
    setTask('');
    setDriveLink('');
    setDate('');
    setRepeatDays([]);
    setPriority('Medium');
    setCategory('Personal');
    setTaskColor('#1E88E5');
    setNotes('');
    setEstimatedHours('1');
    setSubtasks([]);
    setNewSubtask('');
  };

  const deleteTodo = (id) => {
    const todo = todos.find((t) => t.id === id);
    addToUndoStack(todos);
    setRemovedTodos([...removedTodos, { ...todo, deletedAt: new Date().toISOString() }]);
    setTodos(todos.filter((t) => t.id !== id));
  };

  const toggleTodoDone = (id) => {
    addToUndoStack(todos);
    const updated = todos.map((t) =>
      t.id === id
        ? {
            ...t,
            done: t.done ? '' : format(today, 'yyyy-MM-dd'),
            completedAt: t.done ? null : new Date().toISOString(),
          }
        : t
    );
    setTodos(updated);

    // Check for streak
    const completedToday = updated.filter((t) => t.done === todayStr).length;
    if (completedToday >= dailyGoal && streak === 0) {
      setStreak(1);
      showNotification('🎉 Streak Started!');
    }
  };

  const toggleRepeatDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { id: Date.now(), text: newSubtask, done: false }]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (id) => {
    setSubtasks(
      subtasks.map((st) => (st.id === id ? { ...st, done: !st.done } : st))
    );
  };

  const addToUndoStack = (state) => {
    setUndoStack([...undoStack, state]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const newStack = [...undoStack];
    const previous = newStack.pop();
    setRedoStack([...redoStack, todos]);
    setTodos(previous);
    setUndoStack(newStack);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const newStack = [...redoStack];
    const next = newStack.pop();
    setUndoStack([...undoStack, todos]);
    setTodos(next);
    setRedoStack(newStack);
  };

  const filteredTodos = todos
    .filter((t) => {
      if (selectedCategory !== 'All' && t.category !== selectedCategory) return false;
      if (searchQuery && !t.task.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (view === 'pending' && t.done) return false;
      if (view === 'completed' && !t.done) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { High: 0, Medium: 1, Low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const completedToday = todos.filter((t) => t.done === todayStr).length;
  const totalCompleted = todos.filter((t) => t.done).length;
  const completionRate = todos.length > 0 ? Math.round((totalCompleted / todos.length) * 100) : 0;
  const highPriorityTasks = todos.filter((t) => !t.done && t.priority === 'High').length;
  const avgEstimatedTime =
    todos.length > 0
      ? (todos.reduce((sum, t) => sum + t.estimatedHours, 0) / todos.length).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <div className="max-w-6xl mx-auto">
        {/* Theme toggle button (corner) */}
        <div className="theme-toggle-btn">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="px-3 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-lg"
            title="Toggle light / dark mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold flex items-center justify-center gap-4 mb-2">
            <span className="w-12 h-12 flex items-center justify-center rounded-full shadow-md overflow-hidden bg-transparent">
              <img src="/falcon-logo.svg" alt="Falcon logo" className="w-10 h-10" />
            </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Falcon Dashboard</span>
          </h1>
          <p className="text-gray-400">Organize, track, and accomplish your goals</p>
          <p className="text-sm text-gray-500 mt-2">Shortcuts: Ctrl+N (New) | Ctrl+Z (Undo) | Ctrl+S (Save)</p>
        </div>

        {/* Global Web Shortcut Toolbar */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Quick text or URL for shortcuts"
            value={globalShortcutText}
            onChange={(e) => setGlobalShortcutText(e.target.value)}
            className="w-2/3 max-w-2xl bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />

          <div className="flex gap-2">
            <button
              onClick={() => {
                const text = globalShortcutText || '';
                const url = `https://translate.google.com/?sl=bn&tl=en&text=${encodeURIComponent(text)}&op=translate`;
                window.open(url, '_blank');
              }}
              className="px-3 py-2 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn"
              title="Translate Bangla → English"
            >
              🌐 Translate
            </button>

            <button
              onClick={() => {
                const text = globalShortcutText || '';
                const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank');
              }}
              className="px-3 py-2 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn"
              title="Open WhatsApp Web"
            >
              💬 WhatsApp
            </button>

            <button
              onClick={() => window.open('https://web.telegram.org/', '_blank')}
              className="px-3 py-2 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn"
              title="Open Telegram Web"
            >
              ✈️ Telegram
            </button>

            <button
              onClick={() => window.open('https://discord.com/channels/@me', '_blank')}
              className="px-3 py-2 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn"
              title="Open Discord Web"
            >
              👾 Discord
            </button>

            <button
              onClick={() => window.open('https://www.facebook.com/', '_blank')}
              className="px-3 py-2 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn"
              title="Open Facebook"
            >
              📘 Facebook
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded bg-green-700 text-white hover:bg-green-600 toolbar-btn"
              title="Download app data as JSON"
            >
              ⬇️ Export
            </button>

            <button
              onClick={handleImportClick}
              className="px-3 py-2 rounded bg-amber-700 text-white hover:bg-amber-600 toolbar-btn"
              title="Import app data from JSON"
            >
              ⬆️ Import
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 bg-opacity-50 p-4 rounded-lg border border-cyan-500 border-opacity-30">
            <p className="text-gray-400 text-sm">🔥 Streak</p>
            <p className="text-2xl font-bold text-cyan-400">{streak}</p>
          </div>
          <div className="bg-slate-800 bg-opacity-50 p-4 rounded-lg border border-cyan-500 border-opacity-30">
            <p className="text-gray-400 text-sm">📊 Today</p>
            <p className="text-2xl font-bold text-cyan-400">{completedToday}/{dailyGoal}</p>
          </div>
          <div className="bg-slate-800 bg-opacity-50 p-4 rounded-lg border border-red-500 border-opacity-30">
            <p className="text-gray-400 text-sm">⚠️ Urgent</p>
            <p className="text-2xl font-bold text-red-400">{highPriorityTasks}</p>
          </div>
          <div className="bg-slate-800 bg-opacity-50 p-4 rounded-lg border border-blue-500 border-opacity-30">
            <p className="text-gray-400 text-sm">📈 Complete</p>
            <p className="text-2xl font-bold text-blue-400">{completionRate}%</p>
          </div>
          <div className="bg-slate-800 bg-opacity-50 p-4 rounded-lg border border-purple-500 border-opacity-30">
            <p className="text-gray-400 text-sm">⏱️ Avg Time</p>
            <p className="text-2xl font-bold text-purple-400">{avgEstimatedTime}h</p>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="bg-slate-800 bg-opacity-50 p-6 rounded-lg border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">➕ Add New Task</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              id="taskInput"
              type="text"
              placeholder="What do you need to do?"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            <input
              type="url"
              placeholder="Web link / Drive link (optional)"
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0.5"
              step="0.5"
              placeholder="Est. hours"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-2">Repeat on Days:</label>
            <div className="flex gap-2 flex-wrap">
              {weekDays.map((day) => (
                <button
                  key={day}
                  onClick={() => toggleRepeatDay(day)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    repeatDays.includes(day)
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Add notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 mb-4"
            rows="2"
          />

          <button
            onClick={addTodo}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-2 px-4 rounded transition"
          >
            ✨ Add Task
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 mb-6 justify-between items-center">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setView(view === 'pending' ? 'all' : 'pending')}
              className={`px-4 py-2 rounded font-semibold transition ${
                view === 'pending'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setView(view === 'completed' ? 'all' : 'completed')}
              className={`px-4 py-2 rounded font-semibold transition ${
                view === 'completed'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="px-4 py-2 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              ↶ Undo
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="px-4 py-2 rounded bg-slate-700 text-gray-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              ↷ Redo
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="bg-slate-800 bg-opacity-50 p-8 rounded-lg border border-slate-700 text-center">
              <p className="text-gray-400 text-lg">✨ No tasks here! Time to relax or add more tasks.</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-slate-800 bg-opacity-50 p-4 rounded-lg border-l-4 transition hover:bg-opacity-70 cursor-pointer"
                style={{ borderColor: todo.color }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={!!todo.done}
                      onChange={() => toggleTodoDone(todo.id)}
                      className="mt-1 w-5 h-5 rounded cursor-pointer"
                      style={{ accentColor: todo.color }}
                    />
                    <div className="flex-1">
                      <h3
                        className={`font-bold text-lg ${
                          todo.done ? 'line-through text-gray-500' : 'text-white'
                        }`}
                      >
                        {todo.task}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm">
                        <span
                          className="px-2 py-1 rounded text-white"
                          style={{ backgroundColor: todo.color, opacity: 0.8 }}
                        >
                          {todo.category}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            todo.priority === 'High'
                              ? 'bg-red-600'
                              : todo.priority === 'Medium'
                              ? 'bg-yellow-600'
                              : 'bg-green-600'
                          }`}
                        >
                          {todo.priority}
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-700 text-gray-300">
                          📅 {todo.date}
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-700 text-gray-300">
                          ⏱️ {todo.estimatedHours}h
                        </span>
                      </div>
                      {todo.notes && (
                        <p className="text-gray-400 text-sm mt-2 italic">📝 {todo.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 ml-4">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => {
                          const url = `https://translate.google.com/?sl=bn&tl=en&text=${encodeURIComponent(
                            todo.task
                          )}&op=translate`;
                          window.open(url, '_blank');
                        }}
                        className="text-sm px-2 py-1 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn-sm"
                        title="Translate Bangla → English"
                      >
                        🌐 Translate
                      </button>

                      <button
                        onClick={() => {
                          const text = `${todo.task}${todo.driveLink ? ' ' + todo.driveLink : ''}`;
                          const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                          window.open(url, '_blank');
                        }}
                        className="text-sm px-2 py-1 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn-sm"
                        title="Share via WhatsApp Web"
                      >
                        💬 WhatsApp
                      </button>

                      <button
                        onClick={() => {
                          window.open('https://web.telegram.org/', '_blank');
                        }}
                        className="text-sm px-2 py-1 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn-sm"
                        title="Open Telegram Web"
                      >
                        ✈️ Telegram
                      </button>

                      <button
                        onClick={() => window.open('https://discord.com/channels/@me', '_blank')}
                        className="text-sm px-2 py-1 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn-sm"
                        title="Open Discord Web"
                      >
                        👾 Discord
                      </button>

                      <button
                        onClick={() => window.open('https://www.facebook.com/', '_blank')}
                        className="text-sm px-2 py-1 rounded bg-slate-700 text-gray-200 hover:bg-slate-600 toolbar-btn-sm"
                        title="Open Facebook"
                      >
                        📘 Facebook
                      </button>

                      {todo.driveLink && todo.driveLink.length > 0 && (
                        <button
                          onClick={() => window.open(todo.driveLink, '_blank')}
                          className="text-sm px-2 py-1 rounded bg-slate-700 text-cyan-400 hover:text-cyan-300"
                          title="Open link"
                        >
                          🔗 Open
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-400 hover:text-red-300 font-bold"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Total Tasks: {todos.length} | Completed: {totalCompleted} | Pending: {todos.filter((t) => !t.done).length}</p>
          <p className="mt-2 text-xs text-gray-400">© 2026 allright reserved &lt;/&gt; fumioryoto</p>
        </div>
      </div>
    </div>
  );
}
