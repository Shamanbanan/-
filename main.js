// Инициализация Firebase Рабочая
const firebaseConfig = {
  apiKey: "AIzaSyC4a4SVzUb-ekvsxsuQNIWumcJWB9oEggY",
  authDomain: "nomenklature-6acda.firebaseapp.com",
  databaseURL:
    "https://nomenklature-6acda-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nomenklature-6acda",
  storageBucket: "nomenklature-6acda.appspot.com",
  messagingSenderId: "729807329689",
  appId: "1:729807329689:web:8d3f5713602fe1904cdb08",
};

// //тестовая база
// const firebaseConfig = {
//   apiKey: "AIzaSyDw8I0kHe1TsBmS6X3JqLCaic7nG1o6uIg",
//   authDomain: "test-8729c.firebaseapp.com",
//   databaseURL:
//     "https://test-8729c-default-rtdb.europe-west1.firebasedatabase.app",
//   projectId: "test-8729c",
//   storageBucket: "test-8729c.appspot.com",
//   messagingSenderId: "891947507335",
//   appId: "1:891947507335:web:f0ce6527928696b61ae222",
// };

firebase.initializeApp(firebaseConfig);

// Получение ссылки на базу данных
const database = firebase.database();
const db = firebase.firestore();

//ссылка на узел items requests
const itemsRef = database.ref("items");
const requestsRef = database.ref("requests");
// Предположим, что у вас есть корневая переменная database, представляющая базу данных Firebase
const deletedRequestsRef = database.ref("deletedRequests");

const addBtn = document.getElementById("add-btn");
const modal = document.getElementById("modal");
const closeButton = document.querySelector(".close");
const formRequest = document.getElementById("request-form");
const addProductBtn = document.getElementById("add-product-btn");
const listTableRequest = document.getElementById("products-body");
const saveRequestBtn = document.getElementById("save-request-btn");
const saveChangesBtn = document.getElementById("save-change-btn");
const table = document.getElementById("table-body");
const modalFooter = document.querySelector(".modal-footer");
const selectStatusRequest = document.querySelector(".status-block");
const initiator = document.getElementById("initiator");
const executive = document.getElementById("executive-id");
const categoryInput = document.getElementById("category-list");
const editListCheckbox = document.getElementById("edit-list");
const form = document.getElementById("form");
//Авторизация
const emailField = document.getElementById("email");
const passwordField = document.getElementById("password");
const loginForm = document.getElementById("login-form");
const loggedInContent = document.getElementById("logged-in-content");
const logoutBtn = document.getElementById("logout-btn");
const welcomeMessage = document.getElementById("welcome-message");
const userRoleField = document.getElementById("user-role");

// Объявляем переменную вне обработчика событий
let requestRef;
let currentRequestKey = null;
let requestNumber = null; //Переменная для номера заявки

// Глобальная переменная для фильтрации по имени пользователя (surname)
let searchFilter = "";

let globalItems = null;

async function loadItems() {
  if (globalItems === null) {
    const itemsSnapshot = await itemsRef.once("value");
    globalItems = itemsSnapshot.val() || {};
  }
  return globalItems;
}

// ------------------------------------------------------------------------------------------------------ БЛОК АВТОРИЗАЦИИ --------------------------------------------//
// Отображение формы авторизации
const showLoginForm = () => {
  toggleElementsVisibility(true, false, false);
};

// Функция для изменения видимости элементов в зависимости от авторизации пользователя
const toggleElementsVisibility = (
  showLoginForm,
  showLoggedInContent,
  showRegisterButton
) => {
  loginForm.classList.toggle("hidden", !showLoginForm);
  loggedInContent.classList.toggle("hidden", !showLoggedInContent);
  logoutBtn.classList.toggle("hidden", !showLoggedInContent);
  if (showRegisterButton) {
    createRegisterButton();
    createUpdateButton();
  } else {
    removeRegisterButton();
    removeUpdateButton();
  }
};

const closeButtonLogin = document.querySelector(".close-btn-login");

closeButtonLogin.addEventListener("click", () => {
  alert(
    "Неавторизованный пользователь не может редактировать и записывать новые заявки"
  );
  toggleElementsVisibility(false, false, false);
});

// Отображение содержимого для авторизованного пользователя
const showLoggedInContent = (surname, role) => {
  const roleText = role === "admin" ? "Администратор" : "Пользователь";
  welcomeMessage.textContent = `${surname} (${roleText})`;
  toggleElementsVisibility(false, true, role === "admin");

  const filterCheckbox = document.getElementById("filterCheckbox");

  // Add event listener to the checkbox
  filterCheckbox.addEventListener("change", () => {
    if (filterCheckbox.checked) {
      // If checkbox is checked, set the search filter to the user's surname
      searchFilter = surname;
    } else {
      // If checkbox is unchecked, reset the search filter
      searchFilter = "";
    }

    // After updating the search filter, update the table to apply the filter
    updateTable();

    // Save the checkbox state to localStorage
    localStorage.setItem("filterCheckboxState", filterCheckbox.checked);
  });

  // Retrieve the checkbox state from localStorage and apply it
  const savedCheckboxState = localStorage.getItem("filterCheckboxState");
  filterCheckbox.checked = savedCheckboxState === "true";

  // If the checkbox is checked, set the search filter to the user's surname
  if (filterCheckbox.checked) {
    searchFilter = surname;
    filterTableBySurname(surname);
  }
};

const filterTableBySurname = (surname) => {
  const tableRows = document.querySelectorAll("tbody tr");

  // Loop through all rows and check if the surname is present
  tableRows.forEach((row) => {
    const inCell = row.querySelector(".in-cell");
    const executiveCell = row.querySelector(".executive-cell");
    const showRow =
      (inCell && inCell.textContent.includes(surname)) ||
      (executiveCell && executiveCell.textContent.includes(surname));

    row.style.display = showRow ? "" : "none";
  });

  // After applying the filter, update the page numbers and show the first page
  currentPage = 1;
  updateTable();
};

// Обработка отправки формы авторизации
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = emailField.value;
  const password = passwordField.value;

  if (!email || !password) {
    alert("Пожалуйста, введите email и пароль");
    return;
  }

  try {
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const currentUser = userCredential.user;
    const userDetails = await getUserDetails(currentUser.uid);

    if (userDetails) {
      const { surname, role } = userDetails;
      alert("Вы успешно вошли в систему");
      showLoggedInContent(surname, role);
    } else {
      alert("У вас нет доступа к системе");
      showLoginForm();
    }
  } catch (error) {
    const errorMessage = error.message;
    alert("Ошибка авторизации: " + errorMessage);
    console.error("Ошибка авторизации:", error);
  }

  emailField.value = "";
  passwordField.value = "";
});

// Выход из системы
logoutBtn.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      alert("Вы успешно вышли из системы");
      showLoginForm();
    })
    .catch((error) => {
      console.error("Ошибка выхода из системы:", error);
    });
});
// Переменная для хранения кнопки регистрации
let registerButton = null;
// Переменная для хранения кнопки обновления
let updateButton = null;
// Создание кнопки регистрации для администратора
const createRegisterButton = () => {
  if (!registerButton) {
    registerButton = document.createElement("button");
    registerButton.textContent = "Создать нового пользователя";
    registerButton.addEventListener("click", toggleRegistrationForm);
    loggedInContent.appendChild(registerButton);
  }
};
// Создание кнопки обновления заявок
const createUpdateButton = () => {
  if (!updateButton) {
    updateButton = document.createElement("button");
    updateButton.textContent = "Обновить заявки";
    updateButton.addEventListener("click", refreshAllRequests);
    loggedInContent.appendChild(updateButton);
  }
};

// Удаление кнопки регистрации
const removeRegisterButton = () => {
  if (registerButton && registerButton.parentNode === loggedInContent) {
    loggedInContent.removeChild(registerButton);
    registerButton = null;
  }
};

// Удаление кнопки обновления заявок
const removeUpdateButton = () => {
  if (updateButton && updateButton.parentNode === loggedInContent) {
    loggedInContent.removeChild(updateButton);
    updateButton = null;
  }
};

// Переключение видимости формы регистрации
const toggleRegistrationForm = () => {
  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) {
    loggedInContent.removeChild(registrationForm);
  } else {
    showRegistrationForm();
  }
};

// Создание полей ввода
const createInputElement = (type, labelText) => {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = type;
  input.required = true;
  return { label, input };
};

let emailInput, passwordInput, surnameInput, roleInput; // Добавлено объявление переменных

// Отображение формы регистрации
const showRegistrationForm = () => {
  const registrationForm = document.createElement("form");
  registrationForm.id = "registration-form";

  // Обновлено объявление переменных
  ({ label: emailLabel, input: emailInput } = createInputElement(
    "email",
    "Email:"
  ));
  ({ label: passwordLabel, input: passwordInput } = createInputElement(
    "password",
    "Пароль:"
  ));
  ({ label: surnameLabel, input: surnameInput } = createInputElement(
    "text",
    "Фамилия:"
  ));

  const roleLabel = document.createElement("label");
  roleLabel.textContent = "Роль:";
  roleInput = document.createElement("select");
  roleInput.id = "register-role";
  roleInput.required = true;
  const optionUser = document.createElement("option");
  optionUser.value = "user";
  optionUser.textContent = "Пользователь";
  roleInput.appendChild(optionUser);

  const optionAdmin = document.createElement("option");
  optionAdmin.value = "admin";
  optionAdmin.textContent = "Администратор"; // Добавляем опцию "Администратор"
  roleInput.appendChild(optionAdmin);

  const registerButton = document.createElement("button");
  registerButton.type = "submit";
  registerButton.textContent = "Зарегистрировать";

  registrationForm.appendChild(emailLabel);
  registrationForm.appendChild(emailInput);
  registrationForm.appendChild(passwordLabel);
  registrationForm.appendChild(passwordInput);
  registrationForm.appendChild(surnameLabel);
  registrationForm.appendChild(surnameInput);
  registrationForm.appendChild(roleLabel);
  registrationForm.appendChild(roleInput);
  registrationForm.appendChild(registerButton);

  registrationForm.addEventListener("submit", registerUser);

  loggedInContent.appendChild(registrationForm);
};

