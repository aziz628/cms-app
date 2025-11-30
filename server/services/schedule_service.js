import db from "../DB/db_connection.js";
import {
    record_entity_update,
}from "./dashboard_service.js";
import { run_in_transaction } from "../utils/db_utils.js";
import App_error from "../errors/AppError.js";
import { timeToMinutes } from "../utils/time_format.js";
const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
import {SCHEDULE,CLASSES} from '../DB/db_constants.js';


async function get_schedule() {
    // get all sessions from the schedule table
        
     let {data=null} = await db.get(`
        SELECT json_object(
            'sessions_by_day' , (
                SELECT json_group_object(
                    day_of_week,
                    sessions
                ) FROM (
                    SELECT 
                        s.${SCHEDULE.DAY_OF_WEEK} ,
                        json_group_array(
                            json_object(
                                'id', s.${SCHEDULE.ID},
                                'start_time', s.${SCHEDULE.START_TIME},
                                'end_time', s.${SCHEDULE.END_TIME},
                                'class_id', s.${SCHEDULE.CLASS_ID},
                                'day_of_week', s.${SCHEDULE.DAY_OF_WEEK}
                            )
                        ) as sessions
                    FROM schedule s
                    GROUP BY s.${SCHEDULE.DAY_OF_WEEK}
                )
            ) ,
            'classes', (
                SELECT json_group_array(
                    json_object(
                        'id', c.${CLASSES.ID},
                        'name', c.${CLASSES.NAME}
                    )
                )
                FROM ${CLASSES.TABLE_NAME} c
            )
        ) as data
         `)
         
        // parse data if it exists, if not then return empty schedule structure
        data = data ? JSON.parse(data) : {
            classes: [],
            sessions_by_day: {},
        };
        // parse the sessions from JSON strings to array of objects
        Object.entries(data.sessions_by_day)?.forEach(([day, sessions]) => {
            data.sessions_by_day[day] = JSON.parse(sessions);
        });
        // Order days of the week 
        const ordered_sessions_by_day = {};

        dayOrder.forEach(day => {
            if (data.sessions_by_day[day]) {
                ordered_sessions_by_day[day] = data.sessions_by_day[day];
            }
        });

        data.sessions_by_day = ordered_sessions_by_day;

        // order by start_time and duration, complexity O(n log n)
        for (const day in data.sessions_by_day) {
            data.sessions_by_day[day].sort((a, b) => {
                const startA = timeToMinutes(a.start_time);
                const startB = timeToMinutes(b.start_time);
                
                // Compare by start_time first
                if (startA !== startB) {
                    return startA - startB;
                }

                // If start_time is the same, compare by duration
                const durationA = timeToMinutes(a.end_time) - startA;
                const durationB = timeToMinutes(b.end_time) - startB;
                
                return durationB -durationA ; // shorter duration first
            });
        }

        return data;
}



/**
 * Adds a new session to the schedule.
 * @param {Object} new_session - The session data to add.
 * @return {Promise<number>} The ID of the newly added session.
 */
async function add_session(new_session) {
    return await run_in_transaction(db, async () => {
        // Validate the new session time
        validate_new_session_time(new_session);
        let result;
        try {
            result = await db.run(`INSERT INTO ${SCHEDULE.TABLE_NAME} (${SCHEDULE.DAY_OF_WEEK}, ${SCHEDULE.START_TIME}, ${SCHEDULE.END_TIME}, ${SCHEDULE.CLASS_ID}) VALUES (?, ?, ?, ?)`,
            [new_session.day_of_week, new_session.start_time, new_session.end_time, new_session.class_id]);
        } catch (err) {
            if (err.message.includes("FOREIGN KEY constraint failed")) {
                throw new App_error("Class not found", 404, "CLASS_NOT_FOUND");
            }
            throw err;
        }

        await record_entity_update("schedule session");
        return result.lastID;
    });
}

/**
 * Updates an existing session in the schedule.
 * @param {string} session_id - The ID of the session to update.
 * @param {Object} new_session - The new session data.
 * @returns {Promise<void>}
 */
async function update_session(session_id, updated_session) {
    return await run_in_transaction(db, async () => {
        // Check if the session exists before updating
        const existingSession = await db.get(`SELECT * FROM ${SCHEDULE.TABLE_NAME} WHERE ${SCHEDULE.ID} = ?`, [session_id]);
        if (!existingSession) {
            throw new App_error("Session not found", 404, "SESSION_NOT_FOUND");
        }
        // Validate the new session time
        validate_new_session_time(updated_session, existingSession);

        // build the update query dynamically based on provided fields
        let fields = Object.keys(updated_session);
        let values = Object.values(updated_session);

        // check if class_id in updated_session
        if (updated_session.class_id !== undefined) {
            // check if class_id exists in classes table
            const classExists = await db.get(`SELECT ${CLASSES.ID} FROM ${CLASSES.TABLE_NAME} WHERE ${CLASSES.ID} = ?`, [updated_session.class_id]);
            if (!classExists) {
                throw new App_error("Class not found", 404, "CLASS_NOT_FOUND");
            }
        }
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(session_id); // for the WHERE clause
        const query = `UPDATE ${SCHEDULE.TABLE_NAME} SET ${setClause} WHERE ${SCHEDULE.ID} = ?`;

        const result = await db.run(query, values);

        if (result.changes === 0) {
            throw new App_error("No changes made to the session", 400, "NO_CHANGES");
        }
        await record_entity_update("schedule session");
    });
}

async function delete_session(session_id) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`DELETE FROM ${SCHEDULE.TABLE_NAME} WHERE ${SCHEDULE.ID} = ?`, [session_id]);

        if (result.changes === 0) {
            throw new App_error("Session not found", 404, "SESSION_NOT_FOUND");
        }
        await record_entity_update("schedule session");
    });
}

// Validate the new session time
function validate_new_session_time(new_session, old_session=null) {
    // split into hours and minutes
    // the one missing get it from the old session
    let start_time = new_session.start_time || (old_session?.start_time);
    let end_time = new_session.end_time || (old_session?.end_time);
    // Convert times to minutes for faster comparison
    const start_minutes = timeToMinutes(start_time);
    const end_minutes = timeToMinutes(end_time);

    // Simple numeric comparison - much faster than string parsing
    if (start_minutes >= end_minutes) {
        throw new App_error("Start time must be before end time", 400, "INVALID_SESSION_TIMES");
    }   
}

export default {
    get_schedule,
    add_session,
    update_session,
    delete_session
};