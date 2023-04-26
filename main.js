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

// Инициализация Firebase Рабочая
const firebaseConfig = {
  apiKey: "AIzaSyC4a4SVzUb-ekvsxsuQNIWumcJWB9oEggY",
  authDomain: "nomenklature-6acda.firebaseapp.com",
  databaseURL: "https://nomenklature-6acda-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nomenklature-6acda",
  storageBucket: "nomenklature-6acda.appspot.com",
  messagingSenderId: "729807329689",
  appId: "1:729807329689:web:8d3f5713602fe1904cdb08"
};

firebase.initializeApp(firebaseConfig);

// Получение ссылки на базу данных
const database = firebase.database();

//ссылка на узел items
const itemsRef = database.ref("items");

const addBtn = document.getElementById("add-btn");
const modal = document.getElementById("modal");
const closeBtn = document.querySelector(".close");
const formRequest = document.getElementById("request-form");
const addProduct = document.getElementById("add-product-btn");
const listTableRequest = document.getElementById("products-body");
const saveRequestBtn = document.getElementById("save-request-btn");
const saveChangesBtn = document.getElementById("save-change-btn");
const table = document.getElementById("table-body");
const modalFooter = document.querySelector(".modal-footer");
const selectStatusRequest = document.querySelector(".status-block");
const initiator = document.getElementById("initiator");
const executive = document.getElementById("executive-id");
const categoryInput = document.getElementById("category-list");

// функция для открытия модального окна
function openModal() {
  modal.classList.remove("hidden");
  listTableRequest.innerHTML = "";
  form.reset();
  formRequest.reset();
  saveChangesBtn.classList.add("hidden");
  saveRequestBtn.classList.remove("hidden");
  selectStatusRequest.style.display = "none";
  document.getElementById("request-number").textContent = "";
}

// функция для закрытия модального окна
function closeModal() {
  modal.classList.add("hidden");
}

// добавляем обработчик события на кнопку "Добавить заявку"
addBtn.addEventListener("click", openModal);

// добавляем обработчик события на кнопку закрытия модального окна
// closeBtn.addEventListener("click", closeModal);
closeBtn.addEventListener("click", () => {
  if (
    confirm(
      "Закрыть окно заявки? Данные будут удалены, если не сохранены. Уверены?"
    )
  ) {
    closeModal();
  }
});

function setFieldError(field, message) {
  field.setCustomValidity(message);
  field.reportValidity();
}

function addNomenklatureTable(event) {
  event.preventDefault();
  const categoryField = formRequest.elements.category;
  const nameField = formRequest.elements.name;
  const variationField = formRequest.elements.variation;
  const countField = formRequest.elements["input-count"];
  const typeField = formRequest.elements.type;
  const equipmentField = formRequest.elements.equipment;
  const name = nameField.value.trim();
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
  } else if (categoryField.value === "Запасные части" && !equipmentField.value) {
    setFieldError(equipmentField, "Укажите оборудование для категории Запасные части");
    hasError = true;
  } else {
    equipmentField.setCustomValidity("");
    categoryField.setCustomValidity("");
  }

  if (hasError) {
    return;
  }
  const rowIndex = listTableRequest.rows.length;
  const itemRequest = `
      <tr class="item-request">
        <td class="number-cell">${rowIndex}</td>
        <td class="category-cell">${formRequest.elements.category.value}</td>
        <td class="name-cell">${name}</td>
        <td class="variation-cell">${variation}</td>
        <td class="type-cell">${formRequest.elements.type.value}</td>
        <td class="equipment-cell">${formRequest.elements.equipment.value}</td>
        <td class="article-cell"></td> 
        <td class="brand-cell"></td> 
        <td class="code-cell">${formRequest.elements["input-code"].value}</td>
        <td class="comment-cell"></td>
        <td class="status-nom-cell"></td>
        <td class="count-cell">${count}</td>
        <td class="button-cell"><button class="btn-edit" id="edit">Изменить</button></td>
        <td class="button-cell"><button class="btn-remove" id="remove">Удалить</button></td>
      </tr>
    `;
  listTableRequest.insertAdjacentHTML("beforeend", itemRequest);
  formRequest.reset();
}

// добавляем обработчик события на кнопку закрытия модального окна
addProduct.addEventListener("click", addNomenklatureTable);

