const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const cors = require('cors');
require('dotenv').config();


app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uvivufz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const userCollection = client.db('task-manager').collection('user')
    const taskCollection = client.db('task-manager').collection('tasks')


    app.post('/users', async (req, res) => {
      const userInfo = req.body;
      const result = await userCollection.insertOne(userInfo)
      res.send(result)
    })

    app.get('/tasks', async (req, res) => {
      let query = {}
      if (req.query?.email) {
          query = { email: req.query.email }
      }
      const result = await taskCollection.find(query).toArray()
      res.send(result)
  })

    app.post('/tasks', async(req,res)=>{
      const task = req.body;
      const result = await taskCollection.insertOne(task)
      res.send(result)
    })


    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true }
      const updatedStatus = req.body
      const assignment = {
          $set: {

              status: updatedStatus.status,
              
          }
      }

      const result = await taskCollection.updateOne(filter, assignment, options)
      res.send(result)
  })


  app.delete('/tasks/:id', async (req, res) => {
    const id = req.params.id

    const query = { _id: new ObjectId(id) }
    const result = await taskCollection.deleteOne(query)
    res.send(result)
})
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Server running');
});



app.listen(port, () => {
  console.log(`server is running on port `, port);
})