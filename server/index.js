const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Hello Wor!')
})
app.get('/login', (req, res) => {
  res.send('login page')
})
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})