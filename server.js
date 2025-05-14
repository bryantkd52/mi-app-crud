const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Crear tabla si no existe
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)");
});

// Ruta: Listar todos
app.get('/', (req, res) => {
  db.all("SELECT * FROM items", (err, rows) => {
    res.render('index', { items: rows });
  });
});

// Ruta: Formulario para nuevo
app.get('/new', (req, res) => {
  res.render('new');
});

// Ruta: Agregar nuevo
app.post('/add', (req, res) => {
  const name = req.body.name;
  db.run("INSERT INTO items (name) VALUES (?)", [name], () => {
    res.redirect('/');
  });
});

// Ruta: Editar formulario
app.get('/edit/:id', (req, res) => {
  db.get("SELECT * FROM items WHERE id = ?", [req.params.id], (err, row) => {
    res.render('edit', { item: row });
  });
});

// Ruta: Guardar edición
app.post('/edit/:id', (req, res) => {
  const { name } = req.body;
  db.run("UPDATE items SET name = ? WHERE id = ?", [name, req.params.id], () => {
    res.redirect('/');
  });
});

// Ruta: Eliminar
app.post('/delete/:id', (req, res) => {
  db.run("DELETE FROM items WHERE id = ?", [req.params.id], () => {
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en puerto ${PORT}`));