// Функция, которая делает ячейки редактируемыми
const makeCellEditable = (cell, color) => {
  cell.contentEditable = true;
  cell.style.backgroundColor = color;
  cell.addEventListener("input", () => {
    cell.textContent = cell.textContent.replace(/<[^>]+>/g, "");
  });
};

const editListCheckbox = document.getElementById("edit-list");

editListCheckbox.addEventListener("change", (event) => {
  const isEditMode = event.target.checked;

  if (isEditMode) {
    // Режим редактирования
    document.querySelectorAll(".item-request").forEach((item) => {
      const editButton = item.querySelector(".btn-edit");
      editButton.textContent = "Сохранить";

      item.querySelectorAll("td:not(.button-cell)").forEach((cell) => {
        makeCellEditable(cell, "#f0faeb");
      });
    });
  } else {
    // Режим сохранения
    document.querySelectorAll(".item-request").forEach((item) => {
      const editButton = item.querySelector(".btn-edit");
      editButton.textContent = "Изменить";

      item.querySelectorAll("td:not(.button-cell)").forEach((cell) => {
        cell.contentEditable = false;
        cell.style.backgroundColor = "transparent";
      });

      const dataForm = Object.fromEntries(
        new FormData(item.formRequest).entries()
      );
      Object.assign(item, { data: dataForm });
    });
  }
});

