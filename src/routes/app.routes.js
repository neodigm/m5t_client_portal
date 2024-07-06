import express from "express";
import Router from "express";
import { v4 as uuidv4 } from "uuid";

import QRCode from 'qrcode';
import { PassThrough } from 'stream';

import jwt from "jsonwebtoken";


import path from 'path'; import { fileURLToPath } from 'url';

import { default as fetch, Headers } from 'node-fetch';

import { AppRepo } from "../repository/app.repo.js";
import { AgentUtils } from "../agentUtils.js";

const app = express();

const __dirname = path.dirname(fileURLToPath( import.meta.url ));
let sDashPath = __dirname.replace("src", "dash")
app.use(express.static(path.join( __dirname ,'dist')));

const appRoute = Router();

appRoute.post('/signin', async (req, res) => { //  Signin
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        const email = { "email": req.body.email }
        const oEntity = await AppRepo.signin( req )
        if( email && oEntity ){
            const accessToken = jwt.sign( email, AgentUtils.ACCESS_TOKEN_SECRET, { expiresIn: AgentUtils.TOKEN_TIMEOUT } )
            return res.status( 201 ).json( { "ok": true, "accessToken": accessToken, "entity": oEntity } )
        }else { return res.status( 401 ).json({ "ok": false, "msg": "invalid user" }) }
    }else { return res.status( 403 ).json({ "ok": false, "msg": "invalid request" }) }
} )

appRoute.get('/SessionAppMeta/', AgentUtils.doTokenAuth, async (req, res) => { // Get Meta for local session
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - appLoc
        return res.status( 200 ).json({ "ok": true, "data": await AppRepo.SessionAppMeta( req ) } )
    }else { return res.status( 403 ).json({ "ok": false }) }
} )

appRoute.get('/init', async (req, res) => { // Get init | Refresh Cache
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        return res.status( 201 ).json({ "ok": true, "data": await AppRepo.init( req ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

appRoute.get('/', async (req, res) => { // Get Root
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        return res.status( 201 ).json({ "ok": true, "data": await AppRepo.count( req ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

appRoute.get('/count', async (req, res) => { // Get Counts
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        return res.status( 201 ).json({ "ok": true, "data": await AppRepo.count( req ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

appRoute.get('/list', async (req, res) => { // Get Lists
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        return res.status( 201 ).json({ "ok": true, "data": await AppRepo.list( req ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

appRoute.get('/meter', async (req, res) => { // Get Meter
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        return res.status( 201 ).json({ "ok": true, "data": await AppRepo.meter( req ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

appRoute.get('/tailmeter', async (req, res) => { // Tail Meter
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        return res.status( 201 ).json({ "ok": true, "data": await AppRepo.tailmeter( req, 1000 ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

appRoute.get('/dash', async (req, res) => { // Get dash ux
    req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
    req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
    return res.sendFile( AppRepo.dash( "client_portal.html" ) );
})

appRoute.get('/lgo', async (req, res) => { // Get dash ux
    req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
    req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
    return res.sendFile( AppRepo.lgo( "intd_ID_lgo_glance_256.png" ) );
})
appRoute.get('/img/:imagename', async (req, res) => { // Generic Img endpoint
    req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
    req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
    return res.sendFile( AppRepo.img( req.params.imagename ) );
})

appRoute.get('/qr/:uri', async (req, res, next) => {  //  TODO verify protom on the Get string
    const sUri = decodeURIComponent( req.params.uri )
    if( sUri ){
        try{
            const qrStream = new PassThrough();
            const result = await QRCode.toFileStream(qrStream, sUri,{ type: 'png', width: 200, errorCorrectionLevel: 'H'} );
            qrStream.pipe(res);
        } catch(err){ console.error('Failed to return guid', err); }
    }
} )

appRoute.get('/guid/:count', async (req, res) => { // Get one or more guids
    if( AgentUtils.evalRequest( req ) ){
        req.appIp = AgentUtils.getIP( req )  //  DTO app vars - IP
        req.appLoc = AgentUtils.getLoc( req )  //  DTO app vars - Loc
        let aGuid = []
        for( let nCnt = 0; nCnt <= req.params.count; nCnt++){
            aGuid.push( uuidv4() )
        }
        return res.status( 201 ).json({ "ok": true, "data": JSON.stringify( aGuid ) })
    }else { return res.status( 403 ).json({ "ok": false }) }
})

export { appRoute };