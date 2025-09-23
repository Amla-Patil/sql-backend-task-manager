// --- Variables ---
let currentUser = null;
let generatedOTP = null;
let otpTimeout = null;

// --- Elements ---
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const countryCodeEl = document.getElementById("country-code");
const aadharEl = document.getElementById("aadhar");
const errorEl = document.getElementById("error");

const authForm = document.getElementById("auth-form");
const otpForm = document.getElementById("otp-form");
const otpInput = document.getElementById("otp-input");
const otpErrorEl = document.getElementById("otp-error");
const otpTimerEl = document.getElementById("otp-timer");

const taskOptions = document.getElementById("task-options");
const taskPostForm = document.getElementById("task-post-form");
const taskListSection = document.getElementById("task-list-section");
const profilePage = document.getElementById("profile-page");

const postTaskOption = document.getElementById("post-task-option");
const takeTaskOption = document.getElementById("take-task-option");
const logoutBtn = document.getElementById("logout-btn");
const profileBtn = document.getElementById("profile-btn");
const backToTasksBtn = document.getElementById("back-to-tasks-btn");

const userNameEl = document.getElementById("user-name");
const profileNameEl = document.getElementById("profile-name");
const profileEmailEl = document.getElementById("profile-email");
const profilePhoneEl = document.getElementById("profile-phone");
const profileAadharEl = document.getElementById("profile-aadhar");

const taskCategoryEl = document.getElementById("task-category");
const taskTitleEl = document.getElementById("task-title");
const taskDescEl = document.getElementById("task-desc");
const taskTimeEl = document.getElementById("task-time");
const taskRewardEl = document.getElementById("task-reward");
const postTaskBtn = document.getElementById("post-task-btn");

const taskListEl = document.getElementById("task-list");
const filterCategoryEl = document.getElementById("filter-category");
const searchTaskEl = document.getElementById("search-task");

