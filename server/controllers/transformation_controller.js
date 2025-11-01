import transformation_service from "../services/transformation_service.js"

async function get_all(req,res){
    const transformations=await transformation_service.get_all();
    res.status(200).json(transformations)
}

async function add_transformation(req,res){
    const transformation_data = req.body;
    // add images to the transformation data 
    transformation_data.before_image = req.files?.before_image?.[0]?.filename;
    transformation_data.after_image = req.files?.after_image?.[0]?.filename;
    // add the new transformation
    const new_transformation_id = await transformation_service.add_transformation(transformation_data);
    res.status(201).json({
         message: "Transformation added successfully",
          id: new_transformation_id ,
          before_image: transformation_data.before_image,
          after_image: transformation_data.after_image
    });
}
async function update_transformation(req,res){
    const transformation_id = req.params.id;
    const transformation_data = req.body;
    let images = {};

    // check if image files are present
    if (req.files && Object.keys(req.files).length > 0) {
        if (req.files.before_image) images.before_image = req.files.before_image[0].filename;
        if (req.files.after_image) images.after_image = req.files.after_image[0].filename;
    }

    // update the transformation with the provided data and images
    await transformation_service.update_transformation(transformation_id, {...transformation_data, ...images});

    // send response with updated images if they exist
    res.status(200).json({ 
        message: "Transformation updated successfully",
        // checking if images have any image updated then spread the images obeject which gonna add the updated image fields only
        ...(Object.keys(images).length > 0 && images),
    });
}
async function delete_transformation(req,res){
    const transformation_id = req.params.id;
    await transformation_service.delete_transformation(transformation_id);
    res.status(204).send(); // No content to return
}
export default {
    get_all,add_transformation,update_transformation,delete_transformation
}