import { useState , useEffect} from 'react';
import transformationService from "../services/transformationService.js"
import FormBuilder from '../components/common/FormBuiler.jsx';
import {createTransformationSchema,updateTransformationSchema} from "../validation/schemas/transformationSchema.js"
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools.js';
import { useNotification } from '../context/NotificationContext.jsx';

function Transformations() {
  const [Transformations, setTransformations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransformation, setEditingTransformation] = useState(null);
  const [deletingTransformationId, setDeletingTransformationId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { success, error } = useNotification();
  // Fetch transformations from the server
  async function fetchTransformations() {
    try {
      setLoading(true);
      const data = await transformationService.getAllTransformations();
      setTransformations(data);
    } catch (err) {
      error('Failed to fetch transformations');
      console.error("Error fetching transformations:", err);
      setTransformations([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchTransformations();
  }, []);
  // Prevent background scrolling when delete modal is open
  useBodyOverflow(showDeleteModal);
  // Scroll to form when modal opens
  useEffect(() => {
    if (isModalOpen) {
      const formElement = document.getElementById('form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [isModalOpen]);
  // opens modal for adding/editing transformations
  const openModal = (transformation = null) => {
    setEditingTransformation(transformation);
    setIsModalOpen(true);
  }
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransformation(null);
  }
  // opens delete confirmation modal
  const openDeleteModal = (transformationId) => {
    setDeletingTransformationId(transformationId);
    setShowDeleteModal(true);
  }
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingTransformationId(null);
  }
  const handleDeleteConfirm = async () => {
    try {
      closeDeleteModal();
      setLoading(true);
      await transformationService.deleteTransformation(deletingTransformationId);
      success('Transformation deleted successfully');
      fetchTransformations(); // Refresh  list
    } catch (err) {
      error('Failed to delete transformation');
      console.error(err);
    } finally {
      setLoading(false);
      setDeletingTransformationId(null);
      setShowDeleteModal(false);
    }
  };
  // Handle form submission for creating/updating transformations
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingTransformation) {
        await transformationService.updateTransformation(editingTransformation.id, formData);
        success('Transformation updated successfully');
      } else {
        await transformationService.createTransformation(formData);
        success('Transformation created successfully');
      }
      fetchTransformations();
      closeModal();
    } catch (err) {
      console.error("Error submitting form:", err);
      error('Failed to submit form');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='space-y-6'>
       <div className="flex flex-col gap-4  md:flex-row md:justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Transformations Management</h2>
            <button 
              onClick={() => openModal(null)} // Open modal for adding new transformation
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Transformation
            </button>
        </div>
      
      <div id='transformation-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg'>
      <h2 className='text-xl font-semibold  mb-4'>Transformations List</h2>
      {loading 
      ? (
         <div className="flex bg-red justify-center items-center h-64">
            <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
      )
      : (
        <>
          {Transformations.length === 0 
          ?(  
            <p className='text-gray-500'>No Transformations found.</p>
          )
          :(
              <div className=' overflow-x-auto'>
                <table  className=' w-full max-w-[800px] border text-center rounded-lg divide-y divide-gray-200 '>
                  <thead className='bg-[#ebeef2]'>
                    <tr>
                      {[{header:'Name', width:'15%'},
                       {header:'Before image', width:'20%', minWidth: '112px'},
                       {header:'After image', width:'20%', minWidth: '112px'},
                       {header:'Description', width:'30%', minWidth: '150px'},
                       {header:'Actions', width:'15%', minWidth: '100px'}].map(({header,width,minWidth}) => (
                        <th key={header} className='px-2 py-3  text-md font-semibold text-gray-800  tracking-wider'
                        style={{width:width, minWidth:minWidth}}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {Transformations.map(transformation => (
                      <tr key={transformation.id}>
                        <td className='px-2 py-3 text-md font-semibold text-gray-900'>
                          <span className='block whitespace-nowrap font-semibold'>{transformation.name}</span>
                        </td>
                        <td className='py-2'><img 
                          src={ `/uploads/transformations/${transformation.before_image}`} 
                            className='inline size-24 rounded' />
                        </td>
                        <td className='py-2'><img 
                        src={ `/uploads/transformations/${transformation.after_image}`} 
                          className='inline size-24 rounded' />
                        </td>
                        <td className='px-2 py-3 text-sm text-gray-900'>{transformation.description}</td>
                        <td className='px-2 py-3 space-y-1 text-sm text-gray-900'>
                          <button 
                            onClick={() => openModal(transformation)} // Open modal for editing this transformation
                            className='bg-success block hover:bg-green-600 m-[auto] text-white px-3 py-1 rounded w-[fit-content]'
                          >
                            Edit
                            <i className="fa-solid fa-pencil-alt ml-1"></i>
                          </button>
                          <button  onClick={() => openDeleteModal(transformation.id)} className='bg-red-600 m-[auto] flex items-center hover:bg-red-700 text-white px-3 py-1 rounded w-[fit-content]'>
                            <span >Delete</span>
                            <i className="fa-solid fa-trash ml-1"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          )} 
        </>
      )}
      </div>
       {/* Form Modal for adding/editing transformation */}
      {isModalOpen && (
        <div id="form" > {/* Form container for scrolling */}
        <FormBuilder title={editingTransformation ? 'Edit Transformation' : 'Add Transformation'}
          fields={[
            { name: 'name',  type: 'text', required: true },
            { name: 'description',  type: 'textarea', required: true },
            { name: 'before_image', label: 'Before Image', type: 'file',required: true  },
            { name: 'after_image', label: 'After Image', type: 'file', required: true }
          ]}
          initialData={editingTransformation
          ? (() => { // remove id from form intial data
            const { id: _, ...rest } = editingTransformation;
            return rest;
            })() 
          : {
            name: '',
            description: '',
            before_image: null,
            after_image: null
          }}
          validationMode={editingTransformation ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          schema = { editingTransformation ? updateTransformationSchema : createTransformationSchema}
        />
        </div>
      )}
       {showDeleteModal && 
        <div> {/*extra div to avoid the margin of siblings */}
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message="Are you sure you want to delete this transformation ?"
              onConfirm={handleDeleteConfirm}
              onCancel={closeDeleteModal}
            />
          </div>
        </div>
        }
    </div>
  );
}

export default Transformations;
