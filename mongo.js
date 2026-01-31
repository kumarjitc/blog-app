
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://kumarjitc_db_user:blog-toxicity@blog-db.r2bfyag.mongodb.net/?appName=blog-db";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const filter = {};
const projection = {genres:1};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const genres = await client.db("sample_mflix").collection("movies").aggregate([
      { $unwind: "$genres" },
      {
        $group: {
          _id: "$genres",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    //const cursor = genres.;
    //const result = await genres.toArray();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    console.log(genres);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
