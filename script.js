// --- Variables ---
let currentUser = null;
let generatedOTP = null;
let otpTimeout = null;

// --- In-memory storage ---
let tasks = [];
let reports = [];

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
const reportTaskForm = document.getElementById("report-task-form");
const paymentModal = document.getElementById("payment-modal");

const postTaskOption = document.getElementById("post-task-option");
const takeTaskOption = document.getElementById("take-task-option");
const reportTaskOption = document.getElementById("report-task-option");
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

// --- Report Elements ---
const submitReportBtn = document.getElementById("submit-report-btn");
const reportTaskIdEl = document.getElementById("report-task-id");
const reportReasonEl = document.getElementById("report-reason");

// --- Payment Elements ---
const paymentAmountEl = document.getElementById("payment-amount");
const payBtn = document.getElementById("pay-btn");
const closePaymentBtn = document.getElementById("close-payment-btn");
let currentPaymentTaskId = null;

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
    currentUser = {
      id: Math.floor(Math.random()*1000),
      name: nameEl.value,
      email: emailEl.value,
      phone: countryCodeEl.value + phoneEl.value,
      aadhar: aadharEl.value
    };
    afterLogin();
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
  renderTasks();
}

// --- Logout ---
logoutBtn.addEventListener("click", () => {
  currentUser = null;
  authForm.classList.add("active");
  taskOptions.classList.remove("active");
  taskPostForm.classList.remove("active");
  taskListSection.classList.remove("active");
  reportTaskForm.classList.remove("active");
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
  reportTaskForm.classList.remove("active");
});

takeTaskOption.addEventListener("click", () => {
  taskPostForm.classList.remove("active");
  taskListSection.classList.add("active");
  reportTaskForm.classList.remove("active");
});

reportTaskOption.addEventListener("click", () => {
  reportTaskForm.classList.add("active");
  taskPostForm.classList.remove("active");
  taskListSection.classList.remove("active");
});

// --- Post Task ---
postTaskBtn.addEventListener("click", () => {
  if (!taskTitleEl.value || !taskDescEl.value || !taskTimeEl.value || !taskRewardEl.value) {
    alert("All task fields are required!");
    return;
  }
  const newTask = {
    id: tasks.length + 1,
    category: taskCategoryEl.value,
    title: taskTitleEl.value,
    description: taskDescEl.value,
    time_slot: taskTimeEl.value,
    reward: Number(taskRewardEl.value),
    posted_by: currentUser.name,
    status: "Available"
  };
  tasks.push(newTask);
  alert("Task posted successfully!");
  taskPostForm.classList.remove("active");
  taskListSection.classList.add("active");
  clearTaskForm();
  renderTasks();
});

function clearTaskForm() {
  taskTitleEl.value = '';
  taskDescEl.value = '';
  taskTimeEl.value = '';
  taskRewardEl.value = '';
}

// --- Render Tasks ---
function renderTasks() {
  taskListEl.innerHTML = "";
  const filter = filterCategoryEl.value;
  const search = searchTaskEl.value.toLowerCase();

  tasks
    .filter(t => filter === "All" ? true : t.category === filter)
    .filter(t => t.title.toLowerCase().includes(search) || t.description.toLowerCase().includes(search))
    .forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${task.title}</strong><br/>
        Category: ${task.category}<br/>
        Description: ${task.description}<br/>
        Time Slot: ${task.time_slot}<br/>
        Reward: ₹${task.reward}<br/>
        Posted by: ${task.posted_by}<br/>
        Status: <span style="color:${task.status==="Available"?"green":"gray"}">${task.status}</span><br/>
        <button onclick="acceptTask(${task.id})" ${task.status!=="Available"?"disabled":""}>Accept Task</button>
        <button onclick="openPaymentModal(${task.id})" ${task.status!=="Accepted"?"disabled":""}>Pay ₹${task.reward}</button>
      `;
      taskListEl.appendChild(li);
    });
}

// --- Accept Task ---
function acceptTask(taskId){
  const task = tasks.find(t => t.id===taskId);
  if(task && task.status==="Available"){
    task.status = "Accepted";
    renderTasks();
  }
}

// --- Report Task ---
submitReportBtn.addEventListener("click", () => {
  const taskId = Number(reportTaskIdEl.value);
  const reason = reportReasonEl.value.trim();
  if(!taskId || !reason){
    alert("Please enter valid Task ID and reason.");
    return;
  }
  const task = tasks.find(t => t.id===taskId);
  if(!task){
    alert("Task not found!");
    return;
  }
  reports.push({
    taskId: taskId,
    reporter: currentUser.name,
    reason
  });
  alert("Report submitted successfully!");
  reportTaskIdEl.value = reportReasonEl.value = '';
  reportTaskForm.classList.remove("active");
  taskOptions.classList.add("active");
});

// --- Payment ---
function openPaymentModal(taskId){
  const task = tasks.find(t=>t.id===taskId);
  if(!task || task.status!=="Accepted") return;
  currentPaymentTaskId = taskId;
  paymentAmountEl.innerText = task.reward;
  paymentModal.classList.add("active");
}
payBtn.addEventListener("click", ()=>{
  alert(`Payment of ₹${tasks.find(t=>t.id===currentPaymentTaskId).reward} successful!`);
  paymentModal.classList.remove("active");
});
closePaymentBtn.addEventListener("click", ()=> paymentModal.classList.remove("active"));

// --- Filters & Search ---
filterCategoryEl.addEventListener("change", renderTasks);
searchTaskEl.addEventListener("input", renderTasks);

// --- Start App ---
authForm.classList.add("active");
