import express from "express";
import Router from "express";

import path from 'path'; import { fileURLToPath } from 'url';

import { default as fetch, Headers } from 'node-fetch';

import { AcctRepo } from "../repository/acct.repo.js";
import { AgentUtils, QRCode, PassThrough } from "../agentUtils.js";



const app = express();

const __dirname = path.dirname(fileURLToPath( import.meta.url ));
//let sDashPath = __dirname.replace("src", "dash")
app.use(express.static(path.join( __dirname , 'dist')));

const acctRoute = Router();

acctRoute.post('/create', AgentUtils.doTokenAuth, async (req, res) => { // Create new acctEntity
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.createAcctEntity( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.post('/resetHash', AgentUtils.doTokenAuth, async (req, res) => { // resetHash
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.resetHash( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.get('/retrieveAcctEntity/:guid', AgentUtils.doTokenAuth, async (req, res) => { // Get one Entity
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await AcctRepo.retrieveAcctEntity( req, req.params.guid ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.get('/acctEntitySnapshot', AgentUtils.doTokenAuth, async (req, res) => { // Get acctEntitySnapshot View - Compressed
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await AcctRepo.acctEntitySnapshot( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.get('/list', AgentUtils.doTokenAuth, async (req, res) => { // Get Lists
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await AcctRepo.list( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.get('/SessionAcctEntity/:id', AgentUtils.doTokenAuth, async (req, res) => { // Get one Entity and parent and grand parent
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.SessionAcctEntity( req, req.params.id ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.get('/readEntitiesByRole', AgentUtils.doTokenAuth, async (req, res) => { // Get Entities by Role (header)
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.readEntitiesByRole( req ) } )
    }else { return res.status( 403 ).json({ "ok": "evalReq Failed" }) }
} )

acctRoute.delete('/:guid', AgentUtils.doTokenAuth, async (req, res) => { // soft del one
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.delete( req, req.params.guid ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.patch('/editAcctEntity/:guid', AgentUtils.doTokenAuth, async (req, res) => { //  edit entity
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await AcctRepo.editAcctEntity( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.get('/SessionIntake/:guid', AgentUtils.doTokenAuth, async (req, res) => { // Get one Intake given parent (client_admin_role) guid
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        //if( req.params.class.indexOf("client_") == -1 ) return res.status( 201 ).json({ "ok": false } ) // only client roles
        let oData = await AcctRepo.SessionIntake( req, req.params.guid )
        if( oData ){
            return res.status( 200 ).json({ "ok": true, "data": oData } )
        }else{ return res.status( 200 ).json({ "ok": false } ) }
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

acctRoute.post('/createAcctIntake', AgentUtils.doTokenAuth, async (req, res) => { // Create new acctIntake
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.createAcctIntake( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )
acctRoute.patch('/editAcctIntake', AgentUtils.doTokenAuth, async (req, res) => { // Create new acctIntake
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AcctRepo.editAcctIntake( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )



export { acctRoute };