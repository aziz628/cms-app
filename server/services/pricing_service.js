import db from "../DB/db_connection.js";
import {
    record_entity_update,
}from "./dashboard_service.js";
import { run_in_transaction } from "../utils/db_utils.js";import AppError from "../errors/AppError.js";
import { get_total_pages, PAGE_SIZE } from "./helper/pagination_helper.js";
import {PRICING_PLANS,PRICING_FEATURES} from '../DB/db_constants.js';

/**
 * Get all pricing plans
 * @returns {Promise<Object>} All pricing plans
 */
async function get_pricing_plans(page=1) {
    const offset = (page - 1) * PAGE_SIZE;

    // used subquery to materialize a 'features' table made from the pricing_features table and  grouped by plan_id
    // then join it with the 'pricing_plans' table using the plan_id as the common key
    // extracted its features column and added it to the pricing plan object  
    let {data=null} = await db.get(`
        SELECT json_group_array(
            json_object(
                'id', c.${PRICING_PLANS.ID},
                'name', c.${PRICING_PLANS.NAME},
                'price', c.${PRICING_PLANS.PRICE},
                'period', c.${PRICING_PLANS.PERIOD},
                'description', c.${PRICING_PLANS.DESCRIPTION},
                'features', COALESCE(features.features, json('[]')),
                'popular', c.${PRICING_PLANS.POPULAR}
            )
        ) AS data
        FROM (
            SELECT * FROM ${PRICING_PLANS.TABLE_NAME}
            LIMIT ? OFFSET ?
        ) c
        LEFT JOIN (
            SELECT plan_id,
                   json_group_array(
                       json_object(
                           'id', ${PRICING_FEATURES.ID},
                           'feature', ${PRICING_FEATURES.FEATURE}
                       )
                   ) AS features
            FROM ${PRICING_FEATURES.TABLE_NAME}
            GROUP BY ${PRICING_FEATURES.PLAN_ID}
        ) features ON features.plan_id = c.id;
    `, [PAGE_SIZE, offset]);

    // parse pricing plans from JSON string to array
    data = data ? JSON.parse(data) : [];
    
    // parse features from JSON string to array
    data = data.map(pricing_plan => ({
        ...pricing_plan,
        features: pricing_plan.features.length > 0 ? JSON.parse(pricing_plan.features) : []
    }));
    
    // Add pagination info
    const total_pages = await get_total_pages(db, PRICING_PLANS.TABLE_NAME);
    return { data, total_pages, PAGE_SIZE };
}

 /**
 * Add a new pricing plan
 * @param {Object} new_pricing_plan - The pricing plan data to add
 * @returns {Promise<void>}
 */
async function add_pricing_plan(new_pricing_plan) {
    return await run_in_transaction(db, async () => {

        const result = await db.run(`INSERT INTO ${PRICING_PLANS.TABLE_NAME} (${PRICING_PLANS.NAME}, ${PRICING_PLANS.PRICE}, ${PRICING_PLANS.PERIOD}, ${PRICING_PLANS.DESCRIPTION}) VALUES (?, ?, ?, ?)`,
            [new_pricing_plan.name, new_pricing_plan.price, new_pricing_plan.period, new_pricing_plan.description || null]);
       
        await record_entity_update("pricing plan");
        
        return result.lastID;
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

        const result = await db.run(`UPDATE ${PRICING_PLANS.TABLE_NAME} SET ${setClause} WHERE ${PRICING_PLANS.ID} = ?`, values);
        if (result.changes === 0) {
            throw new AppError(`No pricing plan found with ID ${plan_id}`, 404, "PRICING_PLAN_NOT_FOUND");
        }
        await record_entity_update("pricing plan");
    });
}

/**
 * Delete a pricing plan
 * @param {string} plan_id - The ID of the plan to delete
 * @returns {Promise<void>}
 */
async function delete_pricing_plan(plan_id) {
    return await run_in_transaction(db, async () => {

        const result = await db.run(`DELETE FROM ${PRICING_PLANS.TABLE_NAME} WHERE ${PRICING_PLANS.ID} = ?`, [plan_id]);
        if (result.changes === 0) {
            throw new AppError(`No pricing plan found with ID ${plan_id}`, 404, "PRICING_PLAN_NOT_FOUND");
        }

        await record_entity_update("pricing plan");
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
            result = await db.run(`INSERT INTO ${PRICING_FEATURES.TABLE_NAME} (${PRICING_FEATURES.PLAN_ID}, ${PRICING_FEATURES.FEATURE}) VALUES (?, ?)`,
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
/* update a feature in a pricing plan */
async function update_feature(feature_id, feature) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`UPDATE ${PRICING_FEATURES.TABLE_NAME} SET ${PRICING_FEATURES.FEATURE} = ? WHERE ${PRICING_FEATURES.ID} = ?`,
            [feature, feature_id]
        );
        if (result.changes === 0) {
            throw new AppError(`Feature not found for id ${feature_id}`, 404, "FEATURE_NOT_FOUND");
        }

        await record_entity_update("pricing plan features");
    });
}

/* Delete a feature from a pricing plan */
async function delete_feature(feature_id) {
    return await run_in_transaction(db, async () => {
        const result = await db.run(`DELETE FROM ${PRICING_FEATURES.TABLE_NAME} WHERE ${PRICING_FEATURES.ID} = ?`,
            [feature_id]
        );
        if (result.changes === 0) {
            throw new AppError(`Feature not found for id ${feature_id}`, 404, "FEATURE_NOT_FOUND");
        }

        await record_entity_update("pricing plan features");
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
