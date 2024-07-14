import express from "express";
import cors from "cors";  //  ?
import pg from 'pg';
import { AgentUtils } from "./agentUtils.js";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

import { appRoute } from "./routes/app.routes.js";
import { acctRoute } from "./routes/acct.routes.js";
import { wdgtRoute } from "./routes/wdgt.routes.js";


const OSTATE = {"base": "https://a55-wtt-api-v1.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgresql://affwttuser:ICnNZCFr1IIy9rlmDA3isRFwYQZU2EO9@dpg-cjbr1vc5kgrc73fdn2l0-a/affwttdatb"}
//const OSTATE = {"base": "https://a55-wtt-api-v1.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgresql://affwttuser:ICnNZCFr1IIy9rlmDA3isRFwYQZU2EO9@dpg-cjbr1vc5kgrc73fdn2l0-a/affwttdatb"}

const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}))  //  Allows FORM body to xmit via JSON (req.body)

app.use( "/v1/app", appRoute);
app.use( "/v1/acct", acctRoute);
app.use( "/v1/wdgt", wdgtRoute);

app.get( "/", function(req, res) {
    return res.status( 201 ).json({ "success": "root", "data": "pstg w err handl post git 2fa " })
});

app.get( "/v1", function(req, res) {
    return res.status( 201 ).json({ "success": "root", "data": "pstg w err handl post git 2fa " })
});

app.get( "/health", function(req, res) {
    return res.status( 200 ).json({ "success": "health", "data": "Healthy" })
} )

app.get( "/v1/health", AgentUtils.doTokenAuth, function(req, res) {
    return res.status( 200 ).json({ "success": "health", "data": "Healthy" })
} )


app.get(  "/v1/dbhealthy", async function(req, res) {
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()

    try {
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."appState";`
        const dbRes = await client.query( sSQL )
        let oRet = {}
        oRet[ dbRes?.rows[0]?.token ] = dbRes?.rows[0]?.content
        return res.status( 200 ).json({ "success": "DB health", "data": JSON.stringify( oRet ) })
 
    } catch (err) {
        console.error(err);
    } finally {
        await client.end()
    }
} )

console.log( process.env.A55_SCHM + " | " + process.env.A55_UP_MSG + " | " + process.env.A55_VER )
const port = process.env.PORT || 4444
app.listen(port, () => console.log("Server is running on port: " + port ));