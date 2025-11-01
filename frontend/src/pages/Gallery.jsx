import {useState,useEffect} from 'react';
import FormBuilder from '../components/common/FormBuiler';
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools';
import { useNotification } from '../context/NotificationContext';
import galleryService from '../services/galleryService.js';
import {
    createCategorySchema,
    updateCategorySchema,
    createImageSchema,
    updateImageSchema
} from '../validation/schemas/gallerySchema.js';

function Gallery() {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingImage, setEditingImage]= useState(null)
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [showDeleteImageModal , setShowDeleteImageModal] = useState(false)
  const { success, error } = useNotification();

  // Fetch gallery items from the server
  async function fetchGalleryItems() {
    try {
      setLoading(true);
      const response = await galleryService.getGalleryItems();
      setCategories(response.categories);
      setImages(response.images);
    } catch (err) {
      console.error("Error fetching gallery items:", err);
      error("Failed to fetch gallery items");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchGalleryItems();
  }, []);
  // Prevent background scrolling when delete modal is open
  useBodyOverflow(showDeleteCategoryModal || showDeleteImageModal);
  // Scroll to form when modal opens
  useEffect(() => {
    if (isCategoryModalOpen || isImageModalOpen) {
      const formElement = document.getElementById("form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [isCategoryModalOpen, isImageModalOpen]);
  // opens modal for adding/editing categories or images

  const openCategoryModal = (item = null) => {
    setEditingCategory(item);
    setIsCategoryModalOpen(true);
  };
  const openImageModal = (item = null) => {
    setEditingImage(item);
    setIsImageModalOpen(true);
  }
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
  };
  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setEditingImage(null);
  };
  const openCategoryDeleteModal = (id) =>{
    setDeletingItemId(id);
    setShowDeleteCategoryModal(true);
  }
  const closeCategoryDeleteModal = () => {
    setShowDeleteCategoryModal(false);
    setDeletingItemId(null);
  };
  const openDeleteImageModal = (id) => {
    setDeletingItemId(id);
    setShowDeleteImageModal(true);
  }
  const closeDeleteImageModal = () => {
    setShowDeleteImageModal(false);
    setDeletingItemId(null);
  };
  async function handleImageSubmit(data) {
    try {
       let category_id = '';
        
        // For FormData objects, we need to get the value first
        if (data instanceof FormData) {
          if(!editingImage){
            category_id = data.get('category_id');
            data.delete('category_id'); // Remove it from FormData
          }
        }
      // log the data form by pairs
      console.log("Submitting image data:", [...data.entries()]);

      if (editingImage) {
        await galleryService.updateImage(editingImage.id,data,editingImage.category_id);
        success("Image updated successfully");
      } else {
        // pass category_id to createImage but it shouldn't be part of form data
        await galleryService.createImage(data,category_id);
        success("Image created successfully");
      }
    } catch (err) {
      console.error("Error saving image:", err);
      error("Failed to save image");
    } finally {
      closeImageModal();
      fetchGalleryItems();
    }
  }
  async function handleCategorySubmit(data) {
    try {
      if (editingCategory) {
        await galleryService.updateCategory(editingCategory.id, data);
        success("Category updated successfully");
      } else {        
        await galleryService.createCategory(data);
        success("Category created successfully");
      }
    } catch (err) {
      console.error("Error saving category:", err);
      error("Failed to save category");
    } finally {
      closeCategoryModal();
      fetchGalleryItems();
    }
  }
  async function handleImageDelete(id,category_id) {
    try {
      await galleryService.deleteImage(id,category_id);
      success("Image deleted successfully");
    } catch (err) {
      console.error("Error deleting image:", err);
      error("Failed to delete image");
    } finally {
      setShowDeleteImageModal(false);
      fetchGalleryItems();
    } 
  }
  async function handleCategoryDelete(id) {
    try {
      await galleryService.deleteCategory(id);
      success("Category deleted successfully");
    } catch (err) {
      console.error("Error deleting category:", err);
      error("Failed to delete category");
    } finally {
      setShowDeleteCategoryModal(false);
      fetchGalleryItems();
    }
  }
  return (
    <div className='space-y-4'>
      <div className='flex flex-col md:flex-row gap-4 md:justify-between items-center '>
        
          <h2 className="text-2xl font-bold mb-4">Gallery</h2>
          <div className='flex flex-col md:flex-row gap-2'>
            <button type='button'
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              onClick={()=>setIsCategoryModalOpen(true)}
            ><i className="fa-solid fa-plus mr-2"></i>
            Add category</button>
            <button type='button'
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
              onClick={()=>{categories.length > 0 ?setIsImageModalOpen(true): error('Please add a category first')}} // only open if there is at least one category
            ><i className="fa-solid fa-plus mr-2"></i>
            Add image</button> 
          </div>
      </div>
      <div id='categories-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg space-y-4'>
        <h2 className='text-xl font-semibold'>category list</h2>
        <div>
          {loading 
            ? (
              <div className="flex bg-red justify-center items-center h-64">
                  <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )
            : (
              <>
              {categories.length == 0 
              ? (
                <p className='text-gray-500'>No Categories found</p>
              ):
              <div className=' overflow-x-auto'>
                <table  className='  border text-center rounded-lg divide-y divide-gray-200 '>
                  <thead className='bg-[#ebeef2]'>
                    <tr>
                      {['Name','Actions'].map(header => (
                        <th key={header} className='px-2 py-3  text-md font-semibold text-gray-800  tracking-wider'
                        style={{width:header==='Name'?'80%':'20%'}}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {categories?.map(category => (
                      <tr key={category.id}>
                        <td className='px-2 py-3 text-sm text-gray-900'>{category.name}</td>
                        <td className='px-2 py-3 flex flex-col items-center space-y-1 text-sm text-gray-900'>
                          <button 
                            onClick={() => openCategoryModal(category)} // Open modal for editing this category
                            className='bg-success hover:bg-green-600 text-white px-3 py-1 rounded w-[fit-content]'
                          >
                            Edit
                            <i className="fa-solid fa-pencil-alt ml-1"></i>
                          </button>
                          <button  onClick={() => openCategoryDeleteModal(category.id)} className='bg-red-600 flex items-center hover:bg-red-700 text-white px-3 py-1 rounded w-[fit-content]'>
                            <span >Delete</span>
                            <i className="fa-solid fa-trash ml-1"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              }
            </>
            )
          } 
        </div>
      </div>
       <div id='images-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg space-y-4'>
        <h2 className='text-xl font-semibold'>Images List</h2>
        <div>
          {loading 
            ? (
              <div className="flex bg-red justify-center items-center h-64">
                  <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )
            : (
              <>
              {images.length == 0 
              ? (
                <p className='text-gray-500'>No Images found</p>
              ):
              <div className=' overflow-x-auto'>
                <table  className='  border text-center rounded-lg divide-y divide-gray-200 '>
                  <thead className='bg-[#ebeef2]'>
                    <tr>
                      {[{header:'Name', width:'15%'},
                       {header:'image', width:'25%', minWidth:'112px'},
                        {header:'Category', width:'15%'},
                        {header:'Description', width:'30%'}, 
                        {header:'Actions', width:'15%'}].map(({header,width,minWidth}) => (
                        <th key={header} className='px-2 py-3  text-md font-semibold text-gray-800  tracking-wider'
                        style={{width:width, minWidth:minWidth}}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {images?.map(image => (
                      <tr key={image.id}>
                        <td className='px-2 py-3 text-md font-semibold text-gray-900'>{image.name}</td>
                        <td className='py-2 px-2'>
                          <img 
                          src={ `/uploads/gallery/${image.filename}`} 
                            className='inline size-24 rounded ' />
                        </td>                 
                        <td className='px-2 py-3 text-sm text-gray-900'>{image.category_name || 'Uncategorized'}</td>
                        <td className='px-2 py-3 text-sm text-gray-900'>{image.description}</td>
                        <td className='px-2 py-3 space-y-1 text-sm text-gray-900'>
                          <button 
                            onClick={() => openImageModal(image)} // Open modal for editing this category
                            className='bg-success block m-[auto] hover:bg-green-600 text-white px-3 py-1 rounded w-[fit-content]'
                          >
                            Edit
                            <i className="fa-solid fa-pencil-alt ml-1"></i>
                          </button>
                          <button  onClick={() => openDeleteImageModal(image.id)} className='bg-red-600 m-[auto] flex items-center hover:bg-red-700 text-white px-3 py-1 rounded w-[fit-content]'>
                            <span >Delete</span>
                            <i className="fa-solid fa-trash ml-1"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              }
            </>
            )
          } 
        </div>
      </div>
      {isCategoryModalOpen && (
        <div id="form" > {/* Form container for scrolling */}
        <FormBuilder
        title={editingCategory ? "Edit Category" : "Add Category"}
          schema={editingCategory ? updateCategorySchema : createCategorySchema}
          isOpen={isCategoryModalOpen}
          initialData={{ name: editingCategory?.name || '' }}
          validationMode={editingCategory ? 'edit' : 'create'}
          fields={[{ name: 'name', type: 'text', required: true }]}
          onClose={closeCategoryModal}
          onSubmit={handleCategorySubmit}
          useFormData={false}
        />
        </div>
      )}
      {isImageModalOpen && (
        <div id="form" > {/* Form container for scrolling */}
        <FormBuilder
          title={editingImage ? "Edit Image" : "Add Image"}
          fields={[
            {name:'name', type:"text", required: true },
            {name : 'description' , type:'textarea', required: true},
            {name: 'image', label: 'Image File', type: 'file', required: true },
            !editingImage && {  // don't show when editing
              name: 'category_id',
              type: 'select',
              label: 'Category',
              required: true,
              options: categories.map(cat => ({
                label: cat.name,
                value: cat.id
              }))
            },
          ].filter(Boolean)}
          initialData={editingImage
            ? (() => { // remove id and categoryname from form intial data
            let { id: _,category_name:__,category_id:___, ...rest } = editingImage;
            rest.image = rest?.filename;
            delete rest.filename;
            return rest;
            })() 
          : {
            name: '',
            description:'',
            category_id: categories.length > 0 ? categories[0].id : '',
            image: null
          }
          }
          validationMode={editingImage ? 'edit' : 'create'}
          onSubmit={handleImageSubmit}
          schema={editingImage ? updateImageSchema : createImageSchema}
          onClose={ closeImageModal }
        />
        </div>
      )}
      {showDeleteCategoryModal && 
      <div> {/*extra div to avoid the margin of siblings */}
        <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <DeleteModal
            message="Are you sure you want to delete this category ?"
            onConfirm={() => handleCategoryDelete(deletingItemId)}
            onCancel={closeCategoryDeleteModal}
          />
        </div>
      </div>
      }
      {showDeleteImageModal && 
      <div> {/*extra div to avoid the margin of siblings */}
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message="Are you sure you want to delete this image ?"
              // find the image with id = deletingItemId then get its category_id
              onConfirm={() => handleImageDelete(deletingItemId,images.find(image=>image.id==deletingItemId)?.category_id)}
              onCancel={closeDeleteImageModal}
            />
          </div>
      </div>
      }
    </div>
  );
}

export default Gallery;