// Регистрация нового пользователя
const registerUser = (event) => {
  event.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;
  const surname = surnameInput.value;
  const role = roleInput.value;

  if (!email || !password || !surname || !role) {
    alert("Пожалуйста, заполните все поля");
    return;
  }

  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const newUser = userCredential.user;
      return firebase
        .database()
        .ref("users/" + newUser.uid)
        .set({
          email,
          surname,
          role,
        });
    })
    .then(() => {
      alert("Новый пользователь успешно зарегистрирован");
      const registrationForm = document.getElementById("registration-form");
      loggedInContent.removeChild(registrationForm);
    })
    .catch((error) => {
      console.error("Ошибка регистрации:", error);
      alert("Ошибка регистрации: " + error.message);
    });
};

// Обработчик события нажатия клавиши "Escape" для закрытия формы регистрации
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    hideRegistrationForm();
  }
});

// Функция для скрытия формы регистрации
const hideRegistrationForm = () => {
  const registrationForm = document.getElementById("registration-form");
  if (registrationForm) {
    loggedInContent.removeChild(registrationForm);
  }
};

// Функция для проверки статуса авторизации пользователя при загрузке страницы
function checkUserAuthStatus() {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      getUserDetails(user.uid)
        .then((userDetails) => {
          if (userDetails) {
            const { surname, role } = userDetails;
            showLoggedInContent(surname, role);

            // Проверяем, является ли пользователь администратором, и создаем кнопку обновления
            if (role === "admin") {
              createUpdateButton();
            } else {
              removeUpdateButton();
            }
          } else {
            showLoginForm();
          }
        })
        .catch((error) => {
          console.error("Ошибка при проверке данных пользователя:", error);
        });
    } else {
      showLoginForm();
      removeUpdateButton(); // Убеждаемся, что кнопка обновления удаляется при выходе из системы
    }
  });
}
checkUserAuthStatus();

// Функция для получения информации о пользователе из базы данных Firebase
async function getUserDetails(userId) {
  const userDetailsRef = firebase.database().ref(`users/${userId}`);
  const snapshot = await userDetailsRef.once("value");
  return snapshot.val();
}

// ------------------------------------------------------------------------------------------------------ БЛОК МОДАЛЬНОГО ОКНА --------------------------------------------//

// Функция для открытия модального окна для добавления новой заявки
async function openModalForNewRequest() {
  listTableRequest.innerHTML = "";
  resetForm();
  document.getElementById("fileInput").style.display = "block";
  // Получаем информацию о текущем пользователе
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    try {
      const userDetails = await getUserDetails(currentUser.uid);
      const initiatorField = document.getElementById("initiator");
      initiatorField.setAttribute("readonly", true);
      // Заполняем поле "Инициатор" фамилией текущего пользователя
      if (userDetails.surname) {
        initiatorField.value = userDetails.surname;
      } else {
        initiatorField.value = ""; // Если фамилия не указана, оставляем поле пустым
      }
    } catch (error) {
      console.error("Ошибка получения данных о пользователе: ", error);
    }
  }

  saveChangesBtn.classList.add("hidden");
  saveRequestBtn.classList.remove("hidden");
  document.getElementById("request-number").textContent = "";
  modal.classList.remove("hidden");
}

// Обработчик события на кнопку "Добавить заявку"
addBtn.addEventListener("click", openModalForNewRequest);

// Функция для сброса формы
function resetForm() {
  form.reset();
  formRequest.reset();
  // Сброс значений ваших input-ов
  document.getElementById("fileInput").value = "";
  document.getElementById("downloadfile").style.display = "none";
}

// Функция для закрытия модального окна
async function closeModal() {
  const currentUser = firebase.auth().currentUser;

  if (currentUser) {
    const currentRequestKey = saveChangesBtn.getAttribute("data-request-key");
    if (currentRequestKey) {
      try {
        const requestData = await getRequestData(currentRequestKey);

        if (requestData.isLocked && requestData.lockedBy === currentUser.uid) {
          // Разблокируем заявку
          await requestsRef.child(currentRequestKey).update({
            isLocked: null,
            lockedBy: null,
          });
        }
      } catch (error) {
        console.error("Ошибка снятия блокировки с заявки: ", error);
      }
    }
  }
  resetForm();
  modal.classList.add("hidden");
}

// Обработчик закрытия окна
closeButton.addEventListener("click", () => {
  if (
    confirm(
      "Закрыть окно заявки? Данные будут удалены, если не сохранены. Уверены?"
    )
  ) {
    closeModal();
  }
});

// Обработчик для редактирования заявки
async function handleEditRequest(event) {
  const requestKey = event.target.closest("tr").getAttribute("data-key");

  // Проверяем, прикреплен ли файл к заявке
  const querySnapshot = await documentsRef
    .where("requestKey", "==", requestKey)
    .get();

  if (!querySnapshot.empty) {
    const documentData = querySnapshot.docs[0].data();
    console.log("Документ уже прикреплен к заявке:", documentData);
    downloadfile.innerText = `Скачать файл: ${documentData.filename}`;
    downloadfile.href = URL.createObjectURL(
      new Blob([atob(documentData.fileContent)], {
        type: "application/octet-stream",
      })
    );
    downloadfile.style.display = "block";
    fileInput.style.display = "none";
  } else {
    console.log("Документ не прикреплен к заявке.");
    downloadfile.style.display = "none";
    fileInput.style.display = "block";
  }

  // Открываем модальное окно
  openModalForEditRequest(requestKey);
}

// Функция для создания строки таблицы с продуктом
function createItemRow(itemData) {
  const itemRow = document.createElement("tr");
  itemRow.classList.add("item-request");
  itemRow.innerHTML = `
    <td class="number-cell">${itemData.rowIndexRow}</td>
    <td class="category-cell">${itemData.category}</td>
    <td class="name-cell">${itemData.name}</td>
    <td class="variation-cell">${itemData.variation}</td>
    <td class="type-cell">${itemData.type}</td>
    <td class="equipment-cell">${itemData.equipment}</td>
    <td class="brand-cell">${itemData.brand}</td>
    <td class="code-cell">${itemData.code.trim().replace(/\s/g, "")}</td>
    <td class="comment-cell">${itemData.comment}</td>
    <td class="requestNom-cell">${itemData.requestNom}</td>
    <td>${itemData.statusNom ? itemData.statusNom : ""}</td>
    <td class="dateNom-cell">${itemData.dateNom}</td>
    <td class="count-cell">${itemData.count}</td>
    <td class="nameFirst-cell">${itemData.nameFirst}</td>
    <td class="button-cell">
      <button class="btn-edit" id="edit">Изменить</button>
    </td>
    <td class="button-cell">
      <button class="btn-remove" id="remove">Удалить</button>
    </td>
  `;

  return itemRow;
}

// Функция для открытия модального окна для редактирования заявки
async function openModalForEditRequest(requestKey) {
  try {
    const requestData = await getRequestData(requestKey);

    if (requestData.isLocked) {
      const userDetails = await getUserDetails(requestData.lockedBy);
      alert(
        `Заявка заблокирована пользователем: ${
          userDetails.surname || "Неизвестный пользователь"
        }`
      );

      saveChangesBtn.classList.add("hidden");
      saveRequestBtn.classList.add("hidden");
    } else {
      await lockRequest(requestKey);

      saveChangesBtn.classList.remove("hidden");
      saveRequestBtn.classList.add("hidden");
      saveChangesBtn.setAttribute("data-request-key", requestKey);
    }

    document.getElementById("request-number").textContent = requestData.number;
    document.getElementById("initiator").value = requestData.initiator;
    document.getElementById("executive-id").value = requestData.executive;
    document.getElementById("status-request").value = requestData.statusRequest;

    const tableRows = document.querySelectorAll(".item-request");
    tableRows.forEach((row) => row.remove());

    // Добавим проверку на тип данных перед использованием forEach
    if (Array.isArray(requestData.items)) {
      requestData.items.forEach((itemData) => {
        const itemRow = createItemRow(itemData);
        listTableRequest.appendChild(itemRow);
      });
    }
    modal.classList.remove("hidden");
  } catch (error) {
    alert("Ошибка получения данных о заявке: " + error.message);
    closeModal();
  }
}

// ------------------------------------------- БЛОК СОХРАНЕНИЯ ЗАЯВКИ --------------------------------------------//

// Функция для создания элемента сообщения
function createMessageDiv() {
  const messageDiv = document.createElement("div");
  messageDiv.id = "message";
  document.body.appendChild(messageDiv);
  return messageDiv;
}

// Функция для отображения сообщения об успешном сохранении заявки
function showSuccessMessage(messageDiv, requestNumber) {
  const message = "Данные успешно сохранены заявка № " + requestNumber;
  messageDiv.innerHTML = message;
  messageDiv.classList.add("success-message", "visible");

  setTimeout(() => {
    messageDiv.classList.remove("visible");
    setTimeout(() => {
      messageDiv.remove();
    }, 1000);
  }, 2000);
}

