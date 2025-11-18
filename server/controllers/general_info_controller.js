import general_info_service from "../services/general_info_service.js";

/**
 * Get general website information
 */
async function get_info(req, res) {
  const info = await general_info_service.get_info();
  res.status(200).json(info);
}

/**
 * Update social media links
 */
async function update_business_hour(req, res) {
  const businessHour = req.body;
  const id = req.params.id;
  await general_info_service.update_business_hour(id,businessHour);
  res.status(200).json({ message: "Business hour updated successfully" });
}

/** Create a new business hour
 */
async function create_business_hour(req, res) {
  const businessHour = req.body;
  const id = await general_info_service.create_business_hour(businessHour);
  res.status(201).json({ message: "Business hour created successfully", id });
}

/** Delete a business hour
 */
async function delete_business_hour(req, res) {
  const { id } = req.params;
  await general_info_service.delete_business_hour(id);
  res.status(200).json({ message: "Business hour deleted successfully" });
}

/**
 * Update about summary
 */
async function update_about_summary(req, res) {
  const aboutSummary = req.body.about_summary;
  await general_info_service.update_about_summary(aboutSummary);
  res.status(200).json({ message: "About summary updated successfully" });
}

async function update_about_image(req,res){
  const about_image=req.file.filename;
  await general_info_service.update_about_image(about_image);
  res.status(200).json({ message: "About image updated successfully" , about_image });
}

/** Update hero title
 */
async function update_hero_title(req, res) {
  const heroTitle = req.body.hero_title;
  await general_info_service.update_hero_title(heroTitle);
  res.status(200).json({ message: "Hero title updated successfully" });
}

/** Update hero subtitle
 */
async function update_hero_subtitle(req, res) {
  const heroSubtitle = req.body.hero_subtitle;
  await general_info_service.update_hero_subtitle(heroSubtitle);
  res.status(200).json({ message: "Hero subtitle updated successfully" });
}

/**
 * Update hero image
 */
async function update_hero_image(req, res) {
  const hero_image = req.file?.filename
  await general_info_service.update_hero_image(hero_image);
  res.status(200).json({ message: "Hero image updated successfully", hero_image });
}


export default {
  get_info,
  update_about_summary,
  update_about_image,
  delete_business_hour,
  create_business_hour,
  update_business_hour,
  update_hero_title,
  update_hero_subtitle,
  update_hero_image,
  
};