var taskIdCounter = 0;
var tasks = [];

var formEl = document.querySelector("#task-form");
var tasksToDoEl = document.querySelector("#tasks-to-do");
var pageContentEl = document.querySelector("#page-content");
var tasksInProgressEl = document.querySelector("#tasks-in-progress");
var tasksCompletedEl = document.querySelector("#tasks-completed");

var taskFormHandler = function(event) {
	event.preventDefault();
	var taskNameInput = document.querySelector("input[name='task-name']").value;
	var taskTypeInput = document.querySelector("select[name='task-type']").value;

	// check if input values are empty strings
	if(!taskNameInput || !taskTypeInput) {
		alert("You need to fill out the task form!");
		return false;
	}
	
	// reset form fields for next task to be entered
  document.querySelector("input[name='task-name']").value = "";
  document.querySelector("select[name='task-type']").selectedIndex = 0;

	// check if task is new or one being edited by seeing if it has a data-task-id attribute
	var isEdit = formEl.hasAttribute("data-task-id");
	
	// has data attribute, so get task id and call function to complete edit process
	if(isEdit) {
		var taskId = formEl.getAttribute("data-task-id");
		completeEditTask(taskNameInput, taskTypeInput,taskId);
	}
	// no data attribute, so create object as normal and pass to createTaskEl function
	else {
		var taskDataObj = {
			name: taskNameInput,
			type: taskTypeInput,
			status: "to do"
		};
		// send it as an argument to createTaskEl
		createTaskEl(taskDataObj);
	}
};

var createTaskEl = function(taskDataObj) {
	// create list item
	var listItemEl = document.createElement("li");
	listItemEl.className = "task-item";
	// add task id as a custom attribute
	listItemEl.setAttribute("data-task-id", taskIdCounter);

	// create div to hold task info and add to list item
	var taskInfoEl = document.createElement("div");
	// give it a class name
	taskInfoEl.className = "task-info";
	// add HTML content to div
	taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
	listItemEl.appendChild(taskInfoEl);
	
	// add the action elements to do, in progress, completed to listItemEl
	var taskActionsEl = createTaskActions(taskIdCounter);
	listItemEl.appendChild(taskActionsEl);
	
	switch (taskDataObj.status) {
    case "to do":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 0;
      tasksToDoEl.append(listItemEl);
      break;
    case "in progress":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 1;
      tasksInProgressEl.append(listItemEl);
      break;
    case "completed":
      taskActionsEl.querySelector("select[name='status-change']").selectedIndex = 2;
      tasksCompletedEl.append(listItemEl);
      break;
    default:
      console.log("Something went wrong!");
  }
	
	// save task as an object with name, type, status, and id properties then push it into tasks array
	taskDataObj.id = taskIdCounter;
	
	tasks.push(taskDataObj);
	
	// save tasks to localStorage
	saveTasks();

	// increase task counter for next unique id
	taskIdCounter++;
};

var createTaskActions = function(taskId) {
	// create container to hold elements
	var actionContainerEl = document.createElement("div");
	actionContainerEl.className = "task-actions";
	
	// create edit button
	var editButtonEl = document.createElement("button");
	editButtonEl.textContent = "Edit";
	editButtonEl.className = "btn edit-btn";
	editButtonEl.setAttribute("data-task-id", taskId);
	actionContainerEl.appendChild(editButtonEl);
	
	// create delete button
	var deleteButtonEl = document.createElement("button");
	deleteButtonEl.textContent = "Delete";
	deleteButtonEl.className = "btn delete-btn";
	deleteButtonEl.setAttribute("data-task-id", taskId);
	actionContainerEl.appendChild(deleteButtonEl);
	
	// create select buttons - will be inside the dropdown
	var statusSelectEl = document.createElement("select");
	statusSelectEl.className = "select-status";
	statusSelectEl.setAttribute("name", "status-change");
	statusSelectEl.setAttribute("data-task-id", taskId);
	actionContainerEl.appendChild(statusSelectEl);
	// create status options
	var statusChoices = ["To Do", "In Progress", "Completed"];
	
	for (var i = 0; i < statusChoices.length; i++) {
		// create option element
		var statusOptionEl = document.createElement("option");
		statusOptionEl.textContent = statusChoices[i];
		statusOptionEl.setAttribute("value", statusChoices[i]);
		
		// append to select
		statusSelectEl.appendChild(statusOptionEl);
	}
	
	return actionContainerEl;
};

