let allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
let valueInput = "";
let input = null;
let flagForEditing = -1;
let timeText = "";

window.onload = init = async () => {
  input = document.getElementById("addTask");
  input.addEventListener("change", updateValue);
  const resp = await fetch("http://localhost:8000/allTasks", {
    method: "GET",
  });
  let result = await resp.json();
  allTasks = result.data;
  console.log(allTasks);
  render();
};

const onClickButton = async () => {
  if (input.value.trim() === "") {
    alert("пожалуйста введите текст");
  } else {
    allTasks.push({
      text: valueInput,
      isCheck: false,
    });
    const resp = await fetch("http://localhost:8000/createTask ", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        text: valueInput,
        isCheck: false,
      }),
    });
    let result = await resp.json();
    allTasks = result.data;
    valueInput = "";
    input.value = "";
  }
  render();
};

const updateValue = (event) => {
  valueInput = event.target.value;
};

const render = () => {
  const content = document.getElementById("contentPage");
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
  allTasks.sort((a, b) => a.isCheck - b.isCheck);
  allTasks.map((item, index) => {
    if (flagForEditing === index) {
      const container = document.createElement("div");
      container.className = "taskContainerForEdit";
      const editInput = document.createElement("input");
      editInput.className = "textTask";
      editInput.value = item.text;
      timeText = "";
      editInput.onchange = (e) => (timeText = e.target.value);
      const imageDone = document.createElement("img");
      imageDone.src = "images/done.svg";
      imageDone.className = "doneSvg";
      imageDone.onclick = () => saveTask(index, timeText);
      const imageClose = document.createElement("img");
      imageClose.src = "images/close.svg";
      imageClose.onclick = () => closeTask(item, index);
      container.appendChild(editInput);
      container.appendChild(imageDone);
      container.appendChild(imageClose);
      content.appendChild(container);
    } else {
      const container = document.createElement("div");
      container.id = index;
      container.className = "taskContainer";
      const checkBox = document.createElement("input");
      checkBox.type = "checkbox";
      checkBox.checked = item.isCheck;
      checkBox.onchange = () => onChangeCheckBox(index);
      container.appendChild(checkBox);
      const text = document.createElement("p");
      text.innerText = item.text;
      text.className = item.isCheck ? "textTask doneText" : "textTask";
      container.appendChild(text);
      const imageEdit = document.createElement("img");
      imageEdit.src = "images/edit.svg";
      imageEdit.className = "editSvg";
      imageEdit.onclick = () => editTask(index);
      if (allTasks[index].isCheck === false) container.appendChild(imageEdit);
      const imageDelete = document.createElement("img");
      imageDelete.src = "images/close.svg";
      imageDelete.onclick = () => removeTask(index);
      container.appendChild(imageDelete);
      content.appendChild(container);
    }
  });
};

const onChangeCheckBox = async (index) => {
  let status = !allTasks[index].isCheck;
  let id = allTasks[index].id;
  const resp = await fetch(`http://localhost:8000/updateTask`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      id,
      isCheck: status,
    }),
  });
  const result = await resp.json();
  allTasks = result.data;
  render();
};

const editTask = (index) => {
  flagForEditing = index;
  render();
};

const removeTask = async (index) => {
  const resp = await fetch(
    `http://localhost:8000/deleteTask?id=${allTasks[index].id}`,
    {
      method: "DELETE",
    }
  );
  const result = await resp.json();
  allTasks = result.data;
  render();
};

const saveTask = async (index, timeText) => {
  flagForEditing = -1;
  let text = timeText;
  let id = allTasks[index].id;
  if (timeText.trim() === "") {
    alert("пожалуйста введите новое значение");
  } else {
    const resp = await fetch(`http://localhost:8000/updateTask`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        id,
        text,
      }),
    });
    const result = await resp.json();
    allTasks = result.data;
  }
  render();
};

const closeTask = (item, index) => {
  flagForEditing = -1;
  allTasks[index].text = item.text;
  render();
};
