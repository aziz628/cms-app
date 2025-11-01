import { useState , useEffect} from 'react';
import reviewService from "../services/reviewService"
import FormBuilder from '../components/common/FormBuiler.jsx';
import {createReviewSchema,updateReviewSchema} from "../validation/schemas/reviewSchema.js"
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools.js';
import { useNotification } from '../context/NotificationContext.jsx';
function Reviews() {
  const [reviews, setReviews] =useState([])
  const [loading, setLoading] = useState(false);
  const [isModalOpen,setIsModalOpen]=useState(false)
  const [editingReview,setEditingReview]=useState(null)
  const [deletingReviewId,setDeletingReviewId]=useState(null)
  const [showDeleteModal,setShowDeleteModal]=useState(false)
  const { success ,error} = useNotification();

  // Fetch reviews from the server
  async function fetchReviews(){
    try{
      setLoading(true)
      const response = await reviewService.getReviews();
      console.log('Fetched reviews:', response);
      setReviews(response);
    }catch(err){
      error('Failed to load reviews');
      console.error(err); 
    }finally{
      setLoading(false)
    }
  }
  useEffect(()=>{
    fetchReviews()
  },[])

  // Prevent background scrolling when delete modal is open
  useBodyOverflow(showDeleteModal);

  // Scroll to form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      // Scroll to the form when modal opens
      const formElement = document.getElementById('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isModalOpen] );

  
  // opens modal for adding/editing reviews
  const openModal = (review=null) => {
    setEditingReview(review);    // Set review being edited (or null for new reviws)
    setIsModalOpen(true);     // Show modal
  };
  
  const closeModal = () => {
    setIsModalOpen(false);    // Hide modal
    setEditingReview(null);    // Clear editing data
};
  const openDeleteModal = (reviewId) => {
    setDeletingReviewId(reviewId);
    setShowDeleteModal(true);
  }
  const closeDeleteModal = () => {
    setDeletingReviewId(null);
    setShowDeleteModal(false);
  }
  const handleDeleteConfirm = async () => {
    try {
      closeDeleteModal();
      setLoading(true);
      await reviewService.deleteReview(deletingReviewId);
      success('Review deleted successfully');
      fetchReviews(); // Refresh review list
    } catch (error) {
      error('Failed to delete review');
      console.error(error);
    } finally {
      setLoading(false);
      setDeletingReviewId(null);
      setShowDeleteModal(false);
    }
  };
  // Handle form submission for creating or updating a review
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingReview) {
        // Update existing review
        await reviewService.updateReview(editingReview.id, formData);
      } else {
        // Create new review
        await reviewService.createReview(formData);
      }
      success(`Review ${editingReview ? 'updated' : 'created'} successfully`);
    } catch (err) {
      error('Failed to save review');
      console.error(err);
    } finally {
      setLoading(false);
      closeModal();
      fetchReviews();
    }
};

  return (
    <div className='space-y-6'>    {/* Main container , leave space between elements */}
    {/* Title and Add New Review button */}
    <div className="flex flex-col gap-4  md:flex-row md:justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Reviews Management</h2>
            <button 
              onClick={() => openModal(null)} // Open modal for adding new review
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Review
            </button>
      </div>
      {/* loading spinner */}
        {loading 
        ? (
          <div className="flex bg-red justify-center items-center h-64">
            <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
            <div id='review-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg'>
              {reviews.length === 0 
                ? (
                  <p className='text-gray-500'>No reviews found.</p>
                  ) 
                : (
                  <>
                    <h2 className='text-xl font-semibold mb-4'>Reviews List</h2>
                    <div className=' overflow-x-auto'>
                      <table  className='table-auto text-center w-full max-w-[800px] border  rounded-lg divide-y divide-gray-200 '>
                        <thead className='bg-[#ebeef2]'>
                           <tr>
                              {[{ header: 'Author', width: '15%' },
                                { header: 'Image', width: '25%', minWidth: '112px' },
                                { header: 'Content', width: '30%' },
                                { header: 'Identity', width: '15%' },
                                { header: 'Actions', width: '15%' }
                              ].map(({ header, width, minWidth }) => (
                                    <th key={header} className='px-2 py-3  text-md font-semibold text-gray-800  tracking-wider'
                                    style={{width:width,minWidth:minWidth}}
                                    >
                                      {header}
                                    </th>
                                  ))}
                          </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                          {reviews?.map(reviewItem => (
                            <tr key={reviewItem.id}>
                              <td className='px-2 py-3 text-md font-semibold text-gray-900'> {reviewItem.author}</td>
                              <td className='px-2 py-3 text-md font-semibold text-gray-900'>
                                <img 
                                src={ `/uploads/reviews/${reviewItem.image}`} 
                                 className='inline size-24 rounded' />
                              </td>
                              <td className='px-2 py-3 text-sm text-gray-900'>{reviewItem.content}</td>
                              <td className='px-2 py-3 text-sm text-gray-900'>{reviewItem.identity || 'none'}</td>
                              <td className='px-2 py-3 space-y-1 text-sm text-gray-900'>
                                <button 
                                  onClick={() => openModal(reviewItem)} // Open modal for editing this review
                                  className='bg-success block m-[auto] hover:bg-green-600 text-white px-3 py-1 rounded '
                                >
                                  Edit
                                  <i className="fa-solid fa-pencil-alt ml-1"></i>
                                </button>
                                <button  onClick={() => openDeleteModal(reviewItem.id)} className='bg-red-600 m-[auto] flex items-center hover:bg-red-700 text-white px-3 py-1 rounded'>
                                  <span >Delete</span>
                                  <i className="fa-solid fa-trash ml-1"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                  )
              }
            </div>
        )
        }
      {/* Form Modal for adding/editing review */}
      {isModalOpen && (
        <div id="form" > {/* Form container for scrolling */}
        <FormBuilder title={editingReview ? 'Edit Review' : 'Add Review'}
          fields={[
            { name: 'author', label: 'Author', type: 'text', required: true },
            { name: 'content', label: 'Content', type: 'textarea', required: true },
            { name: 'identity', label: 'Identity', type: 'select', options: [{value:'member'}, {value:'guest'}, {value:"",label:"none"}] },
            { name: 'image', label: 'Review Image', type: 'file', required: true }
          ]}
          initialData={editingReview 
          ? (() => { // remove id from form intial data
            const { id: _, ...rest } = editingReview;
            return rest;
            })() 
          : {
            author: '',
            content: '',
            identity: '',
            image: null
          }}
          validationMode={editingReview ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          schema = { editingReview ? updateReviewSchema : createReviewSchema}
        />
        </div>
      )}
      {showDeleteModal && 
        <div> {/*extra div to avoid the margin of siblings */}
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message="Are you sure you want to delete this review?"
              onConfirm={handleDeleteConfirm}
              onCancel={closeDeleteModal}
            />
          </div>
        </div>
        }
    </div>

  );
}

export default Reviews;