// Функция для получения данных из таблицы
function getTableData() {
  const tableRows = document.querySelectorAll(".item-request");
  const requestData = [];

  tableRows.forEach((row) => {
    const data = {
      rowIndexRow: row.querySelector(".number-cell").textContent,
      category: row.querySelector(".category-cell").textContent,
      name: row.querySelector(".name-cell").textContent,
      variation: row.querySelector(".variation-cell").textContent,
      type: row.querySelector(".type-cell").textContent,
      equipment: row.querySelector(".equipment-cell").textContent,
      brand: row.querySelector(".brand-cell").textContent,
      code: row
        .querySelector(".code-cell")
        .textContent.trim()
        .replace(/\s/g, ""),
      comment: row.querySelector(".comment-cell").textContent,
      requestNom: row.querySelector(".requestNom-cell").textContent,
      statusNom: row.querySelector(".statusNom-cell")
        ? row.querySelector(".statusNom-cell").textContent
        : "",
      dateNom: row.querySelector(".dateNom-cell").textContent,
      count: row.querySelector(".count-cell").textContent,
      nameFirst: row.querySelector(".nameFirst-cell").textContent,
    };
    requestData.push(data);
  });

  return requestData;
}

// Функция для сохранения заявки в базу данных
async function saveRequestToDatabase(request) {
  return new Promise((resolve, reject) => {
    requestsRef.push(request, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// Функция для получения нового номера заявки
async function getNewRequestNumber() {
  const snapshot = await requestsRef
    .orderByChild("number")
    .limitToLast(1)
    .once("value");
  let maxRequestNumber = 0;
  snapshot.forEach((childSnapshot) => {
    maxRequestNumber = childSnapshot.val().number;
  });
  return maxRequestNumber + 1;
}

// Функция для сохранения новой заявки в базу данных Firebase
async function saveRequestDatabase() {
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    alert("Вы должны войти в систему, чтобы сохранить заявку.");
    return;
  }

  const initiator = document.getElementById("initiator").value;
  const executive = document.getElementById("executive-id").value;
  const inputFile = document.getElementById("fileInput").files[0]; // Получение выбранного файла из input элемента

  if (initiator === "") {
    const fieldinitiator = document.getElementById("initiator");
    fieldinitiator.setCustomValidity("Заполните фамилию Инициатора");
    fieldinitiator.reportValidity();
    return;
  }

  const tableRows = document.querySelectorAll(".item-request");
  if (tableRows.length === 0) {
    alert("Добавьте ТМЦ в таблицу перед сохранением заявки.");
    return;
  }

  const requestData = getTableData();
  const newRequestNumber = await getNewRequestNumber();

  const request = {
    number: newRequestNumber,
    initiator: initiator,
    executive: executive,
    statusRequest: "Новая",
    date: new Date().toLocaleString(),
    items: requestData,
    uid: currentUser.uid, // Записываем uid пользователя в заявку
  };

  const messageDiv = createMessageDiv();
  try {
    const newRequestRef = await requestsRef.push(request);
    const newRequestKey = newRequestRef.key;

    // Если выбран файл для загрузки, прикрепляем его к заявке
    if (inputFile) {
      const docId = await attachDocumentToRequest(newRequestKey, inputFile);
      if (docId) {
        console.log(`Документ ${inputFile.name} успешно прикреплен к заявке.`);
      } else {
        console.error(
          `Ошибка при прикреплении документа ${inputFile.name} к заявке.`
        );
      }
    }

    showSuccessMessage(messageDiv, newRequestNumber);

    resetForm();
    closeModal();

    // Обновляем таблицу после успешного сохранения заявки
    updateTable();
  } catch (error) {
    console.error("Ошибка записи в базу данных: ", error);
  }
}

// Обработчик сохранения в базу
saveRequestBtn.addEventListener("click", saveRequestDatabase);

// ---------------------------------- БЛОК ЗАГРУЗКИ В ТАБЛИЦУ ЗАЯВОК --------------------------------------------//

//создание строк таблицы заявок
function createTableRow(requestData, requestKey) {
  const tableRow = document.createElement("tr");
  tableRow.setAttribute("data-key", requestKey);

  const allProductsHaveCode =
    requestData.items &&
    requestData.items.every((itemData) => {
      const trimmedCode = String(itemData.code).trim();
      return trimmedCode !== "";
    });

  tableRow.innerHTML = `
    <td class="id-cell">${requestData.number}${
    requestData.isLocked ? ' <i class="fa fa-lock"></i>' : ""
  }</td>
    <td class="checkmark-cell">${
      allProductsHaveCode ? '<i class="fa fa-check"></i>' : ""
    }</td>
    <td class="number-cell">${requestKey}</td>
    <td class="date-cell">${requestData.date}</td>
    <td class="in-cell">${requestData.initiator}</td>
    <td class="executive-cell">${requestData.executive}</td>
    <td class="status-cell">${requestData.statusRequest}</td>
    <td class="completion-date-cell">${requestData.completionDate || ""}</td>
    <td class="button-cell">
      <button class="edit-request-button">Редактировать</button>
    </td>
    <td class="button-cell">
      <button class="btn-delete">Удалить</button>
    </td>
  `;

  return tableRow;
}

async function updateTable() {
  try {
    const snapshot = await requestsRef.once("value");
    const requestsData = snapshot.val();

    // Преобразуем объект с заявками в массив
    const requestsArray = Object.entries(requestsData).map(([key, value]) => ({
      key,
      ...value,
    }));

    // Сортировка и фильтрация заявок по условию
    const sortedRequests = requestsArray
      .filter((request) => {
        const inCell = request.initiator.toLowerCase();
        const executiveCell = request.executive
          ? request.executive.toLowerCase()
          : ""; // Handle the case when executiveCell is null
        return (
          inCell.includes(searchFilter.toLowerCase()) ||
          executiveCell.includes(searchFilter.toLowerCase()) ||
          !request.executive // Show rows where executive-cell is not filled
        );
      })
      .sort((a, b) => {
        // Сначала заявки без статуса "Выполнена"
        if (
          a.statusRequest !== "Выполнена" &&
          b.statusRequest === "Выполнена"
        ) {
          return -1; // a раньше b
        } else if (
          a.statusRequest === "Выполнена" &&
          b.statusRequest !== "Выполнена"
        ) {
          return 1; // b раньше a
        }
        return b.number - a.number; // Заявки с одинаковым статусом сортируются по убыванию номера
      });

    // Определяем начальный и конечный индексы заявок для текущей страницы
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, sortedRequests.length);

    // Очищаем содержимое таблицы
    table.innerHTML = "";

    // Создаем строки таблицы для каждой заявки и добавляем их в таблицу
    for (let i = startIndex; i < endIndex; i++) {
      const { key, ...requestData } = sortedRequests[i];
      const tableRow = createTableRow(requestData, key);
      table.appendChild(tableRow);
    }

    // Рассчитываем общее количество страниц
    totalPages = Math.ceil(sortedRequests.length / itemsPerPage);

    // Обновляем состояние кнопок пагинации и номеров страниц
    document.getElementById("prev-page").style.opacity =
      currentPage === 1 ? "0" : "1";
    document.getElementById("next-page").style.opacity =
      currentPage === totalPages ? "0" : "1";
    updatePageNumbers();
  } catch (error) {
    console.error("Ошибка получения данных: ", error);
  }
}

// Вызываем функцию для первоначального отображения таблицы
updateTable();

// ------------------------------------ БЛОК УПРАВЛЕНИЯ ПАГИНАЦИЕЙ --------------------------------------------//

// Обработчик кнопки "Предыдущая страница"
document.getElementById("prev-page").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    updateTable();
  }
});

// Обработчик кнопки "Следующая страница"
document.getElementById("next-page").addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    updateTable();
  }
});

// Глобальные переменные для управления пагинацией
let currentPage = 1;
let itemsPerPage = 100;
let totalPages = 0;

// Функция для обновления кнопок с номерами страниц
function updatePageNumbers() {
  const pageNumbersDiv = document.getElementById("page-numbers");
  pageNumbersDiv.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageNumberBtn = document.createElement("button");
    pageNumberBtn.textContent = i;
    pageNumberBtn.addEventListener("click", () => {
      currentPage = i;
      updateTable();
    });

    // Добавляем класс .active к кнопке текущей страницы
    if (i === currentPage) {
      pageNumberBtn.style.color = "#007cff";
    }

    pageNumbersDiv.appendChild(pageNumberBtn);
  }
}

// ------------------------------------------ БЛОК ОБНОВЛЕНИЯ ЗАЯВОК --------------------------------------------//
async function refreshRequest(requestKey) {
  try {
    const requestSnapshot = await database
      .ref(`requests/${requestKey}`)
      .once("value");
    const requestData = requestSnapshot.val();
    const items = await loadItems();

    const codeVariationToNameTypeMap = {};
    const nameVariationTypeToCodeMap = {};

    Object.keys(items).forEach((key) => {
      const { code, name, variation, type } = items[key];
      const itemCodeAsString = String(code);
      const codeVariation = `${itemCodeAsString}-${variation}`;
      codeVariationToNameTypeMap[codeVariation] = { name, type };
      nameVariationTypeToCodeMap[`${name}-${variation}-${type}`] =
        itemCodeAsString;
    });

    if (requestData && Array.isArray(requestData.items)) {
      requestData.items.forEach((item, index) => {
        const { code, variation } = item;
        if (code) {
          const codeVariationKey = `${String(code)}-${variation}`;
          const existingItem = codeVariationToNameTypeMap[codeVariationKey];
          if (existingItem) {
            requestData.items[index].name = existingItem.name;
            requestData.items[index].type = existingItem.type;
          } else {
            const newItemKey = itemsRef.push().key;
            itemsRef.child(newItemKey).set(item);
            codeVariationToNameTypeMap[codeVariationKey] = {
              name: item.name,
              type: item.type,
            };
          }
        } else {
          const nameVariationTypeKey = `${item.name}-${item.variation}-${item.type}`;
          requestData.items[index].code = String(
            nameVariationTypeToCodeMap[nameVariationTypeKey] || ""
          );
        }
      });

      await requestsRef.child(requestKey).update(requestData);
      console.log(`Request ${requestKey} успешно обновлены.`);
    } else {
      console.error("Invalid request data");
    }
  } catch (error) {
    console.error("Failed to refresh request:", error);
  }
}