// Обработчики событий
listTableRequest.addEventListener("click", (event) => {
  const target = event.target;

  // Если нажата кнопка удаления, удаляем элемент
  if (target.matches(".btn-remove")) {
    const item = target.closest(".item-request");
    if (item && item.parentNode) {
      item.parentNode.removeChild(item);
    }
  }
  // Если нажата кнопка редактирования, переключаемся между режимами редактирования и сохранения
  else if (target.matches(".btn-edit")) {
    const { closest: closestItem, querySelector: findEditButton } = target;
    const item = closestItem.call(target, ".item-request");
    const editButton = findEditButton.call(item, ".btn-edit");

    if (editButton.textContent === "Изменить") {
      // Режим редактирования
      editButton.textContent = "Сохранить";

      item.querySelectorAll("td:not(.button-cell)").forEach((cell) => {
        makeCellEditable(cell, "#f0faeb");
      });
    } else {
      // Режим сохранения
      editButton.textContent = "Изменить";

      item.querySelectorAll("td:not(.button-cell)").forEach((cell) => {
        cell.contentEditable = false;
        cell.style.backgroundColor = "transparent";
      });

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

let requestNumber = null; //Переменная для номера заявки

// функция сохранения в базу данных
function saveRequestDatabase() {
  // Получаем данные из формы
  const initiator = document.getElementById("initiator").value;
  const executive = document.getElementById("executive-id").value;

  // Проверяем заполненность обязательных полей формы
  if (initiator === "") {
    const fieldinitiator = document.getElementById("initiator");
    fieldinitiator.setCustomValidity("Заполните фамилию Инициатора");
    fieldinitiator.reportValidity();
    return;
  }

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
      article: row.querySelector(".article-cell").textContent,
      brand: row.querySelector(".brand-cell").textContent,
      code: row.querySelector(".code-cell").textContent.trim().replace(/\s/g, ""),
      comment: row.querySelector(".comment-cell").textContent,
      statusNom: row.querySelector(".status-nom-cell").textContent,
      count: row.querySelector(".count-cell").textContent,
    };

    requestData.push(data);
  });

  // Проверяем, есть ли уже созданные заявки
  if (requestNumber === null) {
    // Если заявок нет, начинаем с номера 1
    requestsRef.once("value", (snapshot) => {
      requestNumber = snapshot.numChildren() + 1;
      saveRequest(requestData);
    });
  } else {

    // Если заявки есть, начинаем со следующего номера
    saveRequest(requestData);
  }

  function saveRequest(requestData) {
    const request = {
      number: requestNumber,
      initiator: initiator,
      executive: executive,
      statusRequest: "Новая",
      date: new Date().toLocaleString(),
      items: requestData,
    };

// Создать элемент для отображения сообщения об успешной записи
const messageDiv = document.createElement("div");
messageDiv.id = "message";
document.body.appendChild(messageDiv);

// Запись в Firebase Realtime Database
database.ref("requests").push(request, (error) => {
  if (error) {
    console.error("Ошибка записи в базу данных: ", error);
  } else {
    console.log("Успешная запись в базу данных");

    // Отобразить сообщение об успешной записи
    const message = "Данные успешно сохранены заявка № " + request.number;
    messageDiv.innerHTML = message;
    messageDiv.classList.add("success-message", "visible");

    // Скрыть сообщение через 2 секунды
    setTimeout(() => {
      messageDiv.classList.remove("visible");
      setTimeout(() => {
        messageDiv.remove();
      }, 1000); // убрать элемент после скрытия анимации
    }, 2000);

    // Очистить модальное окно
    listTableRequest.innerHTML = "";
    formRequest.reset();
    form.reset();
    modal.classList.add("hidden");
  }
});

  }
}

//Обработчик сохранения в базу
saveRequestBtn.addEventListener("click", saveRequestDatabase);

const requestsRef = database.ref("requests");

requestsRef.on("value", (snapshot) => {
  table.innerHTML = "";
  // Находим номер самой большой заявки
  const maxRequestNumber = Object.values(snapshot.val()).reduce(
    (max, request) => Math.max(max, request.number),
    0
  );

  // Устанавливаем начальное значение номера заявки
  requestNumber = maxRequestNumber + 1;

  for (const requestKey in snapshot.val()) {
    const requestData = snapshot.val()[requestKey];

    const newRow = document.createElement("tr");
    newRow.setAttribute("data-key", requestKey);
    newRow.innerHTML = `
      <td class="id-cell">${requestData.number}</td>
        <td class="number-cell">${requestKey}</td>
        <td class="date-cell" value="${requestData.date}">${
      requestData.date
    }</td>
        <td class="in-cell">${requestData.initiator}</td>
        <td class="executive-cell">${requestData.executive}</td>
        <td class="status-cell">${requestData.statusRequest}</td>
        <td class="completion-date-cell">${
          requestData.completionDate || ""
        }</td>
          <td class="button-cell">
          <button class="edit-request-button">Редактировать</button>
        </td>
        <td class="button-cell">
        <button class="btn-delete">Удалить</button></td>
      `;
    table.insertBefore(newRow, table.firstChild);
    const deleteButton = newRow.querySelector(".btn-delete");
    const editRequestButton = newRow.querySelector(".edit-request-button");

    deleteButton.addEventListener("click", () => {
      if (confirm("Вы уверены, что хотите удалить заявку?")) {
        database.ref(`requests/${requestKey}`).remove();
      }
    });

    editRequestButton.addEventListener("click", () => {
      form.reset();
      formRequest.reset();
      
      selectStatusRequest.style.display = "block";
      const requestRef = database.ref("requests/" + requestKey);

      requestRef.once("value", (snapshot) => {
        const requestData = snapshot.val();

        document.getElementById("request-number").textContent =
          requestData.number;
        document.getElementById("initiator").value = requestData.initiator;
        document.getElementById("executive-id").value = requestData.executive;
        document.getElementById("status-request").value =
          requestData.statusRequest;

        const tableRows = document.querySelectorAll(".item-request");
        tableRows.forEach((row) => row.remove());

        requestData.items.forEach((itemData) => {
          const itemRow = document.createElement("tr");
          itemRow.classList.add("item-request");
          itemRow.innerHTML = `
              <td class="number-cell">${itemData.rowIndexRow}</td>
              <td class="category-cell">${itemData.category}</td>
              <td class="name-cell">${itemData.name}</td>
              <td class="variation-cell">${itemData.variation}</td>
              <td class="type-cell">${itemData.type}</td>
              <td class="equipment-cell">${itemData.equipment}</td>
              <td class="article-cell">${itemData.article}</td>
              <td class="brand-cell">${itemData.brand}</td>
              <td class="code-cell">${itemData.code.trim().replace(/\s/g, "")}</td>
              <td class="comment-cell">${itemData.comment}</td>
              <td class="status-nom-cell">${itemData.statusNom}</td>
              <td class="count-cell">${itemData.count}</td>
              <td class="button-cell">
              <button class="btn-edit" id="edit">Изменить</button>
              <td class="button-cell">
              <button class="btn-remove" id="remove">Удалить</button></td>
            `;
          listTableRequest.appendChild(itemRow);
        });
      });
      modal.classList.remove("hidden");
      saveChangesBtn.classList.remove("hidden");
      saveRequestBtn.classList.add("hidden");
      saveChangesBtn.setAttribute("data-request-key", requestKey);
    });
  }
});



saveChangesBtn.addEventListener("click", () => {
  // Get the request key from the button attribute
  const requestKey = saveChangesBtn.getAttribute("data-request-key");

  // Get the updated data from the form
  const initiator = document.getElementById("initiator").value;
  const executive = document.getElementById("executive-id").value;
  const statusRequest = document.getElementById("status-request").value;
  const currentCompletionDate =
    document.querySelector(`[data-key='${requestKey}'] .completion-date-cell`)
      .textContent || null;

  let completionDate;
  if (statusRequest === "Выполнена" && !currentCompletionDate) {
    completionDate = new Date().toLocaleString();
  } else if (statusRequest !== "Выполнена") {
    completionDate = null;
  } else {
    completionDate = currentCompletionDate;
  }

  // Проверяем заполненность обязательных полей формы
  if (initiator === "") {
    const fieldinitiator = document.getElementById("initiator");
    fieldinitiator.setCustomValidity("Заполните фамилию Инициатора");
    fieldinitiator.reportValidity();
    return;
  }

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
      article: row.querySelector(".article-cell").textContent,
      brand: row.querySelector(".brand-cell").textContent,
      code: row.querySelector(".code-cell").textContent.trim().replace(/\s/g, ""),
      comment: row.querySelector(".comment-cell").textContent,
      statusNom: row.querySelector(".status-nom-cell").textContent,
      count: row.querySelector(".count-cell").textContent,
    };
    requestData.push(data);
  });

  