var taskButtonHandler = function(event) {
	// get target element from event
	var targetEl = event.target;
	
	// edit button was clicked
	if(targetEl.matches(".edit-btn")) {
		// get the element's task id
		console.log("edit", targetEl);
		var taskId = targetEl.getAttribute("data-task-id");
		// use the deleteTask function to delete the element with the taskId
		editTask(taskId);
	}
	// if the delete button was clicked
	else if (targetEl.matches(".delete-btn")){
		console.log("delete", targetEl);
		var taskId = targetEl.getAttribute("data-task-id");
		deleteTask(taskId);
	}
};

var completeEditTask = function(taskName, taskType, taskId) {
	// find the matching task list item
	var taskSelected = document.querySelector(
	".task-item[data-task-id='" + taskId + "']"
	);

	// set new values
	taskSelected.querySelector("h3.task-name").textContent = taskName;
	taskSelected.querySelector("span.task-type").textContent = taskType;
	
	// loop through tasks array and task object with new content
	for (var i = 0; i < tasks.length; i++) {
		if(tasks[i].id === parseInt(taskId)) {
			tasks[i].name = taskName;
			tasks[i].type = taskType;
		}
	};
	alert("Task Updated!");
	
	// remove data attribute from form
	formEl.removeAttribute("data-task-id");
	// update button back to Add task
	document.querySelector("#save-task").textContent = "Add Task";
	// save tasks to localStorage
	saveTasks();
};

var taskStatusChangeHandler = function(event) {
	console.log(event.target.value);
	
	// get the task item's id based on event.target's data-task-id attribute
  var taskId = event.target.getAttribute("data-task-id");

  // get the currently selected option's value and convert to lowercase
  var statusValue = event.target.value.toLowerCase();

  // find the parent task item element based on the id
  var taskSelected = document.querySelector(
  ".task-item[data-task-id='" + taskId + "']"
  );
	
	if (statusValue === "to do") {
  tasksToDoEl.appendChild(taskSelected);
	} else if (statusValue === "in progress") {
		tasksInProgressEl.appendChild(taskSelected);
	} else if (statusValue === "completed") {
		tasksCompletedEl.appendChild(taskSelected);
	}
	
	// update tasks in tasks array
	for(var i = 0; i < tasks.length; i++) {
		if(tasks[i].id === parseInt(taskId)) {
			tasks[i].status = statusValue;
		}
	}
	// save to localStorage
	saveTasks();
};

var deleteTask = function(taskId) {
	console.log(taskId);
	// get task list item element with taskId value
	var taskSelected = document.querySelector(
	".task-item[data-task-id='" + taskId + "']"
	); // and remove it
	taskSelected.remove();
	
	// create new array to hold updated list of tasks
	var updatedTaskArr = [];

	// loop through current tasks
	for (var i = 0; i < tasks.length; i++) {
		// if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
		if (tasks[i].id !== parseInt(taskId)) {
			updatedTaskArr.push(tasks[i]);
		}
	}

	// reassign tasks array to be the same as updatedTaskArr
	tasks = updatedTaskArr;
	saveTasks();
};

var editTask = function(taskId) {
	console.log(taskId);

	// get task list item element
	var taskSelected = document.querySelector(
	".task-item[data-task-id='" + taskId + "']"
	);
	
	// get content from task name and type
	var taskName = taskSelected.querySelector("h3.task-name").textContent;
	console.log(taskName);
	
	var taskType = taskSelected.querySelector("span.task-type").textContent;
	console.log(taskType);
	
	// write values of taskName and taskType to form to be edited
	document.querySelector("input[name='task-name']").value = taskName;
	document.querySelector("select[name='task-type']").value = taskType;
	
	// update form's button to reflect editing a task rather than creating a new one
	formEl.querySelector("#save-task").textContent = "Save Task";
	// set data attribute to the form with a value of the task's id so it knows which one is being edited
	formEl.setAttribute("data-task-id", taskId);
};

var saveTasks = function() {
	localStorage.setItem("tasks", JSON.stringify(tasks));
}

var loadTasks = function() {
	var saveTasks = localStorage.getItem("tasks");
	// if there are no tasks, set tasks to an empty array and return out of the function
	if(!saveTasks) {
		return false
	}
	console.log("We/You Have saved tasks")
	// else, load up saved tasks
	
	// parse into array of objects
	saveTasks = JSON.parse(saveTasks);
	
	// loop through saveTasks array
	for (var i = 0; i < saveTasks.length; i++) {
		// pass each task object into the createTaskEl() function
		createTaskEl(saveTasks[i]);
	}
};

// Create a new task
formEl.addEventListener("submit", taskFormHandler);

// for edit and delete buttons
pageContentEl.addEventListener("click", taskButtonHandler);

// for changing the status
pageContentEl.addEventListener("change", taskStatusChangeHandler);

loadTasks();