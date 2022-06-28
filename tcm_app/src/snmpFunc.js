var snmp = require ("net-snmp");

//var session = snmp.createSession ("127.0.0.1", "idv90we3rnov90wer");
var session = snmp.createSession ("127.0.0.1", "209ijvfwer0df92jd");

session.version = snmp.Version2c;

//           sysUpTimeInstance    uptime of computer       Local date and time?
var oids = ["1.3.6.1.2.1.1.3.0", "1.3.6.1.2.1.25.1.1.0", "1.3.6.1.2.1.25.1.2.0"];

let sysUpTimeSeconds = 0;

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
                //if(i === 0)
                //{
                //    console.log(varbinds[i].oid + " = " + (varbinds[i].value / 360000));
                //    sysUpTimeSeconds = varbinds[i].value /100;
                //}
                //else
                    console.log(varbinds[i].oid + " = " + varbinds[i].value);
            }
        }
    }
    session.close();
});