import review_service  from "../services/review_service.js"

/**
 * Get all reviews
 */
async function get_reviews(req, res) {
    const page = req.query.page || 1;
    const reviews = await review_service.get_reviews(page);
    res.status(200).json(reviews);
}

/** Add a new review
 */
async function add_review(req, res) {
    const new_review = req.body
    new_review.image = req.file?.filename
    const new_review_id = await review_service.add_review(new_review)
    res.status(201).json({ message:"Review added successfully",id: new_review_id, image: new_review.image })
}

/** Update an existing review
 */
async function update_review(req, res) {
    const review_id = req.params?.id
    const updated_review = req.body
    const image = req.file?.filename
    await review_service.update_review(review_id, updated_review, image)
    res.status(200).json({
         message: "Review updated successfully" ,
         ...(image && { image }) 
    });
}
/** Delete a review
 */
async function delete_review(req, res) {
    const review_id = req.params?.id
    await review_service.delete_review(review_id)
    res.status(200).json({ message: "Review deleted successfully" })
}

export default {
    get_reviews,
    add_review,
    update_review,
    delete_review
}