// Функция для обновления заявки в базе данных
async function updateRequestInDatabase(requestKey, requestData) {
  return new Promise((resolve, reject) => {
    requestsRef.child(requestKey).update(requestData, async (error) => {
      if (error) {
        reject(error);
      } else {
        // После успешного обновления заявки, обновляем данные элементов в этой заявке
        await refreshRequest(requestKey);
        resolve();
      }
    });
  });
}

function areAllItemsFilled(itemsData) {
  return itemsData.every((itemData) => {
    // const trimmedCode = String(itemData.code).trim();
    const trimmedRequestNom = String(itemData.requestNom).trim();

    // Проверяем, что код и номер заказа заполнены для каждого продукта
    return trimmedRequestNom !== "";
  });
}

// Функция обновления заявки
async function updateRequest() {
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    alert("Вы должны войти в систему, чтобы обновить заявку.");
    return;
  }

  const requestKey = saveChangesBtn.getAttribute("data-request-key");
  const initiator = document.getElementById("initiator").value;
  const executive = document.getElementById("executive-id").value;
  const statusRequest = document.getElementById("status-request").value;
  const currentCompletionDate =
    document.querySelector(`[data-key='${requestKey}'] .completion-date-cell`)
      .textContent || null;
  // Используем текущую дату завершения в качестве значения по умолчанию
  let completionDate = currentCompletionDate;

  // Если статус заявки "Выполнена" и текущая дата завершения не установлена, устанавливаем новую дату
  if (statusRequest === "Выполнена" && !currentCompletionDate) {
    completionDate = new Date().toLocaleString();
  } else if (statusRequest !== "Выполнена" && currentCompletionDate) {
    completionDate = null;
  }

  if (initiator === "") {
    const fieldInitiator = document.getElementById("initiator");
    fieldInitiator.setCustomValidity("Заполните фамилию Инициатора");
    fieldInitiator.reportValidity();
    return;
  }

  const requestData = getTableData();

  // Проверяем, что статус заявки установлен на "Выполнена"
  if (statusRequest === "Выполнена") {
    if (executive === "") {
      const fieldExecutive = document.getElementById("executive-id");
      fieldExecutive.setCustomValidity("Заполните фамилию Исполнителя");
      fieldExecutive.reportValidity();
      return;
    }

    // Проверяем, что все продукты в заявке имеют заполненные значения для code и requestNom
    if (!areAllItemsFilled(requestData)) {
      alert(
        "Заполните Код и № Заказа для ТМЦ перед установкой статуса: Выполнена."
      );
      return;
    }
  }

  try {
    await updateRequestInDatabase(requestKey, {
      initiator: initiator,
      executive: executive,
      statusRequest: statusRequest,
      items: requestData,
      completionDate: completionDate,
    });
    closeModal();
    // Обновляем таблицу после успешного обновления заявки
    setTimeout(updateTable, 1000); // Задержка 1 секунды, соответствует длительности анимации
    // Выделяем обновленную строку
    const updatedRow = document.querySelector(`[data-key='${requestKey}']`);
    if (updatedRow) {
      updatedRow.classList.add("updated-row");
      setTimeout(() => {
        updatedRow.classList.remove("updated-row");
      }, 3000); // Убираем выделение через 3 секунды
    }
  } catch (error) {
    console.error("Ошибка записи в базу данных: ", error);
  }
}

//----------------------------------------- БЛОК УДАЛЕНИЯ ЗАЯВОК --------------------------------------------//

// Обработчик для удаления заявки
async function handleDeleteRequest(event) {
  if (confirm("Вы действительно хотите удалить эту заявку?")) {
    const requestKey = event.target.closest("tr").getAttribute("data-key");
    const currentUser = firebase.auth().currentUser;

    if (currentUser) {
      try {
        // Получаем информацию о текущем пользователе
        const userDetails = await getUserDetails(currentUser.uid);

        // Получаем данные о заявке
        const requestData = await getRequestData(requestKey);

        // Проверяем, является ли текущий пользователь инициатором заявки или администратором
        if (
          userDetails.role === "admin" ||
          requestData.initiator === userDetails.surname
        ) {
          // Удаляем связанные с заявкой файлы или документы из коллекции documents
          const documentsQuerySnapshot = await documentsRef
            .where("requestKey", "==", requestKey)
            .get();

          const deletePromises = documentsQuerySnapshot.docs.map(
            async (doc) => {
              await doc.ref.delete();
              console.log("Документ успешно удален из коллекции documents.");
            }
          );

          // Ожидаем выполнения всех промисов перед продолжением
          await Promise.all(deletePromises);

          // Удаляем заявку из базы данных
          await requestsRef.child(requestKey).remove();
          event.target.closest("tr").remove();
          alert("Заявка успешно удалена");

          // Если заявка была заблокирована, то снимаем блокировку перед удалением
          if (
            requestData.isLocked &&
            requestData.lockedBy === currentUser.uid
          ) {
            await unlockRequestInDatabase(requestKey);
          }

          // Обновляем таблицу после удаления заявки
          updateTable();
        } else {
          alert("У вас нет прав для удаления этой заявки");
        }
      } catch (error) {
        console.error("Ошибка удаления заявки: ", error);
      }
    } else {
      alert("Вы должны войти в систему, чтобы удалить заявку.");
    }
  }
}

// Функция для перемещения заявки в архив удаленных заявок
async function moveRequestToDeleted(requestKey) {
  try {
    const requestData = await getRequestData(requestKey);

    // Если заявка заблокирована, снимаем блокировку перед перемещением в архив
    if (requestData.isLocked) {
      await unlockRequestInDatabase(requestKey);
    }

    // Получаем информацию о текущем пользователе
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const userDetails = await getUserDetails(currentUser.uid);

      // Если у текущего пользователя есть фамилия, добавляем её к данным о заявке
      if (userDetails.surname) {
        requestData.deletedBy = userDetails.surname;
      }
    }

    requestData.deletedAt = new Date().toISOString();

    await deletedRequestsRef.child(requestKey).set(requestData);
    return requestData;
  } catch (error) {
    console.error("Ошибка перемещения заявки в архив: ", error);
    throw error;
  }
}

// Функция для удаления заявки из базы данных
async function deleteRequestFromDatabase(requestKey) {
  try {
    // Получаем информацию о текущем пользователе
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      const userDetails = await getUserDetails(currentUser.uid);

      // Если у текущего пользователя есть фамилия, добавляем её к данным о заявке
      if (userDetails.surname) {
        // Получаем данные о заявке
        const requestData = await getRequestData(requestKey);

        // Удаляем поле isLocked из объекта данных о заявке, если оно существует
        if (requestData.hasOwnProperty("isLocked")) {
          delete requestData.isLocked;
        }

        // Обновляем данные о заявке в базе данных
        await requestsRef.child(requestKey).set(requestData);
      }
    }

    // Удаляем заявку из базы данных
    await requestsRef.child(requestKey).remove();

    return true;
  } catch (error) {
    console.error("Ошибка удаления заявки: ", error);
    throw error;
  }
}

// ----------------------------------------------- БЛОК БЛОКИРОВКИ ЗАЯВОК --------------------------------------------//

