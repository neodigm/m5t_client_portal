import { v4 as uuidv4 } from "uuid";

class AppState {
  id;
  create_time;
  update_time;
  status_time;
  token;
  content;
  status;
  guid;

  constructor() {
    if ( !this.guid ) {
        this.guid = uuidv4();
    }
}
}

class AppMeta {
  id;
  create_time;
  update_time;
  status_time;
  token;
  content;
  account;
  table_name;
  column_name;
  status;
  guid;

  constructor() {
    if ( !this.guid ) {
        this.guid = uuidv4();
    }
}
}

class AppMeter {
  id;
  create_time;
  token;
  content;
  account;
  wdgt;
  status;
  guid;

  constructor() {
    if ( !this.guid ) {
        this.guid = uuidv4();
    }
}
}

export { AppState, AppMeta, AppMeter };
