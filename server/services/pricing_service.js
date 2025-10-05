import db from "../DB/db_connection.js";
import {
    record_entity_update,
}from "./log_service.js";
import { run_in_transaction } from "../utils/db_utils.js";import AppError from "../errors/AppError.js";

/**
 * Get all pricing plans
 * @returns {Promise<Object>} All pricing plans
 */
async function get_pricing_plans() {
       
    let {data=null} = await db.get(`
        SELECT json_group_array(
            json_object(
                'id', c.id,
                'name', c.name,
                'price', c.price,
                'period', c.period,
                'description', c.description,
                'features', COALESCE(features.features, json('[]'))
            )
        ) AS data
        FROM pricing_plans c
        LEFT JOIN (
            SELECT plan_id,
                   json_group_array(
                       json_object(
                           'id', id,
                           'feature', feature
                       )
                   ) AS features
            FROM pricing_features
            GROUP BY plan_id
        ) features ON features.plan_id = c.id;
    `);
    data = data ? JSON.parse(data) : [];
    data = data.map(pricing_plan => ({
        ...pricing_plan,
        features: pricing_plan.features.length > 0 ? JSON.parse(pricing_plan.features) : []
    }));

        return data;
}

    



/**
 * Add a new pricing plan
 * @param {Object} new_pricing_plan - The pricing plan data to add
 * @returns {Promise<void>}
 */
async function add_pricing_plan(new_pricing_plan) {
    return await run_in_transaction(db, async () => {

        const result = await db.run(`INSERT INTO pricing_plans (name, price, period, description) VALUES (?, ?, ?, ?)`,
            [new_pricing_plan.name, new_pricing_plan.price, new_pricing_plan.period, new_pricing_plan.description || null]);
       
        await record_entity_update("pricing plan");
        
        return result.lastID;
    });
}
/**
 * Add features to a pricing plan
 * @param {number} plan_id - The ID of the plan to add features to
 * @param {Array<string>} feature - The feature to add
 * @returns {Promise<void>}
 */
async function add_feature(plan_id, feature) {
    return await run_in_transaction(db, async () => {
        // add all features to the plan id
        let result;
        try {
            result = await db.run(`INSERT INTO pricing_features (plan_id, feature) VALUES (?, ?)`,
                [plan_id, feature]
            );
        } catch (err) {
            if (err.message.includes("FOREIGN KEY constraint failed")) {
                throw new AppError("Pricing plan not found", 404, "PRICING_PLAN_NOT_FOUND");
            }
            throw err;
        }
        
        await record_entity_update("pricing plan features");
        return result.lastID;
    });
}
async function update_feature(feature_id, feature) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`UPDATE pricing_features SET feature = ? WHERE  id = ?`,
            [feature, feature_id]
        );
        if (result.changes === 0) {
            throw new AppError(`Feature not found for id ${feature_id}`, 404, "FEATURE_NOT_FOUND");
        }

        await record_entity_update("pricing plan features");
    });
}
async function delete_feature(feature_id) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`DELETE FROM pricing_features WHERE id = ?`,
            [feature_id]
        );
        if (result.changes === 0) {
            throw new AppError(`Feature not found for id ${feature_id}`, 404, "FEATURE_NOT_FOUND");
        }

        await record_entity_update("pricing plan features");
    });
}
/**
 * Update an existing pricing plan
 * @param {string} plan_id - The ID of the plan to update
 * @param {Object} updated_plan - The new plan data
 * @returns {Promise<void>}
 */
async function update_pricing_plan(plan_id, updated_plan) {
   await run_in_transaction(db, async () => {

        // build the update query dynamically based on provided fields
        const setClause =  Object.keys(updated_plan).map(field => `${field} = ?`).join(', ');
        let values = Object.values(updated_plan);
        values.push(plan_id); // for the WHERE clause

        const result = await db.run(`UPDATE pricing_plans SET ${setClause} WHERE id = ?`, values);
        if (result.changes === 0) {
            throw new AppError(`No pricing plan found with ID ${plan_id}`, 404, "PRICING_PLAN_NOT_FOUND");
        }
    });
}

/**
 * Delete a pricing plan
 * @param {string} plan_id - The ID of the plan to delete
 * @returns {Promise<void>}
 */
async function delete_pricing_plan(plan_id) {
    return await run_in_transaction(db, async () => {

        const result = await db.run(`DELETE FROM pricing_plans WHERE id = ?`, [plan_id]);
        if (result.changes === 0) {
            throw new AppError(`No pricing plan found with ID ${plan_id}`, 404, "PRICING_PLAN_NOT_FOUND");
        }

        await record_entity_update("pricing plan");
    });
}

export default {
    get_pricing_plans,
    add_pricing_plan,
    add_feature,
    update_feature,
    delete_feature,
    update_pricing_plan,
    delete_pricing_plan
};
