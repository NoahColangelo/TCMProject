//fetch('http://localhost:3001/B')
//.then(response => response.json())
//.then(data => console.log(data));

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

//import * as React from 'react';
//import {DataGrid} from '@mui/x-data-grid';


let data = [];
let rows = [];

RetreiveB();

async function RetreiveB()
{
    const res = await fetch('http://localhost:3001/B');
    data = await res.json();
    //console.log(data[0]._id);
      for(let i = 0; i < data.length; i++)
      {
          rows.push({_id:data[i]._id, ServerUpTime: data[i].ServerUpTime, SystemUpTime: data[i].SystemUpTime, LocalDate: data[i].LocalDate, MemoryUsage: data[i].MemoryUsage, CPU_Usage: data[i].CPU_Usage});
            //, ServerUpTime: this.data[i].ServerUpTime, SystemUpTime: this.data[i].SystemUpTime, LocalDate: this.data[i].LocalDate, MemoryUsage: this.data[i].MemoryUsage, CPU_Usage: this.data[i].CPU_Usage});
      }
    console.log(rows);
}

const columns = [
    {field: '_id', headerName: 'ID', width: 130},
    {field: 'ServerUpTime', headerName: 'ServerUpTime', width: 130},
    {field: 'SystemUpTime', headerName: 'SystemUpTime', width: 130},
    {field: 'LocalDate', headerName: 'LocalDate', width: 130},
    {field: 'MemoryUsage', headerName: 'Memory Usage(%)', width:130},
    {field: 'CPU Usage', headerName: 'CPU Usage(%)', width: 130}
];