// Обновление данных в Firebase Realtime Database
itemsRef.once("value", (snapshot) => {
  const items = snapshot.val();
  const codeVariationToNameMap = {};

  Object.keys(items).forEach((key) => {
    const item = items[key];
    codeVariationToNameMap[`${item.code}-${item.variation}`] = item.name;
  });

  requestData.forEach((item, index) => {
    if (item.code) {
      const codeVariationKey = `${item.code}-${item.variation}`;
      if (codeVariationToNameMap[codeVariationKey]) {
        requestData[index].name = codeVariationToNameMap[codeVariationKey];
      } else {
        const newItemKey = itemsRef.push().key;
        itemsRef.child(newItemKey).set(item);
        codeVariationToNameMap[codeVariationKey] = item.name;
      }
    }
  });



  // обновление в Firebase Realtime Database
database.ref(`requests/${requestKey}`).update(
  {
    initiator: initiator,
    executive: executive,
    statusRequest: statusRequest,
    items: requestData,
    completionDate: completionDate,
  },
    (error) => {
      if (error) {
        console.error("Ошибка записи в базу данных: ", error);
      } else {
        console.log("Успешное обновление данных заявки");

        // Создать элемент для отображения сообщения об успешном обновлении данных заявки
const messageDiv = document.createElement("div");
messageDiv.id = "message";
document.body.appendChild(messageDiv);

// Отобразить сообщение об успешном обновлении данных заявки
const message = "Данные заявки успешно обновлены";
messageDiv.innerHTML = message;
messageDiv.classList.add("success-message", "visible");

// Скрыть сообщение через 2 секунды
setTimeout(() => {
  messageDiv.classList.remove("visible");
  setTimeout(() => {
    messageDiv.remove();
  }, 1000); // убрать элемент после скрытия анимации
}, 2000);

        modal.classList.add("hidden");
        saveChangesBtn.classList.add("hidden");
        saveRequestBtn.classList.remove("hidden");
      }
    }
  );
});
});

const nameInput = document.getElementById("name");
const variationInput = document.getElementById("variation");
const codeInput = document.getElementById("input-code");
const autocompleteList = document.getElementById("autocompleteList");


let items = [];
let miniSearch;

