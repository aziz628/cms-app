import { useState , useEffect} from 'react';
import classService from '../services/classService'
import FormBuilder from '../components/common/FormBuiler';
import DeleteModal from '../components/common/DeleteModal';
import { createClassSchema, updateClassSchema } from '../validation/schemas/classSchema';
import { useNotification } from '../context/NotificationContext';
import { useBodyOverflow } from '../utils/tools';
import { useScrollToForm } from '../utils/tools';

function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen , setIsModalOpen] = useState(false); // Controls modal visibility (true/false)
  const [editingClass, setEditingClass] = useState(null); // Stores class being edited (null for new class, object for editing)
  const [deletingClassId, setDeletingClassId] = useState(null); // ID of class being deleted
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls delete confirmation dialog visibility
  const {success , error} = useNotification();

  // fetch classes from backend
  async function fetchClasses() {
      try {
          setLoading(true);
          const response = await classService.getClasses();
          console.log('Fetched classes:', response);
          setClasses(response);
        } catch (err) {
          error('Failed to load classes');
          console.error(err); 
        } finally {
          setLoading(false);
        }
    }
  useEffect( ()=>{
    fetchClasses();
  }, []);

  useScrollToForm(isModalOpen);

  // Prevent background scrolling when delete modal is open
  useBodyOverflow(showDeleteModal);
  
  // opens modal for adding/editing class
  const openModal = (classItem=null) => {
    setEditingClass(classItem);    // Set class being edited (or null for new class)
    setIsModalOpen(true);     // Show modal
  };
  
  const closeModal = () => {
    setIsModalOpen(false);    // Hide modal
    setEditingClass(null);    // Clear editing data
};
  const openDeleteModal = (classId) => {
    setDeletingClassId(classId);
    setShowDeleteModal(true);
  }
  const closeDeleteModal = () => {
    setDeletingClassId(null);
    setShowDeleteModal(false);
  }
  const handleDeleteConfirm = async () => {
    try {

      // Call delete API
      await classService.deleteClass(deletingClassId);
      
      closeDeleteModal(); // Close modal after deletion
      success('Class deleted successfully');
      fetchClasses(); // Refresh class list
    } catch (error) {
      error('Failed to delete class');
      console.error(error);
    } finally {
      setDeletingClassId(null);
      setShowDeleteModal(false);
    }
  };
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingClass) {
        // Update existing class
        await classService.updateClass(editingClass.id, formData);
      } else {
        // Create new class
        await classService.createClass(formData);
      }
      success(`Class ${editingClass ? 'updated' : 'created'} successfully`);  
      fetchClasses();  
    } catch (err) {
      error('Failed to save class');
      console.error(err);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <div className='space-y-6'>
        <div className="flex flex-col gap-4  md:flex-row md:justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Classes Management</h2>
            <button 
              onClick={() => openModal(null)} // Open modal for adding new class
              className="btn-primary"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Class
            </button>
        </div>
        {/* loading spinner */}
        {loading ? (
          <div className="flex bg-red justify-center items-center h-64">
            <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) :
        // class table container
        <div id='class-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg'>
        {classes.length === 0 ? (
           <p className='text-gray-500'>No classes found.</p>
        ) : (
          <>
          <h2 className='text-xl font-semibold mb-4'>Class List</h2>
          <div className=' overflow-x-auto'>
            <table  className=' text-center w-full max-w-[800px] border  rounded-lg divide-y  divide-gray-200 '>
              <thead className='bg-[#ebeef2]'>
                <tr>
                  {[{ header: 'Class', width: '15%' },
                    { header: 'Image', width: '25%', minWidth: '112px' },
                    { header: 'Description', width: '30%' },
                    { header: 'Private Coaching', width: '15%' },
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
                {classes?.map(classItem => (
                  <tr key={classItem.id}>
                    <td className='px-2 py-3 text-md font-semibold text-gray-900'>
                      {classItem.name}
                    </td>
                    <td className='px-2 py-3 text-md font-semibold text-gray-900'>
                      <img 
                      src={ `/uploads/classes/${classItem.image}` } 
                      alt={classItem.name} className='inline  size-24 rounded ' />
                    </td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{classItem.description}</td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{classItem.private_coaching ? 'Yes' : 'No'}</td>
                    <td className='px-2 py-3 space-y-1 text-sm text-gray-900'>
                      <button 
                        onClick={() => openModal(classItem)} // Open modal for editing this class
                        className='bg-success m-[auto] block hover:bg-hoverSuccess text-btnText px-3 py-1 rounded '
                      >
                        Edit
                        <i className="fa-solid fa-pencil-alt ml-1"></i>
                      </button>
                      <button  onClick={() => openDeleteModal(classItem.id)} className='bg-danger m-[auto] flex items-center hover:bg-hoverDanger text-btnText px-3 py-1 rounded'>
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
        ) }

        </div>
        }
        {isModalOpen && 
        <div id="form" >
        <FormBuilder title={editingClass ? 'Edit Class' : 'Add Class'}
          fields={[
            { name: 'name', label: 'Class Name', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'private_coaching', label: 'Private Coaching', type: 'checkbox' },
            { name: 'image', label: 'Class Image', type: 'file', required: true }
          ]}
          initialData={editingClass ? (() => {
            const { id: _, ...rest } = editingClass;
            return rest;
          })() : {
            name: '',
            description: '',
            private_coaching: false,
            image: null
          }}
          validationMode={editingClass ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          schema = { editingClass ? updateClassSchema : createClassSchema}
        />
        </div>
        }
        {/* this extra div so space-y don't add margin to y axis of delete modal */}
        {showDeleteModal && 
        <div>
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message="Are you sure you want to delete this class?"
              onConfirm={handleDeleteConfirm}
              onCancel={closeDeleteModal}
            />
          </div>
        </div>
        }
    </div>
  );
}


export default Classes;
