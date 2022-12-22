import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()

const PORT = 3000

let clients = []
let facts = []

app.listen(PORT, () => {
  console.log(`Facts Events service listening at http://localhost:${PORT}`)
})

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/status', (_, response) => response.json({ clients: clients.length }))
app.get('/events', eventsHandler)
app.post('/fact', addFact)

function eventsHandler(request, response) {
  const headers = {
    'Content-Type': 'text/event-stream',
    Connection: 'keep-alive',
    'Cache-Control': 'no-cache',
  }
  response.writeHead(200, headers)

  const data = `data: ${JSON.stringify(facts)}\n\n`

  response.write(data)

  const clientId = Date.now()

  const newClient = {
    id: clientId,
    response,
  }

  clients.push(newClient)

  request.on('close', () => {
    console.log(`${clientId} Connection closed`)
    clients = clients.filter(client => client.id !== clientId)
  })
}

function sendEventsToAll(newFact) {
  clients.forEach(client => client.response.write(`data: ${JSON.stringify(newFact)}\n\n`))
}

async function addFact(request, response) {
  const newFact = request.body
  facts.push(newFact)
  response.json(newFact)
  return sendEventsToAll(newFact)
}
