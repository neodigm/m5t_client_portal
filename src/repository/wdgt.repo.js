import express from "express";
import pg from 'pg';

import { wdgtEntity, wdgtSandbox } from "../model/wdgt.model.js";
import { AgentUtils, QRCode, PassThrough } from "../agentUtils.js";

import { v4 as uuidv4 } from "uuid";

import path from 'path'; import { fileURLToPath } from 'url';

const oExpress = express();

//const OSTATE = {"base": "https://intd-idp-api-v1-iods.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgres://affwttuser:ICnNZCFr1IIy9rlmDA3isRFwYQZU2EO9@dpg-cjbr1vc5kgrc73fdn2l0-a/affwttdatb"}
const OSTATE = {"base": "https://intd-idp-api-v1-iods.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgres://affwttuser:me3dxL7JszkYv9EBSTO5RYUeKAhEbOdW@dpg-cp0miuq1hbls73ed59c0-a/affwttdatb_t3f2"}


class WdgtRepo {
    static aWdgtEntity = [];
    static aWdgtSandbox = [];
    static bIsInit = false;
    constructor() {
    }
  // init
  static async init() {
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()

    this.aWdgtEntity = [];
    this.aWdgtSandbox = [];
    this.bIsInit = false;

    try {
        //let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."wdgtEntity" ORDER BY "token" WHERE "status" != "DELETED";`
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."wdgtEntity" WHERE "status" != 'DELETED' ORDER BY "token";`
        let dbClient = await client.query( sSQL )
        if( dbClient?.rows.length ){
            dbClient.rows.forEach( ( r )=>{
                let owdgtEntity = new wdgtEntity
                owdgtEntity = Object.assign( owdgtEntity, r )
                WdgtRepo.aWdgtEntity.push( owdgtEntity )
            })
            sSQL = `SELECT * FROM "` + OSTATE.schm + `"."wdgtSandbox";`  //  TODO no need to cache all, just get a count
            dbClient = await client.query( sSQL )
            if( dbClient?.rows.length ){
                dbClient.rows.forEach( ( r )=>{
                    let owdgtSandbox = new wdgtSandbox
                    owdgtSandbox = Object.assign( owdgtSandbox, r )
                    WdgtRepo.aWdgtSandbox.push( owdgtSandbox )
                })
            }
        }
    } catch (err) {
        console.error(err);
        await client.end()  //  End Client Connection
    } finally {
        await client.end()  //  End Client Connection
        WdgtRepo.bIsInit = true;
    }
  }

    // create
    static async create( oReq ) {
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        oReq.body[ "guid" ] = AgentUtils.genHash( uuidv4() )
        let sSQL = `INSERT INTO "` + OSTATE.schm + `"."wdgtEntity" ("token", "name", "caption", "marquee", "content", "content_logic", "assets", "class", "status", "guid") VALUES `
        sSQL += `(`;
        ["token", "name", "caption", "marquee", "content", "content_logic", "assets", "class", "status", "guid"].forEach( ( sCol )=>{
            sSQL += `'` + oReq.body[ sCol ] + `',`;
        } )
        sSQL = sSQL.slice(0, -1)  //  Remove last comma
        sSQL += `)`;
        let dbClient = await client.query( sSQL )
        await this.meter( 0,0, oReq.appIp ,"create_wdgtEntity","New wdgtEntity", `{"token":"` + oReq.body.token + `"}`, "NEW", oReq.appLoc )
        await client.end()  //  End Client Connection
    }

    // create
    static async sndbxCreate( oReq ) {
        const client = new pg.Client( OSTATE.pstg )
        const PARAM = "wtt55"
        await client.connect()
        let sTurnaround = AgentUtils.genHash( uuidv4() )
        let sSQL = `INSERT INTO "` + OSTATE.schm + `"."wdgtSandbox" ("token", "sandbox", "ip", "uri", "guid") VALUES `
        sSQL += `(`;
            sSQL += `'` + oReq.body[ "token" ] + `',`;
            sSQL += `'` + oReq.body[ "compressed" ] + `',`;
            sSQL += `'` + oReq.appIp + `',`;
            sSQL += `'` + oReq.appLoc + `',`;
            sSQL += `'` + sTurnaround + `'`;
        sSQL += `)`;
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        let oMeter = {}
        oMeter.token = oReq.body?.token
        oMeter.compressed = oReq.body?.compressed
        await this.meter( 0,0, oReq.appIp ,"create_wdgtSndbx","New wdgtSndbx", JSON.stringify( oMeter ) , "NEW", oReq.appLoc )
        let sLink = oReq.appLoc.replace( PARAM, "wtt")  //  Filter out (replace) preexisting wtt55 params in case of reshare "?"
        if( sLink.indexOf("?") == -1 ){ sLink += "?" }else{ sLink += "&" }
        sLink += PARAM + "=" + sTurnaround
        return {"uri": sLink, "qr_uri": sTurnaround }
    }
    static async getSandbx( sGuid ){  //  Called to create QR
        const client = new pg.Client( OSTATE.pstg )  //  TODO meter if the guid is not found
        await client.connect()
        let sSQL = `SELECT uri FROM "` + OSTATE.schm + `"."wdgtSandbox" WHERE guid = '` + sGuid + `';`
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        return dbClient.rows[0];
    }

    // edit PATCH
    static async edit( oReq ) {
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        //  TODO need logic to refresh status date if STATUS has changed
        let sSQL = `UPDATE "` + OSTATE.schm + `"."wdgtEntity" SET("update_time", "id", "token", "name", "caption", "marquee", "content", "content_logic", "partials", "assets", "keywords", "class", "status") = `
        sSQL += `(`;
        sSQL += ` NOW(),`;
            ["id", "token", "name", "caption", "marquee", "content", "content_logic", "partials", "assets", "keywords", "class", "status"].forEach( ( sCol )=>{
            sSQL += `'` + oReq.body[ sCol ] + `',`;
        } )
        sSQL = sSQL.slice(0, -1)  //  Remove last comma
        sSQL += `) WHERE id = '` + oReq.body[ "id" ] + `'`;
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        await this.meter( 0,0, oReq.appIp ,"edit_wdgtEntity","Edit wdgtEntity", `{"token":"` + oReq.body.token + `"}`, "NEW", oReq.appLoc )
    }

    // count
    static async count( oReq ) {
        if( !WdgtRepo.bIsInit ) await WdgtRepo.init()
        return [ { "count_wdgtEntity": WdgtRepo.aWdgtEntity.length, "count_wdgtSandbox": WdgtRepo.aWdgtSandbox.length } ]
    }
    
    // clear
    static clear( oReq ) {
        WdgtRepo.bIsInit = false
        return WdgtRepo.aWdgtEntity = WdgtRepo.aWdgtSandbox = [];
    }

    // list
    static async list( oReq ) {
        if( !WdgtRepo.bIsInit ) await WdgtRepo.init()
        return [ { "list_wdgtEntity": WdgtRepo.aWdgtEntity, "list_wdgtSandbox": WdgtRepo.aWdgtSandbox } ]
    }

    // retrieve 1
    static async retrieveWdgt( oReq, sId ) {
        if( !WdgtRepo.bIsInit ) await WdgtRepo.init()
        let oWdgt = WdgtRepo.aWdgtEntity.filter( ( oW )=>{
            if( Number.isNaN( sId ) || isNaN( sId ) ){
                if( oW.token === sId ) return true;
            }else{
                if( oW.id === sId ) return true;
            }
        })[0]
        return [ { "wdgtEntity": oWdgt } ]
    }

    // retrieve 1 content as json
    static async retrieveWdgtContent( oReq, sId ) {
        let LZString = AgentUtils.getLZW()
        if( !WdgtRepo.bIsInit ) await WdgtRepo.init()
        let oWdgt = WdgtRepo.aWdgtEntity.filter( ( oW )=>{
            if( Number.isNaN( sId ) || isNaN( sId ) ){  //  Expects an Id (num) or assumes a token (string)
                if( oW.token === sId && (oW.status == "ACTIVE") ) return true;
            }else{
                if( oW.id === sId ) return true;
            }
        })[0]
        if( !oWdgt ){
            await this.meter( 0,0, oReq.appIp, "rtrv_not_found", "token not found", `{"token":"` + sId + `","loc":"` + oReq.appLoc + `"}`, "NEW", oReq.appLoc )
            return sId + " not found"
        }
        oWdgt.partials.forEach( async ( sPartToken )=>{  //  Append partials
            const client = new pg.Client( OSTATE.pstg )
            await client.connect()
            let sSQL = `SELECT content FROM "` + OSTATE.schm + `"."wdgtEntity" WHERE token = '` + sPartToken + `';`  //  Class SSI_child_wdgt
            let dbClient = await client.query( sSQL )
            await client.end()  //  End Client Connection
            let sDecomp = LZString.decompressFromEncodedURIComponent( oWdgt.content.compressed )
            sDecomp += LZString.decompressFromEncodedURIComponent( dbClient.rows[0].content.compressed )
            oWdgt.content.compressed = LZString.compressToEncodedURIComponent( sDecomp )
        } )
        let oDTO = Object.assign( {}, oWdgt.content )  //  let oDTO = JSON.parse( JSON.stringify(oWdgt.content) )
        oDTO.assets = {}  //  Add JS and CSS assets
        oDTO.assets = oWdgt.assets
        oDTO.partials = {}  //  Add JS and CSS partials
        oDTO.partials = oWdgt.partials
        await this.meter( 0,0, oReq.appIp ,"rtrv_wdgtContent", sId,  `{"token":"` + sId + `","loc":"` + oReq.appLoc + `"}`, "NEW", oReq.appLoc )
        const oSrchParm = new URLSearchParams( oReq.appLoc.replace("?", "&") )  //  Note: the token/?wtt55 pattern does not work
        if( oSrchParm.get("wtt55") !== null ){  //  Requesting a Sandbox
            let sGuid = oSrchParm.get("wtt55")
            await this.meter( 0,0, oReq.appIp ,"rtrv_wdgtSandbox", sId, sGuid, "NEW", oReq.appLoc )
            const client = new pg.Client( OSTATE.pstg )
            await client.connect()
            let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."wdgtSandbox" WHERE guid = '` + sGuid + `';`
            let dbClient = await client.query( sSQL )
            await client.end()  //  End Client Connection
            if( dbClient?.rows && dbClient.rows[0]?.sandbox ){
    console.log( " ~~~ sndbox | " + JSON.stringify( dbClient.rows[0] ) )
                oDTO.sandbox = dbClient.rows[0].sandbox
            }else{
                await this.meter( 0,0, oReq.appIp ,"rtrv_wdgtSandbox_not_found", sId, sGuid, "NEW", oReq.appLoc )
            }
        }
        return oDTO
    }