// Функция для разблокировки заявки в базе данных
async function unlockRequestInDatabase(requestKey) {
  return new Promise((resolve, reject) => {
    requestsRef.child(requestKey).update(
      {
        isLocked: null,
        lockedBy: null,
      },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

// Функция для разблокировки заявки
async function unlockRequest(requestKey) {
  try {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) {
      alert("Пользователь не авторизован");
      return;
    }

    const userDetails = await getUserDetails(currentUser.uid);

    if (userDetails.role === "admin") {
      await unlockRequestInDatabase(requestKey);

      const lockIcon = document.querySelector(
        `tr[data-key="${requestKey}"] .fa-lock`
      );
      if (lockIcon) {
        lockIcon.remove();
      }
    } else {
      alert("У вас нет прав для разблокировки заявки");
    }
  } catch (error) {
    console.error("Ошибка разблокировки заявки: ", error);
  }
}

// Функция для блокировки заявки
async function lockRequest(requestKey) {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    await lockRequestInDatabase(requestKey, currentUser.uid);
  }
}

// Функция для блокировки заявки в базе данных
async function lockRequestInDatabase(requestKey, userId) {
  return new Promise((resolve, reject) => {
    requestsRef.child(requestKey).update(
      {
        isLocked: true,
        lockedBy: userId,
      },
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
}

// Функция для получения данных о заявке из базы данных
async function getRequestData(requestKey) {
  const snapshot = await requestsRef.child(requestKey).once("value");
  return snapshot.val();
}

// Обработчик для снятия блокировки перед закрытием страницы или обновлением
window.addEventListener("beforeunload", async (event) => {
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    const currentRequestKey = saveChangesBtn.getAttribute("data-request-key");
    if (currentRequestKey) {
      try {
        const requestRef = database.ref("requests/" + currentRequestKey);
        await requestRef.update({
          isLocked: null,
          lockedBy: null,
        });

        // Установим свое уведомление перед закрытием страницы
        event.returnValue =
          "Вы уверены, что хотите покинуть страницу? Внесенные изменения могут быть потеряны.";
      } catch (error) {
        console.error("Ошибка снятия блокировки с заявки: ", error);
      }
    }
  }
});

// ----------------------------- БЛОК ЗАГРУЗКИ ИСПОЛНИТЕЛЯ  --------------------------------------------//

// Добавление обработчиков для клика на кнопки в таблице
table.addEventListener("click", async (event) => {
  if (event.target.classList.contains("btn-delete")) {
    await handleDeleteRequest(event);
  } else if (event.target.classList.contains("edit-request-button")) {
    handleEditRequest(event);
  } else if (event.target.classList.contains("fa-lock")) {
    const requestKey = event.target.closest("tr").getAttribute("data-key");
    unlockRequest(requestKey);
  }
});
// Функция для загрузки списка фамилий пользователей
async function loadUserSurnames() {
  try {
    const userDetailsRef = firebase.database().ref(`users`);
    const snapshot = await userDetailsRef.once("value"); // Исправление здесь
    const usersData = snapshot.val();
    const executiveList = document.getElementById("executive-list");

    // Очищаем список перед загрузкой новых данных
    executiveList.innerHTML = "";

    for (const userId in usersData) {
      const { surname } = usersData[userId];
      if (surname) {
        const option = document.createElement("option");
        option.value = surname;
        executiveList.appendChild(option);
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки фамилий пользователей:", error);
  }
}

// Вызываем функцию загрузки списка фамилий при загрузке страницы
loadUserSurnames();

// Добавляем обработчик для изменения значения в поле исполнителя
document.getElementById("executive-id").addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase();
  const options = document.querySelectorAll("#executive-list option");

  options.forEach((option) => {
    const value = option.value.toLowerCase();
    option.style.display = value.includes(searchTerm) ? "block" : "none";
  });
});

// Функция для установки сообщения об ошибке для поля
function setFieldError(field, message) {
  field.setCustomValidity(message);
  field.reportValidity();
}

//функция для редактирования поля ввода
function capitalizeWords(input) {
  const forbiddenChars = /[\\:?<>\|"%&@;#!№]/g;
  const originalValue = input.value.trim();
  if (originalValue.length === 0) {
    return;
  }
  const sanitizedValue = originalValue.replace(forbiddenChars, "");

  // Заглавить только первую букву строки
  const words = sanitizedValue.split(/\s+/);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  const capitalizedValue = words.join(" ").replace(/\s(?=\S)/g, " ");
  const finalValue = capitalizedValue.replace(/\*/g, "x");

  input.value = finalValue;
}

// Функция для проверки полей на наличие ошибок
function validateFields() {
  const categoryField = formRequest.elements.category;
  const nameField = formRequest.elements.name;
  const variationField = formRequest.elements.variation;
  const countField = formRequest.elements["input-count"];
  const typeField = formRequest.elements.type;
  const equipmentField = formRequest.elements.equipment;

  let hasError = false;

  if (!nameField.value.trim()) {
    setFieldError(nameField, "Введите имя");
    hasError = true;
  } else {
    nameField.setCustomValidity("");
  }

  if (!variationField.value.trim()) {
    setFieldError(variationField, "Введите вариант исполнения");
    hasError = true;
  } else {
    variationField.setCustomValidity("");
  }

  if (!countField.value.trim()) {
    setFieldError(countField, "Введите количество");
    hasError = true;
  } else {
    countField.setCustomValidity("");
  }

  if (!categoryField.value) {
    setFieldError(categoryField, "Выберите категорию");
    hasError = true;
  } else if (
    categoryField.value === "Запасные части" &&
    !equipmentField.value
  ) {
    setFieldError(
      equipmentField,
      "Укажите оборудование для категории Запасные части"
    );
    hasError = true;
  } else {
    equipmentField.setCustomValidity("");
    categoryField.setCustomValidity("");
  }

  return !hasError;
}

//ФУНКЦИЯ БЛОКИРОВОК ПОЛЕЙ
categoryInput.addEventListener("change", () => {
  if (
    categoryInput.value === "Образцы" ||
    categoryInput.value === "Осн. материалы" ||
    categoryInput.value === "Спецодежда"
  ) {
    variationInput.disabled = false;
  } else {
    variationInput.disabled = true;
  }

  if (categoryInput.value === "Запасные части") {
    equipmentInput.disabled = false;
  } else {
    equipmentInput.disabled = true;
  }
});

// ---------------------------------------- БЛОК СОЗДАНИЯ ПРОДУКТОВ --------------------------------------------//

async function addNomenklatureTable(event) {
  event.preventDefault();

  // Отключаем кнопку во время выполнения функции
  addProductBtn.disabled = true;

  try {
    const categoryField = formRequest.elements.category;
    const nameField = formRequest.elements.name;
    const variationField = formRequest.elements.variation;
    const countField = formRequest.elements["input-count"];
    const typeField = formRequest.elements.type;
    const equipmentField = formRequest.elements.equipment;
    const name = nameField.value.trim();
    const nameFirst = nameField.value.trim();
    const variation = variationField.value.trim();
    const count = countField.value.trim();
    const category = categoryField.value;

    let hasError = false;

    if (!name) {
      setFieldError(nameField, "Введите имя");
      hasError = true;
    } else {
      nameField.setCustomValidity("");
    }

    if (!variation) {
      setFieldError(variationField, "Введите вариант исполнения");
      hasError = true;
    } else {
      variationField.setCustomValidity("");
    }

    if (!count) {
      setFieldError(countField, "Введите количество");
      hasError = true;
    } else {
      countField.setCustomValidity("");
    }

    if (!categoryField.value) {
      setFieldError(categoryField, "Выберите категорию");
      hasError = true;
    } else if (
      categoryField.value === "Запасные части" &&
      !equipmentField.value
    ) {
      setFieldError(
        equipmentField,
        "Укажите оборудование для категории Запасные части"
      );
      hasError = true;
    } else {
      equipmentField.setCustomValidity("");
      categoryField.setCustomValidity("");
    }

    if (hasError) {
      return;
    }

    let code = "";
    const items = await loadItems(); // Добавьте await здесь
    Object.keys(items).forEach((key) => {
      const item = items[key];
      if (
        item.name === name &&
        item.variation === variation &&
        item.type === typeField.value
      ) {
        code = item.code;
      }
    });

    const rowIndex = listTableRequest.rows.length + 1;

    const itemRequest = `
        <tr class="item-request">
          <td class="number-cell">${rowIndex}</td>
          <td class="category-cell">${formRequest.elements.category.value}</td>
          <td class="name-cell">${name}</td>
          <td class="variation-cell">${variation}</td>
          <td class="type-cell">${formRequest.elements.type.value}</td>
          <td class="equipment-cell">${formRequest.elements.equipment.value}</td>
          <td class="brand-cell"></td> 
          <td class="code-cell">${code}</td>
          <td class="comment-cell"></td>
          <td class="requestNom-cell"></td>
          <td class="statusNom-cell"></td> 
          <td class="dateNom-cell"></td>
          <td class="count-cell">${count}</td>
          <td class="nameFirst-cell">${nameFirst}</td>
          <td class="button-cell"><button class="btn-edit" id="edit">Изменить</button></td>
          <td class="button-cell"><button class="btn-remove" id="remove">Удалить</button></td>
        </tr>
`;
    listTableRequest.insertAdjacentHTML("beforeend", itemRequest);
    formRequest.reset();
  } catch (error) {
    console.error("Error in addNomenklatureTable:", error);
  } finally {
    // Включаем кнопку после выполнения функции, даже если возникла ошибка
    addProductBtn.disabled = false;
  }
}

// добавляем обработчик события на кнопку закрытия модального окна
addProductBtn.addEventListener("click", addNomenklatureTable);

// ------------------------------------------ БЛОК РЕДАКТИРОВАНИЕ ЯЧЕЕК --------------------------------------------//

// Функция для включения режима редактирования ячейки
const enableCellEditing = (cell) => {
  cell.contentEditable = true;
  cell.style.backgroundColor = "#f0ffff";
  cell.style.borderColor = "#d9f0ff";
  cell.addEventListener("input", () => {
    cell.textContent = cell.textContent.replace(/<[^>]+>/g, "");
  });
};

// Функция для отключения режима редактирования ячейки
const disableCellEditing = (cell) => {
  cell.contentEditable = false;
  cell.style.backgroundColor = "";
  cell.style.borderColor = "";
};

// Функция для обновления текста кнопки
const updateButtonText = (button, text) => {
  if (button) {
    button.textContent = text;
  }
};

// Обработчик события на чекбоксе режима редактирования
editListCheckbox.addEventListener("change", (event) => {
  const isEditMode = event.target.checked;

  document.querySelectorAll(".item-request").forEach((item) => {
    const editButton = item.querySelector(".btn-edit");
    const cells = item.querySelectorAll("td:not(.button-cell)");

    // Включаем или выключаем режим редактирования в зависимости от состояния чекбокса
    if (isEditMode) {
      updateButtonText(editButton, "Сохранить");
      cells.forEach(enableCellEditing);
    } else {
      updateButtonText(editButton, "Изменить");
      cells.forEach(disableCellEditing);

      // Сохраняем данные из формы, если нужно
      const dataForm = Object.fromEntries(
        new FormData(item.formRequest).entries()
      );
      Object.assign(item, { data: dataForm });
    }
  });
});

// Обработчик события ПО КЛИКУ НА ТАБЛИЦЕ ПРОДУКТОВ
listTableRequest.addEventListener("click", (event) => {
  const target = event.target;

  // Если нажата кнопка удаления
  if (target.matches(".btn-remove")) {
    const item = target.closest(".item-request");
    if (item && item.parentNode) {
      item.parentNode.removeChild(item);
    }
  }
  // Если нажата кнопка редактирования
  else if (target.matches(".btn-edit")) {
    const item = target.closest(".item-request");
    const editButton = item.querySelector(".btn-edit");
    const cells = item.querySelectorAll("td:not(.button-cell)");

    if (editButton.textContent === "Изменить") {
      // Режим редактирования
      updateButtonText(editButton, "Сохранить");
      cells.forEach(enableCellEditing);
    } else {
      // Режим сохранения
      updateButtonText(editButton, "Изменить");
      cells.forEach(disableCellEditing);

      if (item) {
        const dataForm = Object.fromEntries(
          new FormData(item.formRequest).entries()
        );
        Object.assign(item, { data: dataForm });
      } else {
        console.log("Элемент не найден");
      }
    }
  }
});

// -------------------------------------------------- БЛОК ФИЛЬТРАЦИИ --------------------------------------------//

// функция фильтрации
function setColumnWidths(table) {
  const rows = table.querySelectorAll("tr");

  if (rows.length > 0) {
    const headerCells = rows[0].querySelectorAll("th, td");
    const widths = Array.from(headerCells).map(
      (cell) => cell.getBoundingClientRect().width
    );

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      cells.forEach((cell, index) => {
        cell.style.width = `${widths[index]}px`;
      });
    });
  }
}

// Функция для фильтрации таблицы по значениям в ячейках заголовка
function filterTable(event) {
  // Получаем таблицу, в которой произошло событие
  const table = event.target.closest("table");

  // Устанавливаем ширину столбцов перед фильтрацией
  setColumnWidths(table);

  const filters = {};

  // Получаем все фильтры
  table
    .querySelectorAll(".filter-row input, .filter-row select")
    .forEach((filter) => {
      const th = filter.closest("th");
      const colIndex = Array.from(th.parentNode.children).indexOf(th);
      filters[colIndex] = filter.value.toUpperCase();
    });

  const rows = table.querySelectorAll("tbody tr");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.getElementsByTagName("td");
    let rowMatchesAllFilters = true;

    for (const colIndex in filters) {
      if (filters.hasOwnProperty(colIndex)) {
        const filter = filters[colIndex];
        const cell = cells[colIndex];

        if (cell) {
          const text = cell.textContent.toUpperCase();
          if (text.indexOf(filter) === -1) {
            rowMatchesAllFilters = false;
            break;
          }
        }
      }
    }

    if (rowMatchesAllFilters) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }

  // Устанавливаем ширину столбцов после фильтрации
  setColumnWidths(table);
}

// Назначаем обработчики событий на элементы фильтрации
const filters = document.querySelectorAll(
  ".filter-row input, .filter-row select"
);
for (let i = 0; i < filters.length; i++) {
  filters[i].addEventListener("input", filterTable);
}

const toggleButtons = document.querySelectorAll(".toggle-filter-button");

toggleButtons.forEach((button) => {
  const th = button.closest("th");
  const dropdown = th.querySelector(".filter-dropdown");
  const filterInput = dropdown.querySelector("input, select");

  button.addEventListener("click", () => {
    dropdown.classList.toggle("active");
    button.classList.toggle("active");

    if (!dropdown.classList.contains("active")) {
      filterInput.value = "";
      const fakeEvent = {
        target: filterInput,
      };

      // Вызываем функцию filterTable, чтобы обновить таблицу после очистки фильтра
      filterTable.call(filterInput, fakeEvent);
    }
  });
});

// ------------------------------------------ БЛОК ПОИСКА НОМЕНКЛАТУРЫ --------------------------------------------//

//функция для поиска номенклатуры
const nameInput = document.getElementById("name");
const typeInput = document.getElementById("type");
const variationInput = document.getElementById("variation");
const codeInput = document.getElementById("input-code");
const autocompleteList = document.getElementById("autocompleteList");

let items = [];
let miniSearch;

// Load data from firebase
async function loadData() {
  const itemsObject = await loadItems();
  const items = itemsObject
    ? Object.entries(itemsObject).map(([id, item]) => ({
        id,
        ...item,
      }))
    : [];

  miniSearch = new MiniSearch({
    fields: ["name", "variation", "code", "type"],
    idField: "id",
    storeFields: ["name", "variation", "code", "type"],
    caseSensitive: false,
    normalizeField: false,
  });

  const allItems = items.map((item, index) => {
    return {
      ...item,
      id: index + 1, // create unique ID for each item
    };
  });

  miniSearch.addAll(allItems);
}

// Search and update UI
function search(searchTerm) {
  if (!searchTerm) {
    autocompleteList.innerHTML = "";
    return;
  }

  const results = miniSearch
    .search(searchTerm.toLowerCase(), {
      prefix: true,
      termFrequency: false,
      fuzzy: 0.4,
      boost: {
        name: 2,
        variation: 1,
        code: 1,
        type: 1,
      },
      threshold: 0.2,
    })
    .slice(0, 30);

  updateAutocompleteList(results);
}

// Update the autocomplete list based on search results
function updateAutocompleteList(results) {
  const fragment = document.createDocumentFragment();
  const uniqueItems = new Set();

  if (!results.length) {
    createNoResultsElement(fragment);
  } else {
    createAutocompleteItems(results, uniqueItems, fragment);
  }

  autocompleteList.innerHTML = "";
  autocompleteList.appendChild(fragment);
}

function createNoResultsElement(fragment) {
  const noResultsEl = document.createElement("div");
  noResultsEl.classList.add("autocomplete-item");
  noResultsEl.innerText = "Нет результатов";
  fragment.appendChild(noResultsEl);
}

function createAutocompleteItems(results, uniqueItems, fragment) {
  const searchTerm = nameInput.value;

  results.forEach((item) => {
    const { name, variation, code, type } = item || {};
    const itemKey = `${name}-${variation}-${code}-${type}`;

    if (uniqueItems.has(itemKey)) {
      return; // skip duplicates
    }
    uniqueItems.add(itemKey); // add unique item to Set

    const el = document.createElement("div");
    el.classList.add("autocomplete-item");

    const highlightedName = document.createElement("div");
    highlightedName.innerHTML = highlightMatch(name, searchTerm);
    el.appendChild(highlightedName);

    const info = document.createElement("div");
    info.innerHTML = `ВИ: ${variation}  Код: (${code}) ${type}`;
    el.appendChild(info);

    el.addEventListener("click", () => {
      nameInput.value = name;
      variationInput.value = variation;
      codeInput.value = code;
      typeInput.value = type;
      autocompleteList.innerHTML = "";
    });
    fragment.appendChild(el);
  });
}

function highlightMatch(text, searchTerm) {
  const searchWords = searchTerm.split(/\s+/);
  const escapedSearchWords = searchWords.map((word) =>
    word.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")
  );
  const regex = new RegExp("(" + escapedSearchWords.join("|") + ")", "gi");

  return text.replace(regex, "<mark>$1</mark>");
}

let searchTimeout;

// Event listeners
nameInput.addEventListener("input", async (e) => {
  clearTimeout(searchTimeout);
  await loadData();

  searchTimeout = setTimeout(() => search(e.target.value.toLowerCase()), 10);
});

document.addEventListener("click", (e) => {
  if (!autocompleteList.contains(e.target)) {
    autocompleteList.innerHTML = "";
  }
});

nameInput.addEventListener(
  "input",
  () => ((codeInput.value = ""), (variationInput.value = "осн."))
);

// -------------------------------------- БЛОК ПОИСКА ОБОРУДОВАНИЯ --------------------------------------------//

const equipmentRef = database.ref("equipment");
const equipmentInput = document.getElementById("equipment");
const equipmentAutocompleteList = document.getElementById("equipment-list");

let equipment = [];

// Load data from firebase
async function loadEquipmentData() {
  const equipmentSnapshot = await equipmentRef.once("value");

  equipment = equipmentSnapshot.val()
    ? Object.entries(equipmentSnapshot.val()).reduce((acc, [id, data]) => {
        if (!acc.some((equipment) => equipment.title === data.title)) {
          acc.push({
            id,
            ...data,
          });
        }
        return acc;
      }, [])
    : [];

  miniSearchEquipment = new MiniSearch({
    fields: ["title"],
    idField: "id",
    storeFields: ["title", "in_code"],
  });

  miniSearchEquipment.addAll(equipment);
}

loadEquipmentData();

function searchEquipment(searchTerm) {
  if (!searchTerm) {
    equipmentAutocompleteList.innerHTML = "";
    return;
  }

  // Check if miniSearchEquipment is initialized before searching
  const results = miniSearchEquipment
    .search(searchTerm, {
      prefix: true,
      boost: {
        title: 2,
      },
      termFrequency: false,
      fuzzy: 0.3,
    })
    .slice(0, 10);

  updateEquipmentAutocompleteList(results);
}

function updateEquipmentAutocompleteList(results) {
  const fragment = document.createDocumentFragment();

  if (!results.length) {
    createNoResultsElement(fragment);
  } else {
    createEquipmentAutocompleteItems(results, fragment);
  }

  equipmentAutocompleteList.innerHTML = "";
  equipmentAutocompleteList.appendChild(fragment);
}

function createEquipmentAutocompleteItems(results, fragment) {
  results.forEach((equipment) => {
    const { title, in_code } = equipment || {};

    const el = document.createElement("div");
    el.classList.add("autocomplete-item");
    el.innerText = `${title}\n (Инв.номер: ${in_code})`;
    el.addEventListener("click", () => {
      equipmentInput.value = title;
      equipmentAutocompleteList.innerHTML = "";
    });
    fragment.appendChild(el);
  });
}

let searchEquipmentTimeout;

equipmentInput.addEventListener("input", (e) => {
  clearTimeout(searchEquipmentTimeout);
  searchEquipmentTimeout = setTimeout(
    () => searchEquipment(e.target.value),
    200
  );
});

document.addEventListener("click", (e) => {
  if (!equipmentAutocompleteList.contains(e.target)) {
    equipmentAutocompleteList.innerHTML = "";
  }
});

// --------------------------------------- БЛОК ТАБЛИЦЫ ПРОСМОТР ТМЦ --------------------------------------------//

// Объект для кэширования данных о заявках
const requestsCache = {};

// Функция для получения данных о заявках из кэша или базы данных
async function getRequestsDataFromCacheOrDatabase() {
  // Проверяем, есть ли данные в кэше
  if (Object.keys(requestsCache).length > 0) {
    return Object.values(requestsCache);
  } else {
    // Если данных нет в кэше, делаем запрос к базе данных
    const snapshot = await requestsRef.once("value");
    const requestsData = snapshot.val();

    // Обновляем кэш данными
    Object.keys(requestsData).forEach((requestKey) => {
      requestsCache[requestKey] = requestsData[requestKey];
    });

    return Object.values(requestsData);
  }
}

const viewRequestsButton = document.getElementById("view-requests");
const requestsTableContainer = document.getElementById(
  "requests-table-container"
);
const productsTableContainer = document.getElementById(
  "products-table-container"
);
const productsTable = document.getElementById("products-table");
const productsTableBody = document.getElementById("products-table-body");

viewRequestsButton.addEventListener("click", async () => {
  // Переключение видимости таблиц
  const isRequestsTableVisible =
    requestsTableContainer.style.display !== "none";
  requestsTableContainer.style.display = isRequestsTableVisible
    ? "none"
    : "block";
  productsTableContainer.style.display = isRequestsTableVisible
    ? "block"
    : "none";

  if (isRequestsTableVisible) {
    // Очистите таблицу перед загрузкой новых данных
    productsTableBody.innerHTML = "";

    try {
      // Получаем данные о заявках из кэша или базы данных
      const requestsData = await getRequestsDataFromCacheOrDatabase();

      // Загрузите данные о заявках из базы данных
      for (const requestData of requestsData) {
        if (requestData && requestData.items) {
          requestData.items.forEach((itemData) => {
            const itemRow = document.createElement("tr");
            itemRow.innerHTML = `
              <td>${requestData.number}</td>
              <td>${requestData.initiator}</td>
              <td>${requestData.executive}</td>
              <td>${requestData.date}</td>
              <td>${itemData.name}</td>
              <td>${itemData.variation}</td>
              <td>${itemData.equipment}</td>
              <td>${itemData.type}</td>
              <td>${itemData.brand}</td>
              <td class="tooltip" title="${itemData.comment.replace(
                /"/g,
                ""
              )}">${itemData.comment}</td>
              <td>${itemData.code}</td>
              <td>${itemData.count}</td>
              <td>${itemData.dateNom}</td>
              <td>${itemData.statusNom ? itemData.statusNom : ""}</td>
              <td>${itemData.requestNom}</td>
            `;

            productsTableBody.insertBefore(
              itemRow,
              productsTableBody.firstChild
            );
          });
        } else {
          console.log(`Заявки по этому ключу "${requestKey}" нет в списке.`);
        }
      }
    } catch (error) {
      console.error("Ошибка при получении данных о заявках:", error);
    }
  }
});
console.log(requestsCache);

// ------------------------------------ БЛОК ОБНОВЛЕНИЯ ВСЕХ ЗАЯВОК  --------------------------------------------//

// Функция обновления всех заявок
function refreshAllRequests() {
  // Загрузить все заявки
  const requestsRef = database.ref("requests");
  requestsRef.once("value", (snapshot) => {
    snapshot.forEach((requestSnapshot) => {
      const requestKey = requestSnapshot.key;
      const requestData = requestSnapshot.val();

      // Пропустить эту заявку, если она заблокирована
      if (requestData.isLocked === true) {
        console.log(`Заявка заблокирована ${requestKey}.`);
        return;
      }

      // Загрузить все элементы
      itemsRef.once("value", (snapshot) => {
        const items = snapshot.val();
        const codeVariationToNameTypeMap = {};
        const nameVariationTypeToCodeMap = {};

        Object.keys(items).forEach((key) => {
          const item = items[key];
          const itemCodeAsString = String(item.code);
          codeVariationToNameTypeMap[`${itemCodeAsString}-${item.variation}`] =
            {
              name: item.name,
              type: item.type,
            };
          nameVariationTypeToCodeMap[
            `${item.name}-${item.variation}-${item.type}`
          ] = itemCodeAsString;
        });

        requestData.items.forEach((item, index) => {
          if (item.code) {
            const codeVariationKey = `${String(item.code)}-${item.variation}`;

            if (codeVariationToNameTypeMap[codeVariationKey]) {
              requestData.items[index].name =
                codeVariationToNameTypeMap[codeVariationKey].name;
              requestData.items[index].type =
                codeVariationToNameTypeMap[codeVariationKey].type;
            } else {
              const newItemKey = itemsRef.push().key;
              itemsRef.child(newItemKey).set(item);
              codeVariationToNameTypeMap[codeVariationKey] = {
                name: item.name,
                type: item.type,
              };
            }
          } else {
            const nameVariationTypeKey = `${item.name}-${item.variation}-${item.type}`;

            if (nameVariationTypeToCodeMap[nameVariationTypeKey]) {
              requestData.items[index].code = String(
                nameVariationTypeToCodeMap[nameVariationTypeKey]
              );
            }
          }
        });

        // Обновить заявку
        requestsRef.child(requestKey).update(requestData, (error) => {
          if (error) {
            console.error("Failed to save changes:", error);
          } else {
            console.log(`Successfully updated request ${requestKey}!`);
          }
        });
      });
      console.log(`Request ${requestKey} успешно обновлены.`);
    });
  });
}

// ------------------------------------- БЛОК СКАЧИВАНИЯ ОДНОЙ ЗАЯВКОЙ  --------------------------------------------//

//функция загрузки одной заявки
function Excel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Заявки");

  // Добавляем загаловки таблицы
  sheet.addRow([
    "Инициатор",
    "Ответственный",
    "Индекс",
    "Категория",
    "Наименование",
    "Вар.исп",
    "Баз.ед",
    "Оборудование",
    "Поставщик",
    "Код",
    "Комментарий",
    "№ Заказа",
    "Статус",
    "Дата",
    "Кол-во",
    "Первоначальное имя",
  ]);

  // Получаем значение инициатора и ответственного
  const initiator = document.getElementById("initiator").value;
  const responsible = document.getElementById("executive-id").value;

  // Собираем все строки из таблицы 'products-table'
  const rows = document.querySelectorAll(".nomenklature tr");

  // Для каждой строки (за исключением первой, так как она содержит заголовки)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Для каждой ячейки в строке добавляем данные в новую строку файла Excel
    let excelRow = [initiator, responsible];
    const cells = row.querySelectorAll("td");
    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];

      // Если это не кнопка, добавляем значение в excelRow
      if (!cell.querySelector("button")) {
        // Для ввода получаем значение из атрибута 'value', иначе используем текстовое содержимое ячейки
        let value = cell.firstChild?.value;
        if (typeof value === "undefined") {
          value = cell.textContent;
        }
        excelRow.push(value);
      }
    }

    // Проверяем, являются ли инициатор и ответственный единственными заполненными ячейками
    const otherCellsAreEmpty = excelRow
      .slice(2)
      .every((cell) => !cell || cell === "");

    if (!otherCellsAreEmpty) {
      // Если нет, то добавляем строку в лист
      sheet.addRow(excelRow);
    }
  }

  // Скачиваем файл
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "requests.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Добавляем обработчик события для кнопки
const downloadProductButton = document.getElementById(
  "download-products-button"
);
downloadProductButton.addEventListener("click", Excel);

