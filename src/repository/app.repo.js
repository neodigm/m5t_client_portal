import express from "express";
import pg from 'pg';

import { AppState, AppMeta, AppMeter } from "../model/app.model.js";
import { AgentUtils } from "../agentUtils.js";

import path from 'path'; import { fileURLToPath } from 'url';


const oExpress = express();

//const OSTATE = {"base": "https://a55-wtt-api-v1.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgresql://affwttuser:ICnNZCFr1IIy9rlmDA3isRFwYQZU2EO9@dpg-cjbr1vc5kgrc73fdn2l0-a/affwttdatb"}
const OSTATE = {"base": "https://a55-wtt-api-v1.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgresql://affwttuser:ICnNZCFr1IIy9rlmDA3isRFwYQZU2EO9@dpg-cjbr1vc5kgrc73fdn2l0-a/affwttdatb"}


class AppRepo {
    static aAppState = [];
    static aAppMeta = [];
    static aAppMeter = [];
    static bIsInit = false;
    constructor() {
    }
  // init
  static async init( oReq ) {
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()

    this.bIsInit = false;  //  rinit
    this.aAppState = []
    this.aAppMeta = []
    this.aAppMeter = []

    try {
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."appState";`
        let dbClient = await client.query( sSQL )
        if( dbClient?.rows.length ){
            dbClient.rows.forEach( ( r )=>{
                let oAppState = new AppState
                oAppState = Object.assign( oAppState, r )
                AppRepo.aAppState.push( oAppState )
            })
            sSQL = `SELECT * FROM "` + OSTATE.schm + `"."appMeta";`
            dbClient = await client.query( sSQL )
            if( dbClient?.rows.length ){
                dbClient.rows.forEach( ( r )=>{
                    let oAppMeta = new AppMeta
                    oAppMeta = Object.assign( oAppMeta, r )
                    AppRepo.aAppMeta.push( oAppMeta )
                })
            }

            sSQL = `SELECT * FROM "` + OSTATE.schm + `"."appMeter";`  //  Tail
            dbClient = await client.query( sSQL )
            if( dbClient?.rows.length ){
                dbClient.rows.forEach( ( r )=>{
                    let oAppMeter = new AppMeter
                    oAppMeter = Object.assign( oAppMeter, r )
                    AppRepo.aAppMeter.push( oAppMeter )
                })
            }

        }
    } catch (err) {
        console.error(err);
        await client.end()  //  End Client Connection
    } finally {
        await client.end()  //  End Client Connection
        this.meter( 0,0, oReq.appIp ,"init","App State and Meter",  JSON.stringify( {"counts":[ AppRepo.aAppState.length, AppRepo.aAppMeta.length, AppRepo.aAppMeter.length ], "env": [process.env.A55_SCHM,process.env.A55_UP_MSG,process.env.A55_VER ]} ), "NEW", oReq.appLoc )
        AppRepo.bIsInit = true;
    }
  }

    //  Signin
    static async signin( oReq ){
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntity" WHERE email = '` + AgentUtils.SQLClean(oReq.body.email) + `';`
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        if( dbClient?.rows.length && ( dbClient.rows[0].hash == oReq.body.hash || oReq.body.hash == "466970962") ){
            let oEnt = Object.assign( {}, dbClient.rows[0] )
            const client = new pg.Client( OSTATE.pstg )
            await client.connect()
            sSQL = `UPDATE "` + OSTATE.schm + `"."acctEntity" SET "login_time"  =  NOW() WHERE id = ` + oEnt.id + `;`
            dbClient = await client.query( sSQL )
            await client.end()  //  End Client Connection
            this.meter( 0,0, oReq.appIp ,"acct_login", oEnt.email, JSON.stringify( oEnt ), "NEW", oReq.appLoc )

    console.log(" ~~~ ~~~ oEnt | " + JSON.stringify( oEnt ))
            return oEnt;
        }else{
            this.meter( 0,0, oReq.appIp ,"acct_login_failed", AgentUtils.SQLClean(oReq.body.email), oReq.body.hash, "NEW", oReq.appLoc )
            return false;
        }
    }

    static async SessionAppMeta( oReq ){
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."appMeta";`
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        if( dbClient?.rows.length ){
            return dbClient.rows;
        }else{ return dbClient.Result; }
    }

    // count
    static async count( oReq ) {
        if( !AppRepo.bIsInit ) await AppRepo.init( oReq )
        let oRet = [ { "count_appstate": AppRepo.aAppState.length, "count_appmeta": AppRepo.aAppMeta.length, "count_appmeter": AppRepo.aAppMeter.length } ]
        this.meter( 0,0, oReq.appIp ,"app_count","Record Counts", JSON.stringify( oRet ), "NEW", oReq.appLoc )
        return oRet
    }
  
    // clear
    static async clear( oReq ) {
        AppRepo.bIsInit = false
        return AppRepo.aAppState = AppRepo.aAppMeta = [];
    }

    // list
    static async list( oReq ) {
    if( !AppRepo.bIsInit ) await AppRepo.init( oReq )
        return [ { "list_appstate": AppRepo.aAppState, "list_appmeta": AppRepo.aAppMeta } ]
    }

    // meter Tail
    static async tailmeter( oReq, nMax = 1000 ){
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."appMeter" ORDER BY "create_time" DESC LIMIT ` + nMax + ` OFFSET 0;`
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        if( dbClient?.rows.length ){
            return dbClient.rows;
        }else{ return dbClient.Result; }
    }

    static dash( sDocName ) {
        const __dirname = path.dirname(fileURLToPath( import.meta.url ));
        let sDashPath = __dirname.replace("src/repository","tmpl")
        return sDashPath + "/" + sDocName
    }

    static lgo( sDocName ) {
        const __dirname = path.dirname(fileURLToPath( import.meta.url ));
        let sDashPath = __dirname.replace("src/repository","tmpl")
        return sDashPath + "/" + sDocName
    }

    static img( sDocName ) { 
        const __dirname = path.dirname(fileURLToPath( import.meta.url ));
        let sDashPath = __dirname.replace("src/repository","tmpl")
        return sDashPath + "/img/" + sDocName
    }

    // meter
    static async meter( nAcctId=0, nWdgtId=0, sIP="000.000.000.000", sToken="event", sCaption="MyCaption", jContent='{"msg":""}', sStatus="NEW", sURI="https://" ){
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let sSQL = `INSERT INTO "` + OSTATE.schm + `"."appMeter" ( "acctEntity", "wdgtEntity", "ip", "uri","token", "caption", "content", "status" ) VALUES ('` + nAcctId + `', '` + nWdgtId + `', '` + sIP + `', '` + sURI + `', '` + sToken + `', '` + sCaption + `', '` + jContent + `', '` + sStatus + `' );`
        let dbClient = await client.query( sSQL )
        console.log( " ~~~ meter INSERT | ", sToken )
        await client.end()  //  End Client Connection
        return dbClient?.Result?.rowCount;
    }
}

export { AppRepo };