// Load data from firebase
async function loadData() {
  const itemsSnapshot = await itemsRef.once("value");

  items = itemsSnapshot.val()
    ? Object.entries(itemsSnapshot.val()).map(([id, item]) => ({
        id,
        ...item,
      }))
    : [];

    miniSearch = new MiniSearch({
      fields: ["name", "variation", "code"],
      idField: "id",
      storeFields: ["name", "variation", "code"],
      caseSensitive: true,
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

loadData();

// Search and update UI
function search(searchTerm) {
  if (!searchTerm) {
    autocompleteList.innerHTML = "";
    return;
  }

  const results = miniSearch.search(searchTerm.toLowerCase(), {
    prefix: true,
    termFrequency: false,
    fuzzy: 0.3,
  });

  const rankedResults = results
    .map((result) => {
      const matches = countCharMatches(result.name.toLowerCase(), searchTerm);
      return { ...result, matches };
    })
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 10);

  updateAutocompleteList(rankedResults);
}


function countCharMatches(string, searchTerm) {
  let count = 0;
  const searchTermLength = searchTerm.length;
  for (let i = 0; i < searchTermLength; i++) {
    if (string.indexOf(searchTerm[i].toLowerCase()) !== -1) {
      count++;
    }
  }
  return count;
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
    const { name, variation, code } = item || {};
    const itemKey = `${name}-${variation}-${code}`;
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
    info.innerHTML = `ВИ: ${variation}  Код: (${code})`;
    el.appendChild(info);

    el.addEventListener("click", () => {
      nameInput.value = name;
      variationInput.value = variation;
      codeInput.value = code;
      autocompleteList.innerHTML = "";
    });
    fragment.appendChild(el);
  });
}

function highlightMatch(text, searchTerm) {
  const searchWords = searchTerm.split(/\s+/);
  const escapedSearchWords = searchWords.map((word) => word.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp("(" + escapedSearchWords.join("|") + ")", "gi");
  return text.replace(regex, "<mark>$1</mark>");
}


let searchTimeout;

// Event listeners
nameInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => search(e.target.value.toLowerCase()), 200);
});

document.addEventListener("click", (e) => {
  if (!autocompleteList.contains(e.target)) {
    autocompleteList.innerHTML = "";
  }
});

variationInput.addEventListener("input", () => (codeInput.value = ""));
nameInput.addEventListener("input", () => (codeInput.value = "", variationInput.value = "осн."));


//СКАЧИВАНИЕ
function downloadExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Заявки");

  // добавим загаловки таблицы
  sheet.addRow([
    "Номер заявки",
    "Дата",
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
    "Статья",
    "Поставщик",
    "Код",
    "комментарий",
    "Статус, дата",
    "Кол-во",
  ]);

  // Get data from Firebase Realtime Database
  const requestsRef = database.ref("requests");
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
            itemData.article,
            itemData.brand,
            itemData.code,
            itemData.comment,
            itemData.statusNom,
            itemData.count,
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

// Определяем индексы столбцов
const columnIndices = {
  number: 0,
  link: 1,
  date: 2,
  initiator: 3,
  executive: 4,
  status: 5,
  datestatus: 6,
  button: 7,
  button2: 8,
};

// Функция для фильтрации таблицы по значениям в ячейках заголовка
function filterTable(event) {
  const filters = {};

  // Получаем все фильтры
  document.querySelectorAll(".filter-row input, .filter-row select").forEach((filter) => {
    const th = filter.closest("th");
    const colIndex = Array.from(th.parentNode.children).indexOf(th);
    filters[colIndex] = filter.value.toUpperCase();
  });

  const rows = document.querySelectorAll(".table-request tbody tr");

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
      filterTable(); // Вызываем функцию filterTable, чтобы обновить таблицу после очистки фильтра
    }
  });
});


function capitalizeWords(input) {
  const forbiddenChars = /[\\:?<>\|"%&@;#!№]/g;
  const originalValue = input.value.trim();
  if (originalValue.length === 0) {
    return;
  }
  const sanitizedValue = originalValue.replace(forbiddenChars, '');

  // Заглавить только первую букву строки
  const words = sanitizedValue.split(/\s+/);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

  const capitalizedValue = words.join(' ').replace(/\s(?=\S)/g, ' ');
  const finalValue = capitalizedValue.replace(/\*/g, 'x');

  input.value = finalValue;
}



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
          acc.push({ id, ...data });
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
  const results = miniSearchEquipment.search(searchTerm, {
    prefix: true,
    boost: { title: 2 },
    termFrequency: false,
    fuzzy: 0.3 // добавляем нечеткое совпадение с уровнем нечеткости 0.3 (от 0 до 1)
  }).slice(0, 10);

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
  searchEquipmentTimeout = setTimeout(() => searchEquipment(e.target.value), 200);
});

document.addEventListener("click", (e) => {
  if (!equipmentAutocompleteList.contains(e.target)) {
    equipmentAutocompleteList.innerHTML = "";
  }
});

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

  



  