// ---------------------------------------- БЛОК СКАЧИВАНИЯ ВСЕХ ЗАЯВОК  --------------------------------------------//

//СКАЧИВАНИЕ ЗАЯВОК
function downloadExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Заявки");

  // добавим загаловки таблицы
  sheet.addRow([
    "Номер заявки",
    "Дата заявки",
    "Инициатор",
    "Ответственный",
    "Статус заявки",
    "Дата выполнения",
    "Индекс",
    "Категория",
    "Наименование",
    "Вар.исп",
    "Баз.ед",
    "Оборудование",
    "Поставщик",
    "Код",
    "Комментарий",
    "№ Заказа",
    "Статус",
    "Дата",
    "Кол-во",
    "Имя от поставщика",
  ]);

  requestsRef.once("value", (snapshot) => {
    const requests = snapshot.val();

    // Add data rows for each request and its items
    Object.keys(requests).forEach((requestKey) => {
      const requestData = requests[requestKey];

      if (requestData && requestData.items) {
        // Добавляем проверку
        requestData.items.forEach((itemData) => {
          sheet.addRow([
            requestData.number,
            requestData.date,
            requestData.initiator,
            requestData.executive,
            requestData.statusRequest,
            requestData.completionDate,
            itemData.rowIndexRow,
            itemData.category,
            itemData.name,
            itemData.variation,
            itemData.type,
            itemData.equipment,
            itemData.brand,
            itemData.code,
            itemData.comment,
            itemData.requestNom,
            itemData.statusNom,
            itemData.dateNom,
            itemData.count,
            itemData.nameFirst,
          ]);
        });
      }
    });

    // Download file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "requests.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    });
  });
}

