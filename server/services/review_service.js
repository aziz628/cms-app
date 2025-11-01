import db from "../DB/db_connection.js"

import {getAll,addWithImage,updateWithImage,deleteWithImage} from "./helper/crud_helper.js"

async function get_reviews() {
  return await getAll(db,"reviews");
}

async function add_review(review) {
  return await addWithImage(db,{
    tableName: "reviews",
    data: review,
    display_name: "Review"
  });
}

async function update_review(review_id, updated_review={}, image=null) {
  return await updateWithImage(db,{
    tableName: "reviews",
    id: review_id,
    data: updated_review,
    image,
    subfolder: "reviews",
    display_name: "Review"
  });
} 

async function delete_review(review_id) {
  return await deleteWithImage(db,{
    tableName: "reviews",
    id: review_id,
    subfolder: "reviews",
    display_name: "Review"
  });
}


export default {
    get_reviews,
    add_review,
    update_review,
    delete_review
}