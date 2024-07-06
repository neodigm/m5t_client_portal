import { v4 as uuidv4 } from "uuid";

class Entity {
    id;
    create_at;
    update_at;
    status_at;
    email;
    first;
    last;
    company;
    hash;
    status;

    constructor() {
        if (!this.id) {
            this.id = uuidv4();
        }
    }
}
  
export { Entity };