    // retrieve 1 logic (js file)
    static async retrieveWdgtLogic( oReq, sId ) {
        if( !WdgtRepo.bIsInit ) await WdgtRepo.init()
        let oWdgt = WdgtRepo.aWdgtEntity.filter( ( oW )=>{
            if( Number.isNaN( sId ) || isNaN( sId ) ){
                if( oW.token === sId.replace(".js", "") ) return true;
            }else{
                if( oW.id === sId ) return true;
            }
        })[0]
        if( oWdgt ){
            await this.meter( 0,0, oReq.appIp ,"rtrv_wdgtLogic", "Request Logic File", `{"token":"` + sId + `","loc":"` + oReq.appLoc + `"}`, "NEW", oReq.appLoc )
            let LZString = AgentUtils.getLZW()
            return LZString.decompressFromEncodedURIComponent( oWdgt.content_logic )
        }else{
            await this.meter( 0,0, oReq.appIp ,"rtrv_wdgtLogic_not_found", "Request Logic Not Found", `{"token":"` + sId + `","loc":"` + oReq.appLoc + `"}`, "NEW", oReq.appLoc )
            return "/* not found */"
        }
    }

    // delete 1
    static async delete( oReq, sId ) {
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let oWdgt = WdgtRepo.aWdgtEntity.filter( ( oW )=>{
            if( Number.isNaN( sId ) || isNaN( sId ) ){
                if( oW.token === sId ) return true;
            }else{
                if( oW.id === sId ) return true;
            }
        })[0]  // Soft Delete
        let sSQL = `UPDATE "` + OSTATE.schm + `"."wdgtEntity" SET("status_time", "status") = ( NOW(), 'DELETED') WHERE id = '` + sId + `';`
        let dbClient = await client.query( sSQL )
        await this.meter( 0,0, oReq.appIp ,"del_wdgtEntity","Del wdgtEntity", `{"token":"` + oWdgt.token + `"}`, "NEW", oReq.appLoc )
        await WdgtRepo.init()
        await client.end()  //  End Client Connection
        return [ { "wdgtEntity": oWdgt } ]
    }

    // meter
    static async meter( nAcctId=0, nWdgtId=0, sIP="000.000.000.000", sToken="event", sCaption="MyCaption", jContent='{"msg":""}', sStatus="NEW", sURI="https://" ){
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let sSQL = `INSERT INTO "` + OSTATE.schm + `"."appMeter" ( "acctEntity", "wdgtEntity", "ip", "uri","token", "caption", "content", "status" ) VALUES ('` + nAcctId + `', '` + nWdgtId + `', '` + sIP + `', '` + sURI + `', '` + sToken + `', '` + sCaption + `', '` + jContent + `', '` + sStatus + `' );`
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection
        console.log( " ~~~ meter INSERT | ", sToken )
        return dbClient?.Result?.rowCount;
    }
}

export { WdgtRepo };