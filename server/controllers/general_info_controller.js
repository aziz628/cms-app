import general_info_service from "../services/general_info_service.js";

/**
 * Get general website information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function get_info(req, res) {
  const info = await general_info_service.get_info();
  res.status(200).json(info);
}

/**
 * Update social media links
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function update_business_hour(req, res) {
  const businessHour = req.body;
  const id = req.params.id;
  await general_info_service.update_business_hour(id,businessHour);
  res.status(200).json({ message: "Business hour updated successfully" });
}


async function create_business_hour(req, res) {
  const businessHour = req.body;
  const id = await general_info_service.create_business_hour(businessHour);
  res.status(201).json({ message: "Business hour created successfully", id });
}


async function delete_business_hour(req, res) {
  const { id } = req.params;
  await general_info_service.delete_business_hour(id);
  res.status(200).json({ message: "Business hour deleted successfully" });
}

/**
 * Update address
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function update_about_summary(req, res) {
  const aboutSummary = req.body.about_summary;
  await general_info_service.update_about_summary(aboutSummary);
  res.status(200).json({ message: "About summary updated successfully" });
}

export default {
  get_info,
  update_about_summary,
  delete_business_hour,
  create_business_hour,
  update_business_hour 
};