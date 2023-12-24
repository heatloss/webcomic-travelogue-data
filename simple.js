import express from 'express'
import http from 'http'

//create the web server
let app = express()
let server = http.createServer(app)
const port = process.env.PORT || 3000

const profiles = {
  "erin": {
    "location": "Pittsburgh"
  },
  "alvin": {
    "location": "New Haven"
  },
  "henrietta": {
    "location": "the couch"
  }
}
  
app.get('/profile/:profile', (req, res)=>{
  
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

app.get('/profile', (req, res)=>{
  
  const availableProfiles = Object.keys(profiles)
  
  let profileLinks = ''
  for(let profile of availableProfiles) {
    profileLinks += `<li>
      <a href="/profile/${profile}">
        ${profile}
      </a>
    </li>`
  }
  const profileList = `<ul>${profileLinks}</ul>`
  const html = `
    <html>
      <head>
        <script>
          console.log("This is in the browser!")
        </script>
      </head>
      <body>
        ${profileList}
      </body>
    </html>
  `
  
  res.end(`${html}`)
  
})

app.get('/', (request, response)=>{
  
  // console.log(Object.keys(request))
  return response.end("this was served from /")
  
})

app.get('/api', (request, response)=>{
  
  return response.json(profiles)
  
})

//launch the server
server.listen(port, ()=>{
  console.log(`simple.js is listening on port: ${port}`)
})