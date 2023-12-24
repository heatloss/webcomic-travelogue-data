//import all of the libraries necessary
import { join, dirname } from "path";
import { JSONPreset } from "lowdb/node";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";

//create the web server
let app = express();
let server = http.createServer(app);
const port = process.env.PORT || 3000;

//configure lowdb usage
//https://github.com/typicode/lowdb usage instructions

const defaultData = {
  posts: [],
};
const __dirname = dirname(fileURLToPath(import.meta.url));

//handle POST body data
app.use(bodyParser.json());

app.use(express.static("public"));

//setup routes to handle incoming requests
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

//setup routes to handle incoming requests
app.get("/admin", (req, res) => {
  res.sendFile(__dirname + "/public/admin.html");
});

//handle POST requests to store the data
app.post("/edit", async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  db.read();
  const comicIndex = db.data.comics.findIndex(comic=>comic.id === req.body.id);
  db.data.comics.splice(comicIndex, 1, req.body);
  // db.write(); /* <-- ENABLE TO ALLOW SAVING */
  res.json(req.body);
});

//create an API that returns all posts as JSON
app.get("/comics", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  db.read();
  let messages = db.data.comics;
  res.json(messages);
});

//create an API that returns all posts as JSON
app.get("/comics/:comicId", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  db.read();
  let messages = db.data.comics.find(
    (comic) => comic.id === req.params.comicId
  );
  res.json(messages);
});

//create an API that returns all comic names as JSON, bundled with IDs and sortable names
app.get("/names", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  db.read();
  let messages = db.data.comics.map((comic) => {
    return {
      title: comic.name,
      sortname: comic.sortname || comic.name,
      id: comic.id,
    };
  });
  res.json(messages);
});

//create an API that returns all titles as JSON, sorted alphabetically
app.get("/titles", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  db.read();
  let messages = db.data.comics
    .map((comic) => {
      comic.sortname = comic.sortname || comic.name;
      return comic;
    })
    .sort((a, b) => a.sortname.localeCompare(b.sortname))
    .map((comic) => comic.name);
  res.json(messages);
});

//create an API that returns all tags as JSON
app.get("/tags", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  //read all current tags from the db
  db.read();
  let messages = db.data.tags;
  res.json(messages);
});

//create an API that returns all genres as JSON
app.get("/genres", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  //read all current genres from the db
  db.read();
  let messages = db.data.genres;
  res.json(messages);
});

//create an API that returns all updates as JSON
app.get("/updates", cors(), async (req, res) => {
  const db = await JSONPreset("db.json", defaultData);
  db.read();
  let messages = db.data.updates;
  res.json(messages);
});

//launch the server
server.listen(port, () => {
  console.log(`listening on port :${port}`);
});
