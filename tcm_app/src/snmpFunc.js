//import Buffer from 'node:buffer';

var snmp = require ("net-snmp");

//var session = snmp.createSession ("127.0.0.1", "idv90we3rnov90wer");
var session = snmp.createSession ("127.0.0.1", "209ijvfwer0df92jd");

session.version = snmp.Version2c;


var oids = ["1.3.6.1.2.1.1.3.0",// server upTime
            "1.3.6.1.2.1.25.1.1.0",// system upTime
            "1.3.6.1.2.1.25.1.2.0",// Local Date and Time
            "1.3.6.1.2.1.25.2.3.1.5.101",// total available memory
            "1.3.6.1.2.1.25.2.3.1.6.101",//current memory usage
            "1.3.6.1.2.1.25.4.2.1.3"];// CPU usage%

let sysUpTimeSeconds = 0;
let compUpTimeSeconds = 0;

let buf1;
let localDateTime;

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
                    console.log(varbinds[i].oid + " = " + (varbinds[i].value / 100));
                    sysUpTimeSeconds = varbinds[i].value /100;
                }
                else if (i ===1)//for getting the upTime of when the OS turned on
                {
                    console.log(varbinds[i].oid + " = " + varbinds[i].value / 100);
                    compUpTimeSeconds = varbinds[i].value/100;
                }
                else if (i === 2)//for getting the local date and time 
                {
                    buf1 = Buffer.from(varbinds[i].value);

                    localDateTime = new Date(
                        buf1.readUint16BE(0),
                        buf1.readUint8(2) -1,
                        buf1.readUint8(3),
                        buf1.readUint8(4),
                        buf1.readUint8(5),
                        buf1.readUint8(6)

                    )

                    console.log(localDateTime.toString());

                    //localDateTime = '';
                    //localDateTime = buf1.readUint16BE(0) + ' ';

                    //for (let i = 2; i < buf1.byteLength; i++)
                    //{
                    //    localDateTime += buf1.readUint8(i) + ' ';
                    //}
                    //sconsole.log(localDateTime);
                }
                else
                console.log(varbinds[i].oid + " = " + (varbinds[i].value));
            }
        }
    }
    session.close();
});