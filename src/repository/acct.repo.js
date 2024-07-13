import express from "express";
import pg from 'pg';

import { Entity } from "../model/entity.model.js";
import { AgentUtils } from "../agentUtils.js";
import { v4 as uuidv4 } from "uuid";

import path from 'path'; import { fileURLToPath } from 'url';

const oExpress = express();

const OSTATE = {"base": "https://a55-wtt-api-v1.onrender.com/", "schm": process.env.A55_SCHM, "pstg": "postgres://affwttuser:me3dxL7JszkYv9EBSTO5RYUeKAhEbOdW@dpg-cp0miuq1hbls73ed59c0-a/affwttdatb"}

class AcctRepo {
    static aEntity = [];
    static bIsInit = false;
    constructor() {
    }
  // init
  static async QQQQinit() {
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()

    try {
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."AcctRepo";`
        let dbClient = await client.query( sSQL )
        if( dbClient?.rows.length ){
            dbClient.rows.forEach( ( r )=>{
                let oEntity = new Entity
                oEntity = Object.assign( oEntity, r )
                AcctRepo.aEntity.push( oEntity )
            })
        }
        console.log( " ~~~ init | " , AcctRepo.aEntity ) // db
    } catch (err) {
        console.error(err);
    } finally {
        await client.end()
        AcctRepo.bIsInit = true;
    }
  }

  // retrieve 1
  static async retrieveAcctEntity( oReq, sGuid ) {
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntity" WHERE guid = '` + sGuid + `' AND "status" != 'DELETED';`
    let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
    if( dbClient.rows[0]?.guid ){
      return  [ { "acctEntity": dbClient.rows[0] } ]
    }else{ return false; }
  }

  static async createAcctEntity( oReq ){  //  Create new acctEntity
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    oReq.body[ "guid" ] = AgentUtils.genHash( uuidv4() )

    let sSQL = `INSERT INTO "` + OSTATE.schm + `"."acctEntity" ("create_by", "modified_by", "parent", "email", "first", "last", "company", "uri_schedule", "uri_primary", "uri_file_view", "uri_file_download", "uri_file_password", "service_advertising", "service_seo", "service_content", "service_social", "service_creative", "service_website", "service_custom", "partnership_score", "resetHash", "hash", "class", "guid", "invoices", "services", "ad_budget", "support_tickets_uri") VALUES `
    sSQL += `(`;
    ["create_by", "modified_by", "parent", "email", "first", "last", "company", "uri_schedule", "uri_primary", "uri_file_view", "uri_file_download", "uri_file_password", "service_advertising", "service_seo", "service_content", "service_social", "service_creative", "service_website", "service_custom", "partnership_score", "resetHash", "hash", "class", "guid", "invoices", "services", "ad_budget", "support_tickets_uri"].forEach( ( sCol )=>{
        sSQL += `'` + oReq.body[ sCol ] + `',`;  // TODO SQL cleanes
    } )
    sSQL = sSQL.slice(0, -1)  //  Remove last comma
    sSQL += `)`;
    let dbClient = await client.query( sSQL )
    await this.meter( 0,0, oReq.appIp ,"create_acctEntity","New acctEntity", `{"guid":"` + oReq.body.guid + `"}`, "NEW", oReq.appLoc )
    await client.end()  //  End Client Connection
  }

  static async resetHash( oReq ){  //  Update Hash
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    let sSQL = `UPDATE "` + OSTATE.schm + `"."acctEntity" SET("status_time", "resetHash", "hash") = ( NOW(), 'false', '` + oReq.body.hash + `') WHERE guid = '` + oReq.body.guid + `';`

    let dbClient = await client.query( sSQL )
    await this.meter( 0,0, oReq.appIp ,"resetPassword","New Password", `{"guid":"` + oReq.body.guid + `"}`, "NEW", oReq.appLoc )
    await client.end()  //  End Client Connection
  }

  static async acctEntitySnapshot( req ){  //  Get Entity relationship snapshot compressed
    let LZString = AgentUtils.getLZW()
    const client = new pg.Client( OSTATE.pstg )  //  TODO meter
    await client.connect()
    let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntitySnapshot";`
    let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
    if( dbClient.rows[0]?.guid ){
      return LZString.compressToEncodedURIComponent( JSON.stringify( dbClient.rows ) )
    }else{ return false; }
  }

  // soft delete 1
  static async delete( oReq, sGuid ) {  //  Soft Delete - Update Ent class and status timestamp
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    let sSQL = `UPDATE "` + OSTATE.schm + `"."acctEntity" SET("status_time", "status") = ( NOW(), 'DELETED') WHERE guid = '` + sGuid + `';`
    let dbClient = await client.query( sSQL )
    await this.meter( 0,0, oReq.appIp ,"del_acctEntity","Del acctEntity", `{"guid":"` + sGuid + `"}`, "NEW", oReq.appLoc )
    await client.end()  //  End Client Connection
    return [ { "acctEntity": sGuid } ]
  }

  static async SessionAcctEntity( req, sGuid ){  //  Get 1 or more related entities given guid
    let oEnt = {}, oParent = {}, oGrandparent = {}
    const client = new pg.Client( OSTATE.pstg )  //  TODO meter
    await client.connect()
    let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntity" WHERE guid = '` + sGuid + `' AND "status" != 'DELETED';`
console.log("----- --- -- -- -- sSQL | " + sSQL)
    let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
    if( dbClient.rows[0]?.id ){
      oEnt = Object.assign( {}, dbClient.rows[0] )
      if( oEnt.parent ){
        const client = new pg.Client( OSTATE.pstg )
        await client.connect()
        let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntity" WHERE guid = '` + oEnt.parent + `' AND "status" != 'DELETED';`
        let dbClient = await client.query( sSQL )
        await client.end()  //  End Client Connection        
        oParent = Object.assign( {}, dbClient.rows[0] )
        if( oParent.parent ){
          const client = new pg.Client( OSTATE.pstg )
          await client.connect()
          let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntity" WHERE guid = '` + oParent.parent + `' AND "status" != 'DELETED';`
          let dbClient = await client.query( sSQL )
          await client.end()  //  End Client Connection        
          oGrandparent = Object.assign( {}, dbClient.rows[0] )
        }
      }
      return { "entity": oEnt, "parent": oParent, "grandparent": oGrandparent };
      }else{ return false; }
  }

  static async readEntitiesByRole( req ){  //  Get Entities given role and guid
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctEntity" WHERE status != 'DELETED' ORDER BY company, last;`
      let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
      if( dbClient.rows[0]?.id && req.headers['role'] ){
      dbClient.rows = dbClient.rows.filter( (oR)=>{
        const oRoles = {"sys_admin_role":"0","admin_role":"1", "staff_role":"2", "client_admin_role":"3", "client_standard_role":"4"}
        let sRole = req.headers['role']
        let sCompany = req.headers['company']
            if( oRoles[ sRole ] <= oRoles[ oR.class ]){
              if( sRole == "client_admin_role" ){  //  Limit client_admin_role view by same company
                return ( oR.company.toUpperCase() == sCompany.toUpperCase() )
              }else{
                return true;
              }
          }else{
            return false;
          }
      } )
      return dbClient.rows;
      }else{
        return "empty recordset";
      }
  }
  
  static async editAcctEntity( oReq ) {  // edit PATCH
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    //  TODO need logic to refresh status date if STATUS has changed
    let sSQL = `UPDATE "` + OSTATE.schm + `"."acctEntity" SET("create_by", "modified_by", "parent", "email", "first", "last", "company", "uri_schedule", "uri_primary", "uri_file_view", "uri_file_download", "uri_file_password", "service_advertising", "service_seo", "service_content", "service_social", "service_creative", "service_website", "service_custom", "partnership_score", "resetHash", "class", "guid", "invoices", "services", "ad_budget", "support_tickets_uri") = `
    sSQL += `(`;
    //sSQL += ` NOW(),`;
    ["create_by", "modified_by", "parent", "email", "first", "last", "company", "uri_schedule", "uri_primary", "uri_file_view", "uri_file_download", "uri_file_password", "service_advertising", "service_seo", "service_content", "service_social", "service_creative", "service_website", "service_custom", "partnership_score", "resetHash", "class", "guid", "invoices", "services", "ad_budget", "support_tickets_uri"].forEach( ( sCol )=>{
        sSQL += `'` + oReq.body[ sCol ] + `',`;
    } )
    sSQL = sSQL.slice(0, -1)  //  Remove last comma
    sSQL += `) WHERE guid = '` + oReq.body[ "guid" ] + `'`;
    let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
    await this.meter( 0,0, oReq.appIp ,"edit _acctEntity","Edit acctEntity", `{"guid":"` + oReq.body.guid + `"}`, "NEW", oReq.appLoc )
  }

  static async SessionIntake( req, sGuid ){  //  Get 1 intake report given a parent guid
    const client = new pg.Client( OSTATE.pstg )  //  TODO meter
    await client.connect()
    let sSQL = `SELECT * FROM "` + OSTATE.schm + `"."acctIntake" WHERE parent = '` + sGuid + `' AND "status" != 'DELETED';`
    let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
    if( dbClient.rows[0]?.id ){
      return { "acctIntake": dbClient.rows[0] };
    }else{ return false; }
  }

  static async createAcctIntake( oReq ){  //  Create new acctIntake
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    oReq.body[ "guid" ] = AgentUtils.genHash( uuidv4() )

     let sSQL = `INSERT INTO "` + OSTATE.schm + `"."acctIntake" ( "create_by", "modified_by", "parent", "company", "cmstoggle", "cmsurl", "cmstype", "cmsuserid", "cmspw", "hosttoggle", "hosturl", "hosttype", "hostuserid", "hostpw", "ftptoggle", "ftpurl", "ftptype", "ftpuserid", "ftppw", "domaintoggle", "domainurl", "domaintype", "domainuserid", "domainpw", "g_analyticstoggle", "g_analyticsurl", "g_analyticstype", "g_analyticsuserid", "g_analyticspw", "g_tagmantoggle", "g_tagmanurl", "g_tagmantype", "g_tagmanuserid", "g_tagmanpw", "g_business_profiletoggle", "g_business_profileurl", "g_business_profiletype", "g_business_profileuserid", "g_business_profilepw", "g_adstoggle", "g_adsurl", "g_adstype", "g_adsuserid", "g_adspw", "g_local_servicetoggle", "g_local_serviceurl", "g_local_servicetype", "g_local_serviceuserid", "g_local_servicepw", "g_search_consoletoggle", "g_search_consoleurl", "g_search_consoletype", "g_search_consoleuserid", "g_search_consolepw", "fb_business_pagetoggle", "fb_business_pageurl", "fb_business_pagetype", "fb_business_pageuserid", "fb_business_pagepw", "fb_insta_adstoggle", "fb_insta_adsurl", "fb_insta_adstype", "fb_insta_adsuserid", "fb_insta_adspw", "linkedin_business_toggle", "linkedin_business_pageurl", "linkedin_business_pagetype", "linkedin_business_pageuserid", "linkedin_business_pagepw", "bing_adstoggle", "bing_adsurl", "bing_adstype", "bing_adsuserid", "bing_adspw", "reddit_adstoggle", "reddit_adsurl", "reddit_adstype", "reddit_adsuserid", "reddit_adspw", "shopify_toggle", "shopify_url", "shopify_type", "shopify_userid", "shopify_pw" ) VALUES `
    sSQL += `(`;
     [ "create_by", "modified_by", "parent", "company", "cmstoggle", "cmsurl", "cmstype", "cmsuserid", "cmspw", "hosttoggle", "hosturl", "hosttype", "hostuserid", "hostpw", "ftptoggle", "ftpurl", "ftptype", "ftpuserid", "ftppw", "domaintoggle", "domainurl", "domaintype", "domainuserid", "domainpw", "g_analyticstoggle", "g_analyticsurl", "g_analyticstype", "g_analyticsuserid", "g_analyticspw", "g_tagmantoggle", "g_tagmanurl", "g_tagmantype", "g_tagmanuserid", "g_tagmanpw", "g_business_profiletoggle", "g_business_profileurl", "g_business_profiletype", "g_business_profileuserid", "g_business_profilepw", "g_adstoggle", "g_adsurl", "g_adstype", "g_adsuserid", "g_adspw", "g_local_servicetoggle", "g_local_serviceurl", "g_local_servicetype", "g_local_serviceuserid", "g_local_servicepw", "g_search_consoletoggle", "g_search_consoleurl", "g_search_consoletype", "g_search_consoleuserid", "g_search_consolepw", "fb_business_pagetoggle", "fb_business_pageurl", "fb_business_pagetype", "fb_business_pageuserid", "fb_business_pagepw", "fb_insta_adstoggle", "fb_insta_adsurl", "fb_insta_adstype", "fb_insta_adsuserid", "fb_insta_adspw", "linkedin_business_toggle", "linkedin_business_pageurl", "linkedin_business_pagetype", "linkedin_business_pageuserid", "linkedin_business_pagepw", "bing_adstoggle", "bing_adsurl", "bing_adstype", "bing_adsuserid", "bing_adspw", "reddit_adstoggle", "reddit_adsurl", "reddit_adstype", "reddit_adsuserid", "reddit_adspw", "shopify_toggle", "shopify_url", "shopify_type", "shopify_userid", "shopify_pw" ].forEach( ( sCol )=>{
        sSQL += `'` + oReq.body[ sCol ] + `',`;  // TODO SQL cleanes
    } )
    sSQL = sSQL.slice(0, -1)  //  Remove last comma
    sSQL += `)`;
    let dbClient = await client.query( sSQL )
    await this.meter( 0,0, oReq.appIp ,"create_acctIntake","New acctIntake", `{"parent":"` + oReq.body.parent + `"}`, "NEW", oReq.appLoc )
    await client.end()  //  End Client Connection
  }

  static async editAcctIntake( oReq ) {  // edit PATCH
    const client = new pg.Client( OSTATE.pstg )
    await client.connect()
    //  TODO need logic to refresh status date if STATUS has changed
     let sSQL = `UPDATE "` + OSTATE.schm + `"."acctIntake" SET( "create_by", "modified_by", "parent", "company", "cmstoggle", "cmsurl", "cmstype", "cmsuserid", "cmspw", "hosttoggle", "hosturl", "hosttype", "hostuserid", "hostpw", "ftptoggle", "ftpurl", "ftptype", "ftpuserid", "ftppw", "domaintoggle", "domainurl", "domaintype", "domainuserid", "domainpw", "g_analyticstoggle", "g_analyticsurl", "g_analyticstype", "g_analyticsuserid", "g_analyticspw", "g_tagmantoggle", "g_tagmanurl", "g_tagmantype", "g_tagmanuserid", "g_tagmanpw", "g_business_profiletoggle", "g_business_profileurl", "g_business_profiletype", "g_business_profileuserid", "g_business_profilepw", "g_adstoggle", "g_adsurl", "g_adstype", "g_adsuserid", "g_adspw", "g_local_servicetoggle", "g_local_serviceurl", "g_local_servicetype", "g_local_serviceuserid", "g_local_servicepw", "g_search_consoletoggle", "g_search_consoleurl", "g_search_consoletype", "g_search_consoleuserid", "g_search_consolepw", "fb_business_pagetoggle", "fb_business_pageurl", "fb_business_pagetype", "fb_business_pageuserid", "fb_business_pagepw", "fb_insta_adstoggle", "fb_insta_adsurl", "fb_insta_adstype", "fb_insta_adsuserid", "fb_insta_adspw", "linkedin_business_toggle", "linkedin_business_pageurl", "linkedin_business_pagetype", "linkedin_business_pageuserid", "linkedin_business_pagepw", "bing_adstoggle", "bing_adsurl", "bing_adstype", "bing_adsuserid", "bing_adspw", "reddit_adstoggle", "reddit_adsurl", "reddit_adstype", "reddit_adsuserid", "reddit_adspw", "shopify_toggle", "shopify_url", "shopify_type", "shopify_userid", "shopify_pw" ) = `
    sSQL += `(`;
     [ "create_by", "modified_by", "parent", "company", "cmstoggle", "cmsurl", "cmstype", "cmsuserid", "cmspw", "hosttoggle", "hosturl", "hosttype", "hostuserid", "hostpw", "ftptoggle", "ftpurl", "ftptype", "ftpuserid", "ftppw", "domaintoggle", "domainurl", "domaintype", "domainuserid", "domainpw", "g_analyticstoggle", "g_analyticsurl", "g_analyticstype", "g_analyticsuserid", "g_analyticspw", "g_tagmantoggle", "g_tagmanurl", "g_tagmantype", "g_tagmanuserid", "g_tagmanpw", "g_business_profiletoggle", "g_business_profileurl", "g_business_profiletype", "g_business_profileuserid", "g_business_profilepw", "g_adstoggle", "g_adsurl", "g_adstype", "g_adsuserid", "g_adspw", "g_local_servicetoggle", "g_local_serviceurl", "g_local_servicetype", "g_local_serviceuserid", "g_local_servicepw", "g_search_consoletoggle", "g_search_consoleurl", "g_search_consoletype", "g_search_consoleuserid", "g_search_consolepw", "fb_business_pagetoggle", "fb_business_pageurl", "fb_business_pagetype", "fb_business_pageuserid", "fb_business_pagepw", "fb_insta_adstoggle", "fb_insta_adsurl", "fb_insta_adstype", "fb_insta_adsuserid", "fb_insta_adspw", "linkedin_business_toggle", "linkedin_business_pageurl", "linkedin_business_pagetype", "linkedin_business_pageuserid", "linkedin_business_pagepw", "bing_adstoggle", "bing_adsurl", "bing_adstype", "bing_adsuserid", "bing_adspw", "reddit_adstoggle", "reddit_adsurl", "reddit_adstype", "reddit_adsuserid", "reddit_adspw", "shopify_toggle", "shopify_url", "shopify_type", "shopify_userid", "shopify_pw" ].forEach( ( sCol )=>{
        sSQL += `'` + oReq.body[ sCol ] + `',`;
    } )
    sSQL = sSQL.slice(0, -1)  //  Remove last comma
    sSQL += `) WHERE parent = '` + oReq.body[ "parent" ] + `'`;
    let dbClient = await client.query( sSQL )
    await client.end()  //  End Client Connection
    await this.meter( 0,0, oReq.appIp ,"edit _acctIntake","Edit acctIntake", `{"guid":"` + oReq.body.guid + `"}`, "NEW", oReq.appLoc )
  }
  
  // meter
  static async meter( nAcctId=0, nWdgtId=0, sIP="000.000.000.000", sToken="event", sCaption="MyCaption", jContent='{"msg":""}', sStatus="NEW", sURI="https://" ){
      const client = new pg.Client( OSTATE.pstg )
      await client.connect()
      let sSQL = `INSERT INTO "` + OSTATE.schm + `"."appMeter" ( "acctEntity", "wdgtEntity", "ip", "uri","token", "caption", "content", "status" ) VALUES ('` + nAcctId + `', '` + nWdgtId + `', '` + sIP + `', '` + sURI + `', '` + sToken + `', '` + sCaption + `', '` + jContent + `', '` + sStatus + `' );`
      let dbClient = await client.query( sSQL )
      await client.end()  //  End Client Connection
      return dbClient?.Result?.rowCount;
  }
}

export { AcctRepo };