// --- Register Button ---
document.getElementById("register-btn").addEventListener("click", () => {
  if (!nameEl.value || !emailEl.value || !phoneEl.value || !aadharEl.value) {
    errorEl.innerText = "All fields are required!";
    return;
  }
  errorEl.innerText = "";

  generatedOTP = Math.floor(100000 + Math.random() * 900000);
  console.log("Generated OTP:", generatedOTP);

  authForm.classList.remove("active");
  otpForm.classList.add("active");

  let timeLeft = 120;
  otpTimerEl.innerText = `OTP expires in: ${timeLeft}s`;
  clearInterval(otpTimeout);
  otpTimeout = setInterval(() => {
    timeLeft--;
    otpTimerEl.innerText = `OTP expires in: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(otpTimeout);
      otpErrorEl.innerText = "OTP expired. Please register again.";
      otpInput.disabled = true;
      document.getElementById("verify-otp-btn").disabled = true;
    }
  }, 1000);
});

// --- OTP Verification ---
document.getElementById("verify-otp-btn").addEventListener("click", () => {
  if (otpInput.value === String(generatedOTP)) {
    const userData = {
      name: nameEl.value,
      email: emailEl.value,
      phone: countryCodeEl.value + phoneEl.value,
      aadhar: aadharEl.value,
    };

    fetch('register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'exists') {
          alert('User already exists. Logging in...');
          currentUser = userData;
          afterLogin();
        } else if (data.status === 'success') {
          alert('Registration successful!');
          currentUser = userData;
          afterLogin();
        } else {
          alert('Registration failed. Please try again.');
          otpForm.classList.remove("active");
          authForm.classList.add("active");
        }
      })
      .catch(() => {
        alert('Server error during registration.');
        otpForm.classList.remove("active");
        authForm.classList.add("active");
      });

    otpInput.value = "";
    otpErrorEl.innerText = "";
    clearInterval(otpTimeout);
  } else {
    otpErrorEl.innerText = "Invalid OTP. Try again.";
  }
});

function afterLogin() {
  userNameEl.innerText = currentUser.name;
  authForm.classList.remove("active");
  otpForm.classList.remove("active");
  taskOptions.classList.add("active");
  nameEl.value = emailEl.value = phoneEl.value = aadharEl.value = "";
  fetchTasks();
}

// --- Logout ---
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  authForm.classList.add("active");
  taskOptions.classList.remove("active");
  taskPostForm.classList.remove("active");
  taskListSection.classList.remove("active");
  profilePage.classList.remove("active");
});

// --- Profile ---
profileBtn.addEventListener("click", () => {
  profileNameEl.innerText = currentUser.name;
  profileEmailEl.innerText = currentUser.email;
  profilePhoneEl.innerText = currentUser.phone;
  profileAadharEl.innerText = currentUser.aadhar;

  taskOptions.classList.remove("active");
  profilePage.classList.add("active");
});

backToTasksBtn.addEventListener("click", () => {
  profilePage.classList.remove("active");
  taskOptions.classList.add("active");
});

// --- Task Options ---
postTaskOption.addEventListener("click", () => {
  taskPostForm.classList.add("active");
  taskListSection.classList.remove("active");
});

takeTaskOption.addEventListener("click", () => {
  taskPostForm.classList.remove("active");
  taskListSection.classList.add("active");
  fetchTasks();
});

// --- Post Task ---
postTaskBtn.addEventListener("click", () => {
  if (!taskTitleEl.value || !taskDescEl.value || !taskTimeEl.value || !taskRewardEl.value) {
    alert("All task fields are required!");
    return;
  }

  const taskData = {
    category: taskCategoryEl.value,
    title: taskTitleEl.value,
    description: taskDescEl.value,
    timeSlot: taskTimeEl.value,
    reward: Number(taskRewardEl.value),
    postedBy: currentUser.email,
  };

  fetch('post_task.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert('Task posted successfully!');
        taskPostForm.classList.remove("active");
        taskListSection.classList.add("active");
        clearTaskForm();
        fetchTasks();
      } else {
        alert('Failed to post task.');
      }
    })
    .catch(() => alert('Server error posting task.'));
});

function clearTaskForm() {
  taskTitleEl.value = '';
  taskDescEl.value = '';
  taskTimeEl.value = '';
  taskRewardEl.value = '';
}

// --- Fetch Tasks ---
function fetchTasks() {
  fetch('get_task.php') // ✅ Corrected filename
    .then(res => res.json())
    .then(tasks => {
      window.tasks = tasks;
      renderTasks();
    })
    .catch(() => {
      alert('Failed to load tasks.');
      taskListEl.innerHTML = '<li>Failed to load tasks.</li>';
    });
}

// --- Render Tasks ---
function renderTasks() {
  taskListEl.innerHTML = "";
  if (!window.tasks) return;

  const filter = filterCategoryEl.value;
  const search = searchTaskEl.value.toLowerCase();

  window.tasks
    .filter(task => (filter === "All" ? true : task.category === filter))
    .filter(task => task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search))
    .forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${task.title}</strong><br/>
        Category: ${task.category}<br/>
        Description: ${task.description}<br/>
        Time Slot: ${task.time_slot}<br/>
        Reward: ₹${task.reward}<br/>
        Posted by: ${task.poster || task.posted_by}<br/>
        Status: <span style="color:${task.status === 'Available' ? 'green' : 'gray'}">${task.status}</span><br/>
        <button onclick="acceptTask(${task.id})" ${task.status !== 'Available' ? 'disabled' : ''}>Accept Task</button>
      `;
      taskListEl.appendChild(li);
    });
}

// --- Accept Task ---
function acceptTask(taskId) {
  if (!currentUser) {
    alert('Please login first.');
    return;
  }

  fetch('accept_task.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task_id: taskId })
  })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        alert("Task accepted!");
        fetchTasks();
      } else {
        alert("Could not accept task. It may already be taken.");
      }
    })
    .catch(err => {
      console.error("Error accepting task:", err);
      alert("Server error while accepting task.");
    });
}

// --- Filters ---
filterCategoryEl.addEventListener("change", renderTasks);
searchTaskEl.addEventListener("input", renderTasks);

// --- Start App ---
authForm.classList.add("active");
