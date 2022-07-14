fetch('http://localhost:3001/B')
.then(response => response.json())
.then(data => console.log(data));

//const {MongoClient} = require('mongodb');

//const url = "mongodb+srv://Noah:BongoMongo321@tcmcluster.wmrfz.mongodb.net/TCM_Data?retryWrites=true&w=majority";
//const client = new MongoClient(url);

//main().catch(console.error);

//async function main()
//{
//    RetreiveDocuments(client, 1);
//}


//async function RetreiveDocuments(client, numOfDocs, dbIndex = 0)
//{
//    const cursor= client.db("TCM_Data").collection("system_stats").find().limit(numOfDocs).skip(dbIndex);
//    const results = await cursor.toArray();
//    console.log(results);
//}