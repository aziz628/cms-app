import classes_service from "../services/classes_service.js";

// add,update,get_all,delete

async function get_all_classes(req, res) {
    const classes = await classes_service.get_all();

    res.status(200).json(classes);
}

async function add_class(req, res) {
    const classData = req.body;
    classData.image = req.file?.filename;

    // Add the class using the service
    const new_class_id = await classes_service.add_class(classData);

    // Respond with the new class ID
    res.status(201).json({ message: "Class added successfully", id: new_class_id ,image: classData.image });
}

async function update_class(req, res) {
    const classData = req.body;
    const image = req?.file?.filename; // Assuming the image is uploaded as a file
    const classId = req.params.id;

    // Update the class using the service
    await classes_service.update_class(classId, classData,image);
    
    // Respond with success message
    res.status(200).json({
         message: "Class updated successfully",
         ...(image && { image })
    });
}

async function delete_class(req, res) {
    const classId = req.params.id;

    // Delete the class using the service
    await classes_service.delete_class(classId);

    // Respond with success message
    res.status(204).json();
}

export default {
    get_all_classes,
    add_class,
    update_class,
    delete_class
};