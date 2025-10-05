import schedule_service from "../services/schedule_service.js";

async function get_schedule(req, res) {
    const schedule = await schedule_service.get_schedule();
    res.status(200).json(schedule);
}

async function add_session(req, res) {
    const sessionData = req.body;
    const new_session_id = await schedule_service.add_session(sessionData);
    res.status(201).json({ message: "Session added successfully", id: new_session_id });
}

async function update_session(req, res) {
    const sessionData = req.body;
    const sessionId = req.params.id;
    await schedule_service.update_session(sessionId, sessionData);
    res.status(200).json({ message: "Session updated successfully" });
}

async function delete_session(req, res) {
    const sessionId = req.params.id;
    await schedule_service.delete_session(sessionId);
    res.status(204).json();
}

export default {
    get_schedule,
    add_session,
    update_session,
    delete_session
};