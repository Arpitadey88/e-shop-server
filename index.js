const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lxlvg.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// middlewars
app.use(cors());
app.use(express.json());

async function run() {
  try {
    await client.connect();
    // console.log('connected to database');
    const database = client.db('eComShop');
    const productsCollection = database.collection('products');
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection('users');
    const reviewCollection = database.collection('reviews');

    // POST/Insert Product to Database from json
    app.post('/addProducts', async (req, res) => {
      const product = req.body;
      console.log('hit the post api', product);

      const result = await productsCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });

    // GET All Product From Database to UI 
    app.get('/products', async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products)
    })

    // GET Single Product from all product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      // console.log('getiing id');
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.json(product);
    })

    // Delete Single Product From Database
    app.delete("/deleteSingleProduct/:id", async (req, res) => {
      const result = await productsCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.json(result);
    });

    // add order
    app.post("/addOrder", async (req, res) => {
      console.log(req.body);
      const result = await ordersCollection.insertOne(req.body);
      res.json(result);
      console.log(result);
    });

    // get order api
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    //Get order api by email
    app.get("/myOrders/:email", async (req, res) => {
      console.log(req.params);
      const result = await ordersCollection
        .find({ email: req.params.email })
        .toArray();
      console.log(result);
      res.send(result);
    });

    // delete orders
    app.delete("/deleteOrders/:id", async (req, res) => {
      console.log(req.params);
      const result = await ordersCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      console.log(result);
      res.send(result);
    });

    // update-order-status
    app.put("/orderStatusUpdate", async (req, res) => {
      const id = req?.body?.id;
      const status = req?.body?.status;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: status,
        },
      };
      const result = await ordersCollection.updateOne(query, updateDoc);
      res.json(result);
    });

    // Add Save Users
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // Make Users
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });

    // Make Admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      console.log('put', user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    // Check Admin or Not
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

     // Post Review API
     app.post('/reviews', async (req, res) => {
      const review = req.body;
      console.log('hit the post api', review);

      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
  });

  // GET REVIEW API
  app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({});
      const review = await cursor.toArray();
      res.send(review);
  })

  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('E-shop Server is Running');
});

app.listen(port, () => {
  console.log('E-shop Server running at port', port);
})
