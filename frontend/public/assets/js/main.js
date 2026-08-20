const $ = (selector) => document.querySelector(selector);
const API = { autor: "/autores", libro: "/libros" };

const authorForm = $("#author-form");
const bookForm = $("#book-form");
const authorMessage = $("#author-message");
const bookMessage = $("#message");

let authors = [];
let books = [];

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function buttons(type, id) {
  return `
    <button data-type="${type}" data-action="edit" data-id="${id}">
      Editar
    </button>
    <button class="peligro" data-type="${type}" data-action="delete" data-id="${id}">
      Eliminar
    </button>
  `;
}

function showMessage(element, text, error = false) {
  element.textContent = text;
  element.className = `mensaje ${error ? "error" : "exito"}`;
}

async function request(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(result.mensaje || "No fue posible realizar la operación");
  }

  return result.data;
}

function renderAuthors() {
  $("#authors-body").innerHTML = authors
    .map(
      (author) => `
        <tr>
          <td>${author.id}</td>
          <td>${escapeHTML(author.nombre)}</td>
          <td>${author.libros.length}</td>
          <td class="acciones-tabla">${buttons("autor", author.id)}</td>
        </tr>
      `
    )
    .join("");

  $("#autorId").innerHTML = authors
    .map(
      (author) =>
        `<option value="${author.id}">${escapeHTML(author.nombre)}</option>`
    )
    .join("");

  $("#authors-empty").classList.toggle("oculto", authors.length > 0);

  const anonymous = authors.find(({ nombre }) => nombre === "Anónimo");
  if (anonymous) $("#autorId").value = anonymous.id;
}

function renderBooks() {
  $("#books-body").innerHTML = books
    .map(
      (book) => `
        <tr>
          <td>${book.id}</td>
          <td>
            <img
              class="portada"
              src="${escapeHTML(book.portada)}"
              alt="Portada de ${escapeHTML(book.titulo)}"
            />
          </td>
          <td>${escapeHTML(book.titulo)}</td>
          <td>${escapeHTML(book.autor?.nombre || "Anónimo")}</td>
          <td>${book.year}</td>
          <td class="acciones-tabla">${buttons("libro", book.id)}</td>
        </tr>
      `
    )
    .join("");

  $("#empty-message").classList.toggle("oculto", books.length > 0);
}

async function loadData() {
  [authors, books] = await Promise.all([
    request(API.autor),
    request(API.libro),
  ]);

  renderAuthors();
  renderBooks();
}

function resetForm(type) {
  const isAuthor = type === "autor";
  const form = isAuthor ? authorForm : bookForm;

  form.reset();
  delete form.dataset.id;

  $(isAuthor ? "#author-form-title" : "#form-title").textContent =
    isAuthor ? "Administrar autores" : "Agregar libro";

  $(isAuthor ? "#author-submit-button" : "#submit-button").textContent =
    isAuthor ? "Guardar autor" : "Guardar libro";

  $(isAuthor ? "#author-cancel-button" : "#cancel-button")
    .classList.add("oculto");

  if (!isAuthor) {
    $("#portada").required = true;
    const anonymous = authors.find(({ nombre }) => nombre === "Anónimo");
    if (anonymous) $("#autorId").value = anonymous.id;
  }
}

async function execute(task, message, output, reset) {
  try {
    await task();
    reset?.();
    showMessage(output, message);
    await loadData();
  } catch (error) {
    showMessage(output, error.message, true);
  }
}

function save(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const isAuthor = form === authorForm;
  const type = isAuthor ? "autor" : "libro";
  const id = form.dataset.id;

  const options = isAuthor
    ? {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: new FormData(form).get("nombre"),
        }),
      }
    : {
        method: id ? "PUT" : "POST",
        body: new FormData(form),
      };

  execute(
    () => request(id ? `${API[type]}/${id}` : API[type], options),
    `${isAuthor ? "Autor" : "Libro"} ${
      id ? "actualizado" : "creado"
    } correctamente`,
    isAuthor ? authorMessage : bookMessage,
    () => resetForm(type)
  );
}

function edit(type, item) {
  const isAuthor = type === "autor";
  const form = isAuthor ? authorForm : bookForm;

  form.dataset.id = item.id;

  if (isAuthor) {
    $("#author-name").value = item.nombre;
  } else {
    $("#titulo").value = item.titulo;
    $("#year").value = item.year;
    $("#autorId").value = item.autorId;
    $("#portada").required = false;
  }

  $(isAuthor ? "#author-form-title" : "#form-title").textContent =
    `Editar ${isAuthor ? "autor" : "libro"}`;

  $(isAuthor ? "#author-submit-button" : "#submit-button").textContent =
    "Guardar cambios";

  $(isAuthor ? "#author-cancel-button" : "#cancel-button")
    .classList.remove("oculto");
}

function remove(type, item) {
  const isAuthor = type === "autor";
  const name = isAuthor ? item.nombre : item.titulo;
  const warning = isAuthor
    ? ` y sus ${item.libros.length} libro(s)`
    : "";

  if (!confirm(`¿Eliminar "${name}"${warning}?`)) return;

  execute(
    () => request(`${API[type]}/${item.id}`, { method: "DELETE" }),
    isAuthor
      ? "Autor y sus libros eliminados correctamente"
      : "Libro eliminado correctamente",
    isAuthor ? authorMessage : bookMessage,
    () => resetForm(type)
  );
}

authorForm.addEventListener("submit", save);
bookForm.addEventListener("submit", save);

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { type, action } = button.dataset;
  const list = type === "autor" ? authors : books;
  const item = list.find(({ id }) => id === Number(button.dataset.id));

  if (!item) return;
  action === "edit" ? edit(type, item) : remove(type, item);
});

$("#author-cancel-button").addEventListener(
  "click",
  () => resetForm("autor")
);

$("#cancel-button").addEventListener(
  "click",
  () => resetForm("libro")
);

$("#reload-button").addEventListener("click", () => {
  loadData()
    .then(() => showMessage(bookMessage, "Datos actualizados"))
    .catch((error) => showMessage(bookMessage, error.message, true));
});

loadData().catch((error) =>
  showMessage(bookMessage, error.message, true)
);