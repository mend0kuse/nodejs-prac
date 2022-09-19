const express = require("express");
const app = express();
const port = 3000;

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


let products = [
  {
    id: 1,
    userID: 1,
    title: "LOREM",
    body: "loremloremloremloremlorem",
  },
  {
    id: 2,
    userID: 1,
    title: "asdasd",
    body: "lorem",
  },
  {
    id: 3,
    userID: 2,
    title: "dasdasdas",
    body: "loremlorem",
  },
];

app.get("/", (req, res) => res.send("Hello API!"));

app.get("/products/:id",isAuthorized, (req, res) => {
  let find=products.find((p) => p.id === +req.params.id);
  res.json(find)
});

app.get("/products", isAuthorized, (req, res) => {
  const page = +req.query.page;
  const pageSize = +req.query.pageSize;
  if (page && pageSize) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    res.json(products.slice(start, end));
  } else {
    res.json(products);
  }
})
app.post("/products", isAuthorized, (req, res) => {
  const newProduct = { ...req.body, id: products.length + 1 }
  products = [...products, newProduct]
  res.json(newProduct);
})
app.put("/products", isAuthorized, (req, res) => {
  let updatedProduct;
  products = products.map(p => {
    if (p.id === req.body.id) {
      updatedProduct = { ...p, ...req.body };
      return updatedProduct;
    }
    return p;
  })
  res.json(updatedProduct);
})
app.delete("/products", isAuthorized, (req, res) => {
  const deletedProduct = products.find(p => p.id === +req.body.id);
  products = products.filter(p => p.id !== +req.body.id);
  res.json(deletedProduct);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
