const {MongoClient} = require('mongodb');
var snmp = require ("net-snmp");
const express = require('express');
const cors = require('cors');

//Mongo Variables
const url = "mongodb+srv://Noah:BongoMongo321@tcmcluster.wmrfz.mongodb.net/TCM_Data?retryWrites=true&w=majority";
const client = new MongoClient(url);
//---------------

//SNMP Variables
//var session = snmp.createSession ("127.0.0.1", "alpha");
var session = snmp.createSession ("127.0.0.1", "beta");

session.version = snmp.Version2c;

var oids = ["1.3.6.1.2.1.1.3.0",// server upTime
            "1.3.6.1.2.1.25.1.1.0",// system upTime
            "1.3.6.1.2.1.25.1.2.0",// Local Date and Time
            "1.3.6.1.4.1.2021.4.5.0",// total available memory
            "1.3.6.1.4.1.2021.4.6.0",//current memory usage
            "1.3.6.1.4.1.2021.11.9.0"];// CPU usage%

var infoSend = [];
//------------------


const app = express();
app.use(cors());
const port = process.env.port || 3001;

var data = undefined;

app.listen(port, () => {
    console.log('app listening on port: ' + port);
});

app.get("/A", (req, res) => {
    res.send({ServerUpTime: infoSend.servUpTimeSeconds,
              SystemUpTime: infoSend.compUpTimeSeconds,
              LocalDate: infoSend.localDateTime,
              MemoryUsage: infoSend.memUsage,
              CPU_Usage: infoSend.cpuUsage});
    console.log('sent data');
});

let numOfDocs = 50;
let skipDocsNum = 0;

app.get("/B", (req, res) => {
    RetreiveDocuments(client, numOfDocs, skipDocsNum);
    //console.log(data);
    res.json(data);
    console.log('sent array of data');
});

RetreiveDocuments(client, numOfDocs, skipDocsNum);//calls it before to fill data
main();
setInterval(main, 60000);

function main()
{
    serverCall();
}

function serverCall()
{
    session.get (oids, function(error, varbinds){
        if(error)
        {
            console.error (error);
        }
        else
        {
            for(var i =0; i < varbinds.length; i++)
            {
                if(snmp.isVarbindError (varbinds[i]))
                {
                    console.error (snmp.varbindError (varbinds[i]));
                }
                else
                {
                    if(i === 0)//for getting the server upTime
                    {
                        //console.log(varbinds[i].oid + " = " + (varbinds[i].value / 100));
                        infoSend.servUpTimeSeconds = varbinds[i].value /100;
                    }
                    else if (i ===1)//for getting the upTime of when the OS turned on
                    {
                        //console.log(varbinds[i].oid + " = " + varbinds[i].value / 100);
                        infoSend.compUpTimeSeconds = varbinds[i].value/100;
                    }
                    else if (i === 2)//for getting the local date and time 
                    {
                        buf1 = Buffer.from(varbinds[i].value);

                        infoSend.localDateTime = new Date(
                            buf1.readUint16BE(0),
                            buf1.readUint8(2) -1,
                            buf1.readUint8(3),
                            buf1.readUint8(4),
                            buf1.readUint8(5),
                            buf1.readUint8(6)

                        )

                        //console.log(infoSend.localDateTime.toString());
                    }
                    else if (i === 3)
                    {
                        let num = Math.round((varbinds[4].value/ varbinds[3].value) * 100)/100
                        num = num.toFixed(2);
                        //console.log("Memeory usage: " + num * 100 + "%");
                        infoSend.memUsage = num * 100;
                    }
                    else if (i === 5)
                    {
                        infoSend.cpuUsage = varbinds[i].value;
                        //console.log("CPU usage: " + (varbinds[i].value) + "%");
                    }
                }
            }
        }

        createNewDocument(client, 
            {
                ServerUpTime: infoSend.servUpTimeSeconds,
                SystemUpTime: infoSend.compUpTimeSeconds,
                LocalDate: infoSend.localDateTime,
                MemoryUsage: infoSend.memUsage,
                CPU_Usage: infoSend.cpuUsage
    
            });


        //session.close();
    });
}

function createNewDocument(client, newDocument)
{
    const cursor = client.db("TCM_Data").collection("system_stats").insertOne(newDocument);
    console.log(`New listing created with the following id: ${cursor.insertedId}`);
    console.log(newDocument);
}

async function RetreiveDocuments(client, numOfDocs, dbIndex = 0)
{
    const cursor= client.db("TCM_Data").collection("system_stats").find().limit(numOfDocs).skip(dbIndex);
    data = await cursor.toArray();
    //return results;
}