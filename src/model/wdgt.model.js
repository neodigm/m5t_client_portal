import { v4 as uuidv4 } from "uuid";

class wdgtEntity {
    constructor() {
        if ( !this.guid ) {
            this.guid = uuidv4();
        }
    }
    id;
    create_time;
    update_time;
    status_time;
    token;
    name;
    marquee;
    caption;
    content;
    content_logic;
    assets;
    keywords;
    class;
    status;
    guid;
}

class wdgtSandbox {
    constructor() {
        if ( !this.guid ) {
            this.guid = uuidv4();
        }
    }
    id;
    create_time;
    update_time;
    status_time;
    acctEntity;
    wdgtEntity;
    token;
    content;
    class;
    status;
    guid;
}
  
export { wdgtEntity, wdgtSandbox };