import db from "../DB/db_connection.js";
import {getAll,addWithImage,updateWithImage,deleteWithImage} from "./helper/crud_helper.js"
import {EVENTS} from '../DB/db_constants.js';
const tableName = EVENTS.TABLE_NAME;

async function get_all_events(page) {
    return await getAll(db, tableName, page);
}

async function create_event(event_data) {
   return await addWithImage(db,
    {
    tableName,
    data: event_data,
    display_name: "Event",
    });
}

async function update_event(event_id, event_data,image=null) {
  await updateWithImage(db,
        {
        tableName,
        id: event_id,
        data: event_data,
        image,
        subfolder: "events",
        display_name: "Event"
        })
}

async function delete_event(event_id) {
    await deleteWithImage(db,
        {
        tableName,
        id: event_id,
        subfolder: "events",
        display_name: "Event"
        });
}

export default {
    get_all_events,
    create_event,
    update_event,
    delete_event
};