// Add button event listener
const downloadButton = document.getElementById("download-button");

downloadButton.addEventListener("click", downloadExcel);

// ------------------------------------------ БЛОК ПРОКРУТКИ  -----------------------------------------------------//

// При прокрутке страницы показывать/скрывать кнопку
window.addEventListener("scroll", () => {
  const scrollToTopButton = document.getElementById("scroll-to-top");
  if (window.scrollY > 300) {
    scrollToTopButton.classList.add("show");
  } else {
    scrollToTopButton.classList.remove("show");
  }
});

// Обработчик события для кнопки "переноса вверх страницы"
document.getElementById("scroll-to-top").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ------------------------------------------ БЛОК КОПИРОВАНИЯ ЯЧЕЙКИ  --------------------------------------------//

//копирование по нажатию на ячейку
const tableBodies = document.querySelectorAll("tbody");

tableBodies.forEach((tableBody) => {
  tableBody.addEventListener("click", async function (event) {
    if (event.target.tagName === "TD") {
      const cell = event.target;

      // Если ячейка является редактируемой, просто возвращаемся и ничего не делаем
      if (cell.isContentEditable) {
        return;
      }

      try {
        await navigator.clipboard.writeText(cell.textContent);

        cell.classList.add("copied");

        setTimeout(() => {
          cell.classList.add("active-copy");
        }, 50);

        setTimeout(() => {
          cell.classList.remove("copied");
          cell.classList.remove("active-copy");
        }, 1000);
      } catch (err) {
        console.error("Failed to copy text:", err);
      }
    }
  });
});

