import contact_service from "../services/contact_service.js";


async function get_info(req, res) {
    const info = await contact_service.get_info();
    res.status(200).json(info);
}
async function create_social_media_link(req, res) {
    const link_data = req.body;
    const link_id = await contact_service.create_social_media_link(link_data);
    res.status(201).json({ message: "Social media link created successfully", id: link_id });
}
async function update_social_media(req, res) {
    const  data= req.body;
    const link_id = req.params.id;
    await contact_service.update_social_media(data, link_id);

    res.status(200).json({ message: "Social media updated successfully" });
}

async function delete_social_media(req, res) {
    const link_id = req.params.id;
    await contact_service.delete_social_media(link_id);
    res.status(204).send();
}
async function update_address(req, res) {
    const {address} = req.body;
    await contact_service.update_address(address);
    res.status(200).json({ message: "Address updated successfully" });
}
async function update_phone_number(req, res) {
    const {phone_number} = req.body;
    await contact_service.update_phone_number(phone_number);
    res.status(200).json({ message: "Phone number updated successfully" });
}
async function update_email(req, res) {
    const {email} = req.body;
    await contact_service.update_email(email);
    res.status(200).json({ message: "Email updated successfully" });
}
export default {
    get_info,
    create_social_media_link,
    update_social_media,
    delete_social_media,
    update_address,
    update_phone_number,
    update_email
};