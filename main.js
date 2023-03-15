// Инициализация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDJch2o9N79aFKVouE5VzOwoHWyToTweW0",
  authDomain: "nomenklature-d5601.firebaseapp.com",
  databaseURL:
    "https://nomenklature-d5601-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "nomenklature-d5601",
  storageBucket: "nomenklature-d5601.appspot.com",
  messagingSenderId: "1097981514400",
  appId: "1:1097981514400:web:a6a7484924b76b2a166fc5"
};

firebase.initializeApp(firebaseConfig);

// Получение ссылки на базу данных
const database = firebase.database();

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

// функция для открытия модального окна
function openModal() {
  modal.classList.remove("hidden");
  listTableRequest.innerHTML = "";
  form.reset();
  formRequest.reset();
  saveChangesBtn.classList.add("hidden");
  saveRequestBtn.classList.remove("hidden");
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
  if (confirm("Закрыть окно заявки? Данные будут удалены, если не сохранены. Уверены?")) {
    closeModal();
  }
});
function addNomenklatureTable(event) {
  event.preventDefault();
  // const form = document.forms.formRequest;
  const nameField = formRequest.elements.name;
  const variationField = formRequest.elements.variation;
  const countField = formRequest.elements["input-count"];
  const name = nameField.value.trim();
  const variation = variationField.value.trim();
  const count = countField.value.trim();

  if (!name || !variation || !count) {
    [nameField, variationField, countField].forEach((field) => {
      if (!field.value.trim()) {
        field.setCustomValidity("Введите значение");
        field.reportValidity();
      }
    });
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
};

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
  const statusRequest = document.getElementById("status-request").value;

  // Проверяем заполненность обязательных полей формы
  if (initiator === "") {
    var fieldinitiator = document.getElementById("initiator");
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
      code: row.querySelector(".code-cell").textContent,
      comment: row.querySelector(".comment-cell").textContent,
      statusNom: row.querySelector(".status-nom-cell").textContent,
      count: row.querySelector(".count-cell").textContent
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
      statusRequest: statusRequest,
      date: new Date().toLocaleString(),
      items: requestData
    };

    // Запись в Firebase Realtime Database
    database.ref("requests").push(request, (error) => {
      if (error) {
        console.error("Ошибка записи в базу данных: ", error);
      } else {
        console.log("Успешная запись в базу данных");

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
  // Получаем количество заявок в базе данных
  const numRequests = snapshot.numChildren();

  // Устанавливаем начальное значение номера заявки
  requestNumber = numRequests + 1;

  for (const requestKey in snapshot.val()) {
    const requestData = snapshot.val()[requestKey];

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td class="id-cell">${requestData.number}</td>
        <td class="number-cell">${requestKey}</td>
        <td class="date-cell" value="${requestData.date}">${requestData.date}</td>
        <td class="in-cell">${requestData.initiator}</td>
        <td class="executive-cell">${requestData.executive}</td>
        <td class="status-cell">${requestData.statusRequest}</td>
          <td class="button-cell">
          <button class="edit-request-button">Редактировать</button>
        </td>
        <td class="button-cell">
        <button class="delete-btn">Удалить заявку</button></td>
      `;
    table.appendChild(newRow);
    var deleteButton = newRow.querySelector(".delete-btn");
    const editRequestButton = newRow.querySelector(".edit-request-button");

    deleteButton.addEventListener("click", () => {
      if (confirm("Вы уверены, что хотите удалить заявку?")) {
        database.ref(`requests/${requestKey}`).remove();
      }
    });

    editRequestButton.addEventListener("click", () => {
      form.reset();
  formRequest.reset();
      const requestRef = database.ref("requests/" + requestKey);

      requestRef.once("value", (snapshot) => {
        const requestData = snapshot.val();

        document.getElementById("request-number").textContent = requestData.number;
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
              <td class="code-cell">${itemData.code}</td>
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

  // Проверяем заполненность обязательных полей формы
  if (initiator === "") {
    var fieldinitiator = document.getElementById("initiator");
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
      code: row.querySelector(".code-cell").textContent,
      comment: row.querySelector(".comment-cell").textContent,
      statusNom: row.querySelector(".status-nom-cell").textContent,
      count: row.querySelector(".count-cell").textContent
    };
    requestData.push(data);
  });

  // обновление в Firebase Realtime Database
  database.ref(`requests/${requestKey}`).update(
    {
      initiator: initiator,
      executive: executive,
      statusRequest: statusRequest,
      items: requestData
    },
    (error) => {
      if (error) {
        console.error("Ошибка записи в базу данных: ", error);
      } else {
        console.log("Успешное обновление данных заявки");
        modal.classList.add("hidden");
        saveChangesBtn.classList.add("hidden");
        saveRequestBtn.classList.remove("hidden");
      }
    }
  );
});


async function getUniqueNameVariationCodeItems() {
  const itemsRef = database.ref("items");

  const [itemsSnapshot, requestsSnapshot] = await Promise.all([
    itemsRef.once("value"),
    requestsRef.once("value")
  ]);

  const uniqueItems = new Set();

  itemsSnapshot.forEach(itemSnapshot => {
    const data = itemSnapshot.val();

    if (data.items) {
      _.forEach(data.items, item => {
        if (item.name && item.code) {
          uniqueItems.add(`${item.name}_${item.variation}_${item.code}`);
        }
      });
    } else if (data.name && data.code) {
      uniqueItems.add(`${data.name}_${data.variation}_${data.code}`);
    }
  });

  return _.map(Array.from(uniqueItems), item => {
    const [name, variation, code] = item.split("_");
    return { name, variation, code };
  });
}

async function searchItems(searchTerms) {
  const dataList = await getUniqueNameVariationCodeItems();

  const filteredData = _.filter(dataList, ({ name }) =>
    _.every(searchTerms, term => _.includes(_.toLower(name), _.toLower(term)))
  );

  const sortedData = _.orderBy(filteredData, item =>
    _.reduce(item.name, (count, char) => count + (_.includes(searchTerms, char) ? 1 : 0), 0)
  , 'desc').slice(0, 10); // slice the array to get the first 10 elements

  return sortedData;
}


const nameInput = document.getElementById("name");
const autocompleteList = document.getElementById("list-name");
const variationInput = document.getElementById("variation");
const codeInput = document.getElementById("input-code");

let searchTimeout;

nameInput.addEventListener("input", async function () {
  clearTimeout(searchTimeout);
  autocompleteList.innerHTML = "";

  if (!this.value) return;

  const searchTerms = _.toLower(this.value).split(" ");

  searchTimeout = setTimeout(async () => {
    const filteredData = await searchItems(searchTerms);

    const fragment = document.createDocumentFragment();

    _.forEach(filteredData, ({ name, variation, code }) => {
      const option = new Option(`Код:${code}`, `${name}|${variation}|${code}`);

      fragment.appendChild(option);
    });

    autocompleteList.appendChild(fragment);
  }, 500);
});

nameInput.addEventListener("change", async function() {
  const dataList = await getUniqueNameVariationCodeItems();
  const selectedOption = this.value.split('|');

  if (selectedOption.length === 3) {
    nameInput.value = selectedOption[0];
    variationInput.value = selectedOption[1];
    codeInput.value = selectedOption[2];
  } else {
    variationInput.value = "осн.";
    codeInput.value = "";
  } 
});

variationInput.addEventListener("input", () => (codeInput.value = ""));




// Функция для фильтрации по статусу
function filterByStatus() {
const statusFilter = document.getElementById("status");
const tableRows = document.querySelectorAll(".table-request tbody tr");

tableRows.forEach((row) => {
  const statusCell = row.querySelector(".status-cell");
  
  if (statusFilter.value === "" || statusCell.textContent === statusFilter.value) {
    row.style.display = "";
  } else {
    row.style.display = "none";
  }
});
}

const statusFilter = document.getElementById("status");

statusFilter.addEventListener("change", filterByStatus);

//ФИЛЬТР ПО ДАТЕ

//СКАЧИВАНИЕ
function downloadExcel() {
const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet('Requests');

// Add header row
sheet.addRow(['Номер заявки', 'Дата', 'Инициатор', 'Ответственный', 'Статус заявки', 'Индекс', 'Категория', 'Наименование', 'Вар.исп', 'Баз.ед', 'Оборудование', 'Статья', 'Поставщик', 'Код', 'комментарий', 'Статус, дата', 'Кол-во']);

// Get data from Firebase Realtime Database
const requestsRef = database.ref('requests');
requestsRef.once('value', snapshot => {
  const requests = snapshot.val();

  // Add data rows for each request and its items
  Object.keys(requests).forEach(requestKey => {
    const requestData = requests[requestKey];
    requestData.items.forEach(itemData => {
      sheet.addRow([requestData.number, requestData.date, requestData.initiator, requestData.executive, requestData.statusRequest, itemData.rowIndexRow, itemData.category, itemData.name, itemData.variation, itemData.type, itemData.equipment, itemData.article, itemData.brand, itemData.code, itemData.comment,itemData.statusNom, itemData.count]);
    });
  });

  // Download file
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requests.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  });
});
}

// Add button event listener
const downloadButton = document.getElementById('download-button');


downloadButton.addEventListener('click', downloadExcel);

// Получаем заголовки столбцов таблицы
const tableHeaders = document.querySelectorAll(".table-request thead tr th");
const sortArrow = document.createElement("span.sort-arrow");
// Проходим по всем заголовкам столбцов
tableHeaders.forEach((header) => {
// Добавляем обработчик события на клик по заголовку столбца
header.addEventListener("click", () => {
// Получаем индекс столбца, по которому нужно сортировать (от 0 до n-1)
const columnIndex = Array.from(header.parentNode.children).indexOf(header);

// Получаем направление сортировки из атрибута "data-sort-direction"
const sortDirection = header.getAttribute("data-sort-direction");

// Преобразуем строки таблицы в массив
const tableRowsArray = Array.from(
  document.querySelectorAll(".table-request tbody tr")
);

// Сортируем массив строк таблицы по значению ячейки в выбранном столбце
tableRowsArray.sort((rowA, rowB) => {
  const cellA = rowA.querySelectorAll("td")[columnIndex];
  const cellB = rowB.querySelectorAll("td")[columnIndex];

  return cellA.textContent.localeCompare(cellB.textContent, undefined, {
    numeric: true
  });
});

// Если направление сортировки не задано или равно "asc", то сортируем по возрастанию
if (!sortDirection || sortDirection === "asc") {
  tableRowsArray.forEach((row) => {
    document.querySelector(".table-request tbody").appendChild(row);
  });
  header.setAttribute("data-sort-direction", "desc");
  sortArrow.classList.remove("asc");
  sortArrow.classList.add("desc");
} else {
  // Иначе сортируем по убыванию
  tableRowsArray.reverse().forEach((row) => {
    document.querySelector(".table-request tbody").appendChild(row);
  });
  header.setAttribute("data-sort-direction", "asc");
  sortArrow.classList.remove("desc");
  sortArrow.classList.add("asc");
}

// Удаляем классы .asc и .desc у всех заголовков, кроме текущего
tableHeaders.forEach((h) => {
  if (h !== header) {
    h.classList.remove("asc");
    h.classList.remove("desc");
  }
});

// Добавляем класс .asc или .desc в зависимости от направления сортировки
if (!sortDirection || sortDirection === "asc") {
  header.classList.remove("desc");
  header.classList.add("asc");
} else {
  header.classList.remove("asc");
  header.classList.add("desc");
}
});
});

const searchInput = document.getElementById('search');
const tableBody = document.getElementById('table-body');

function filterTable() {
const filterValue = searchInput.value.toLowerCase();
const rows = tableBody.getElementsByTagName('tr');

for (let i = 0; i < rows.length; i++) {
  const columns = rows[i].getElementsByTagName('td');
  let found = false;

  for (let j = 0; j < columns.length; j++) {
    const columnValue = columns[j].textContent.toLowerCase();

    if (columnValue.indexOf(filterValue) > -1) {
      found = true;
      break;
    }
  }

  if (found) {
    rows[i].style.display = '';
  } else {
    rows[i].style.display = 'none';
  }
}
}

searchInput.addEventListener('input', filterTable);