const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/number', (req, res) => {
  res.json({ number: 32 }); 
});

app.post('/api/send-text', (req, res) => {
  const text = req.body.text;
  const number = req.body.number;
  res.json({ message: `Přijatý text: ${text} s číslem ${number}` });
});

app.listen(5000, () => {
  console.log('Server běží na http://localhost:5000');
});