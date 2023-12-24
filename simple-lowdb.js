import express from 'express'
import http from 'http'
import { join, dirname } from 'path'
import { Low, JSONFile } from 'lowdb'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)


//create the web server
let app = express()
let server = http.createServer(app)
const port = process.env.PORT || 3000

 
app.get('/profile/:profile', async (req, res)=>{
  await db.read()
  const profiles = db.data.profiles

  let message = ''
  
  if(req.params.profile in profiles) {
    const profile = req.params.profile
    const location = profiles[profile].location
    message = `${profile} is currently in ${location}`
  } else {
    message = `The profile ${req.params.profile} is unknown.`
  }
  
  return res.end(message)
  
})

app.get('/profile', async (req, res)=>{
  await db.read()
  const profiles = db.data.profiles
  
  let listItems = ''
  for(let profile of profiles) {
    listItems += `<li>${profile.person}, ${profile.location}</li>`
  }
  
  const list = `<ul>${listItems}</ul>` 
  res.end(list)
})

app.get('/', (request, response)=>{
  
  // console.log(Object.keys(request))
  return response.end("this was served from /")
  
})

app.get('/api', async (request, response)=>{
  await db.read()
  const profiles = db.data.profiles
 
  return response.json(profiles)  
})

//launch the server
server.listen(port, ()=>{
  console.log(`simple.js is listening on port: ${port}`)
})