// -------------------- БЛОК ПРИКРЕПЛЕНИЯ ФАЙЛОВ  --------------------------------------------//

// Получение ссылки на коллекцию "documents"
const documentsRef = firebase.firestore().collection("documents");

// Переменные для элементов интерфейса
const fileInput = document.getElementById("fileInput");
const downloadfile = document.getElementById("downloadfile");

// Функция для скачивания документа по ключу заявки
async function downloadDocumentByRequestKey(requestKey, filename) {
  try {
    const documentRef = await documentsRef
      .where("requestKey", "==", requestKey)
      .get();

    if (documentRef.empty) {
      console.error("Документ не найден");
      return;
    }

    const documentData = documentRef.docs[0].data();
    const { fileContent, filename } = documentData;

    const byteArray = Uint8Array.from(atob(fileContent), (c) =>
      c.charCodeAt(0)
    );
    const blob = new Blob([byteArray], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при скачивании документа: ", error);
  }
}

// Обработчик для кнопки "Скачать файл"
downloadfile.addEventListener("click", async () => {
  const requestKey = saveChangesBtn.getAttribute("data-request-key");
  await downloadDocumentByRequestKey(requestKey);
});

// Обработчик для кнопки "Сохранить изменения"
saveChangesBtn.addEventListener("click", async () => {
  const requestKey = saveChangesBtn.getAttribute("data-request-key");
  const inputFile = fileInput.files[0]; // Получение выбранного файла из input элемента

  try {
    if (inputFile) {
      const docId = await attachDocumentToRequest(requestKey, inputFile);
      if (docId) {
        console.log(`Документ ${inputFile.name} успешно прикреплен к заявке.`);
        downloadfile.style.display = "block"; // Показываем кнопку скачивания
      } else {
        console.error(
          `Ошибка при прикреплении документа ${inputFile.name} к заявке.`
        );
      }
    }

    // Перезагрузка данных заявки, если необходимо
    updateRequest();
  } catch (error) {
    console.error("Ошибка при прикреплении документа: ", error);
  }
});

// Функция для прикрепления файла к заявке
async function attachDocumentToRequest(requestKey, file) {
  try {
    // Проверка, существует ли уже документ с данным requestKey
    const existingDocs = await documentsRef
      .where("requestKey", "==", requestKey)
      .get();

    if (!existingDocs.empty) {
      // Если документ существует, обновляем его содержимое
      const existingDocId = existingDocs.docs[0].id;
      const fileContent = await readFileContent(file);
      const updatedDocumentData = {
        requestKey: requestKey,
        filename: file.name,
        fileContent: fileContent,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Обновляем существующий документ
      await documentsRef.doc(existingDocId).set(updatedDocumentData);
      return existingDocId;
    } else {
      // Если документ не существует, создаем новый
      const fileContent = await readFileContent(file);
      const documentData = {
        requestKey: requestKey,
        filename: file.name,
        fileContent: fileContent,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      };

      // Добавляем документ в коллекцию "documents"
      const documentRef = await documentsRef.add(documentData);
      return documentRef.id;
    }
  } catch (error) {
    console.error("Ошибка при прикреплении документа: ", error.message);
    return null;
  }
}

// Функция для чтения содержимого файла
function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const fileContent = reader.result.split(",")[1]; // Извлечение содержимого файла из Data URL
      resolve(fileContent);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
} //Поиск по списку файла
// function calculateMatchPercentage(result, query) {
//   const maxDistance = Math.max(result.length, query.length);
//   const distance = damerauLevenshteinDistance(result, query);
//   const similarity = 1 - distance / maxDistance;
//   return similarity * 100;
// }

// function damerauLevenshteinDistance(a, b) {
//   const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
//   dp[0] = Array.from({ length: b.length + 1 }, (_, i) => i);

//   for (let i = 1; i <= a.length; i++) {
//     for (let j = 1; j <= b.length; j++) {
//       const cost = a[i - 1] === b[j - 1] ? 0 : 1;
//       dp[i][j] = Math.min(
//         dp[i - 1][j] + 1,
//         dp[i][j - 1] + 1,
//         dp[i - 1][j - 1] + cost
//       );

//       if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
//         dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
//       }
//     }
//   }

//   return dp[a.length][b.length];
// }

// const searchButton = document.getElementById("searchButton");
// const nameListInput = document.getElementById("nameList");

// searchButton.addEventListener("click", async () => {
//   const nameList = nameListInput.value.trim();
//   const namesArray = nameList.split(/\s*#\s*/).filter(Boolean);

//   await loadData(); // Load data before performing the search

//   const searchResults = namesArray.map((name) => {
//     const results = miniSearch.search(name.toLowerCase(), {
//       prefix: false,
//       termFrequency: false,
//       fuzzy: 0.4,
//       boost: {
//         name: 4,
//         variation: 1,
//         code: 1,
//         type: 1,
//       },
//       threshold: 0.3,
//     });

//     return {
//       name,
//       results: results.map((result) => ({
//         result,
//         matchPercentage: calculateMatchPercentage(
//           result.name,
//           name.toLowerCase()
//         ),
//       })),
//     };
//   });

//   const filteredResults = searchResults.map((item) => {
//     const resultsWithPrice = item.results.filter(
//       (result) => result.result.price !== undefined
//     );

//     if (resultsWithPrice.length > 0) {
//       resultsWithPrice.sort((a, b) => b.matchPercentage - a.matchPercentage);
//       return {
//         name: item.name,
//         results: resultsWithPrice.slice(0, 1), // Вернуть только первый результат с наивысшим процентом совпадения
//       };
//     }

//     const maxMatch = item.results.reduce((max, result) => {
//       return result.matchPercentage > max ? result.matchPercentage : max;
//     }, 0);

//     const filtered = item.results.filter(
//       (result) => result.matchPercentage === maxMatch
//     );

//     return { name: item.name, results: filtered };
//   });

//   // Generate Excel file and offer download
//   await generateExcelFile(filteredResults);
// });

// // Остальной код остается неизменным

// function generateExcelFile(searchResults) {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("Search Results");

//   // Header row
//   worksheet.addRow(["Name", "Top Result", "Code", "Match Percentage", "Price"]);

//   searchResults.forEach((item) => {
//     item.results.sort((a, b) => {
//       if (b.result.price && a.result.price) {
//         return b.result.price - a.result.price;
//       } else if (b.result.price) {
//         return -1; // Первый результат имеет цену
//       } else if (a.result.price) {
//         return 1; // Второй результат имеет цену
//       } else {
//         return 0; // Ни один результат не имеет цены
//       }
//     });

//     if (item.results.length > 0) {
//       const result = item.results[0]; // Берем первый результат после сортировки
//       const code = result.result.code || "N/A";
//       const price = result.result.price || "N/A";
//       worksheet.addRow([
//         item.name,
//         result.result.name,
//         code,
//         result.matchPercentage.toFixed(2) + "%",
//         price,
//       ]);
//     }
//   });

//   const buffer = workbook.xlsx.writeBuffer().then((data) => {
//     const blob = new Blob([data], {
//       type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "search_results.xlsx";
//     a.click();
//     URL.revokeObjectURL(url);
//   });
// }
