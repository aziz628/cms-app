import pricing_service from "../services/pricing_service.js";

// all controller functions
async function get_pricing_plans(req, res) {
    const pricing_plans  = await pricing_service.get_pricing_plans();
    res.status(200).json(pricing_plans);
}

async function add_pricing_plan(req, res) {
    const plan_data = req.body;
    const new_plan_id = await pricing_service.add_pricing_plan(plan_data);
    res.status(201).json({ message: "Pricing plan added successfully", id: new_plan_id });
}
async function add_feature(req, res) {
    const plan_id = req.params.id;
    const feature = req.body.feature;

    const new_feature_id = await pricing_service.add_feature(plan_id, feature);
    res.status(201).json({ message: "Feature added successfully", id: new_feature_id });
}
async function update_feature(req, res) {
    const feature_id = req.params.id;
    const feature = req.body.feature;

    await pricing_service.update_feature(feature_id, feature);
    res.status(200).json({ message: "Feature updated successfully" });
}
async function delete_feature(req, res) {
    const feature_id = req.params.id;

    await pricing_service.delete_feature(feature_id);
    res.status(204).send();
}

async function update_pricing_plan(req, res) {
    const plan_id = req.params.id;
    const plan_data = req.body;

    await pricing_service.update_pricing_plan(plan_id, plan_data);
    res.status(200).json({ message: "Pricing plan updated successfully" });
}

async function delete_pricing_plan(req, res) {
    const plan_id = req.params.id;
    await pricing_service.delete_pricing_plan(plan_id);
    res.status(204).send();
}

export default {
    get_pricing_plans,
    add_feature,
    update_feature,
    delete_feature,
    add_pricing_plan,
    update_pricing_plan,
    delete_pricing_plan
};
