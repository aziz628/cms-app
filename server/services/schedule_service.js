import db from "../DB/db_connection.js";
import {
    record_entity_update,
}from "./log_service.js";
import { run_in_transaction } from "../utils/db_utils.js";
import App_error from "../errors/AppError.js";

async function get_schedule() {
    // get all sessions from the schedule table
        
     let {data=null} = await db.get(`
        SELECT json_object(
            'sessionsByDay' , (
                SELECT json_group_object(
                    day_of_week,
                    sessions
                ) FROM (
                    SELECT 
                        s.day_of_week,
                        json_group_array(
                            json_object(
                                'id', s.id,
                                'start_time', s.start_time,
                                'end_time', s.end_time,
                                'class_id', s.class_id,
                                'day_of_week', s.day_of_week
                            )
                        ) as sessions
                    FROM schedule s
                    GROUP BY s.day_of_week
                )
            ) ,
            'classes', (
                SELECT json_group_array(
                    json_object(
                        'id', c.id,
                        'name', c.name
                    )
                )
                FROM classes c
            )
        ) as data
         `)
        // parse data if it exists, if not then return empty schedule structure
        data = data ? JSON.parse(data) : {
            classes: [],
            sessionsByDay: {},
           //  time_slots: [] added later if needed
        };
        // parse the sessions from JSON strings to array of objects
        Object.entries(data.sessionsByDay)?.forEach(([day, sessions]) => {
            data.sessionsByDay[day] = JSON.parse(sessions);
        });
        // Order days of the week
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const orderedSessionsByDay = {};
        
        dayOrder.forEach(day => {
            if (data.sessionsByDay[day]) {
                orderedSessionsByDay[day] = data.sessionsByDay[day];
            }
        });
        
        data.sessionsByDay = orderedSessionsByDay;
        
        // order by start_time and duration (end_time - start_time)
        for (const day in data.sessionsByDay) {
            data.sessionsByDay[day].sort((a, b) => {
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

const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
        };

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
            result = await db.run(`INSERT INTO schedule (day_of_week, start_time, end_time, class_id) VALUES (?, ?, ?, ?)`,
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
        const existingSession = await db.get(`SELECT * FROM schedule WHERE id = ?`, [session_id]);
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
            const classExists = await db.get(`SELECT id FROM classes WHERE id = ?`, [updated_session.class_id]);
            if (!classExists) {
                throw new App_error("Class not found", 404, "CLASS_NOT_FOUND");
            }
        }
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(session_id); // for the WHERE clause
        const query = `UPDATE schedule SET ${setClause} WHERE id = ?`;

        const result = await db.run(query, values);

        if (result.changes === 0) {
            throw new App_error("No changes made to the session", 400, "NO_CHANGES");
        }
        await record_entity_update("schedule session");
    });
}

async function delete_session(session_id) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`DELETE FROM schedule WHERE id = ?`, [session_id]);

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