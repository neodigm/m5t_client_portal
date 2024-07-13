import express from "express";
import Router from "express";

import path from 'path'; import { fileURLToPath } from 'url';

import { default as fetch, Headers } from 'node-fetch';

import { WdgtRepo } from "../repository/wdgt.repo.js";
import { AgentUtils, QRCode, PassThrough } from "../agentUtils.js";



const app = express();

const __dirname = path.dirname(fileURLToPath( import.meta.url ));
let sDashPath = __dirname.replace("src", "dash")
app.use(express.static(path.join( __dirname , 'dist')));

const wdgtRoute = Router();

wdgtRoute.get('/init', async (req, res) => { // Get init | Refresh Cache
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.init( req ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

wdgtRoute.get('/', async (req, res) => { // Get Counts
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.count( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.post('/create', async (req, res) => { //  Create new entity
    //const { token, name, caption, content, content_logic, assets, status } = req.body;  //  Usefull syntax
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.create( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.post('/sndbx/create', async (req, res) => { //  Create new sndbx
    //https://m5t-client-portal.onrender.com/v1/wdgt/sndbx/create
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        let oNewSndbx = await WdgtRepo.sndbxCreate( req )
        return res.status( 201 ).json({ "ok": true, "data": oNewSndbx.uri, "qr_uri": oNewSndbx.qr_uri } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.patch('/:id', async (req, res) => { //  edit entity
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.edit( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.get('/count', async (req, res) => { // Get Lists
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.count( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.get('/list', async (req, res) => { // Get Lists
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.list( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.get('/:id', async (req, res) => { // Get one
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json({ "ok": true, "data": await WdgtRepo.retrieveWdgt( req, req.params.id ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.delete('/:id', async (req, res) => { // soft del one
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await WdgtRepo.delete( req, req.params.id ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

//  ouside consumables | Agent
//  https://m5t-client-portal.onrender.com/v1/wdgt/logic/compress_json.js
wdgtRoute.get('/:id/content', async (req, res) => { // Get one (+partial) content JSON
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 201 ).json( await WdgtRepo.retrieveWdgtContent( req, req.params.id ) )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.get('/logic/:id', async (req, res) => { // Get one JS link
    //if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        res.setHeader('content-type', 'text/javascript');
        return res.status( 201 ).send( await WdgtRepo.retrieveWdgtLogic( req, req.params.id ) )
    //}else { return res.status( 403 ).json({ "ok": false }) }
} )

wdgtRoute.get('/qr/:guid', async (req, res, next) => {  //  TODO verify protom on the Get string
        const guid = req.params.guid
        let oDBSndbx = await WdgtRepo.getSandbx( guid )
console.log( " ~~~ ~~~ oDBSndbx.uri | " + oDBSndbx.uri )
        if( oDBSndbx.uri ){
            try{
                const qrStream = new PassThrough();
                const result = await QRCode.toFileStream(qrStream, oDBSndbx.uri + "?" + "wtt55=" + guid,
                            {
                                type: 'png',
                                width: 200,
                                errorCorrectionLevel: 'H'
                            }
                        );
                qrStream.pipe(res);
            } catch(err){
                console.error('Failed to return guid', err);
            }
        }
} )

export { wdgtRoute };