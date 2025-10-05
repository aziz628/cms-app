import event_service from "../services/events_service.js";

/**
 * Fetch all events from the service
 */
async function get_all_events(req, res) {
    const events = await event_service.get_all_events();

    res.status(200).json(events);
}

/**
 * Create a new event
 */
async function create_event(req, res) {
    const event_data = req.body;
    event_data.image = req.file?.filename;

    const new_event_id = await event_service.create_event(event_data);

    res.status(201).json({ message:"Event created successfully",id: new_event_id,image: event_data.image });
    }


/**
 * Update an existing event
 */
async function update_event(req, res) {
    const event_id = req.params.id;
    const event_data = req.body;
    const image = req?.file?.filename;

    await event_service.update_event(event_id, event_data, image);

    res.status(200).json({
        message: "Event updated successfully" ,
        ...(image && { image }) 
    });
}

/**
 * Delete an event
 */
async function delete_event(req, res) {
    const event_id = req.params.id;

    await event_service.delete_event(event_id);

    res.status(204).send();

}

export default {
    get_all_events,
    create_event,
    update_event,
    delete_event
};