const express = require("express");
const path = require('path')
const fs = require('fs').promises;

const app = express();
const port = 3000;

let products = path.join(__dirname, 'products.json')

function isAuthorized(req, res, next) {
  const auth = req.headers.authorization;
  if (auth === 'secretpassword') {
    next();
  } else {
    res.status(401);
    res.send('Not permitted');
  }
}

let bodyParser = require('body-parser');
app.use(bodyParser.json());



app.get("/", (req, res) => res.send("Hello API!"));

app.get("/products/:id", isAuthorized, async (req, res) => {
  let data = JSON.parse(await fs.readFile(products))

  let find = data.find((p) => +p.id === +req.params.id);
  res.json(find)
});

app.get("/products", isAuthorized, async (req, res) => {
  const page = +req.query.page;
  const pageSize = +req.query.pageSize;

  let data = JSON.parse(await fs.readFile(products))

  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    res.json(data.slice(start, end));
  } else {
    res.json(data)
  }
})

app.post("/products", isAuthorized, async (req, res) => {
  let data = JSON.parse(await fs.readFile(products))

  const newProduct = { ...req.body, id: `${data.length + 1}` }

  data.push(newProduct)

  await fs.writeFile(products, JSON.stringify(data))
  res.json(newProduct);
})
app.put("/products", isAuthorized, async (req, res) => {
  let data = JSON.parse(await fs.readFile(products))

  let updatedProduct;
  data = data.map(p => {
    if (+p.id === +req.body.id) {
      updatedProduct = { ...p, ...req.body };
      return updatedProduct;
    }
    return p;
  })

  await fs.writeFile(products, JSON.stringify(data))
  res.json(updatedProduct);
})
app.delete("/products", isAuthorized, async (req, res) => {
  let data = JSON.parse(await fs.readFile(products))

  const deletedProduct = data.find(p => +p.id === +req.body.id);
  data = data.filter(p => +p.id !== +req.body.id);

  await fs.writeFile(products, JSON.stringify(data))
  res.json(deletedProduct);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
