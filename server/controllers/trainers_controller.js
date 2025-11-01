import trainers_service from "../services/trainers_service.js";

async function get_trainers(req, res) {
    const trainers  = await trainers_service.get_trainers();
    res.status(200).json(trainers);
}

async function add_trainer(req, res) {
    const trainer_data = req.body;
    trainer_data.image = req.file?.filename; // Assuming the image is uploaded as a file
    const new_trainer_id = await trainers_service.add_trainer(trainer_data);
    res.status(201).json({ message: "Trainer added successfully", id: new_trainer_id , image: trainer_data.image });
}

async function update_trainer(req, res) {
    const trainer_id = req.params.id;
    const trainer_data = req.body;
    const image = req.file?.filename; // Assuming the image is uploaded as a file
    await trainers_service.update_trainer(trainer_id, trainer_data,image);
    res.status(200).json({ 
        message: "Trainer updated successfully",
        ...(image && { image })
    });
}

async function delete_trainer(req, res) {
    const trainer_id = req.params.id;
    await trainers_service.delete_trainer(trainer_id);
    res.status(204).send(); // No content to return
}

export default {
    get_trainers,
    add_trainer,
    update_trainer,
    delete_trainer
};
