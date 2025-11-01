import { useState , useEffect} from 'react';
import TrainerService from '../services/trainerService.js'
import FormBuilder from '../components/common/FormBuiler';
import DeleteModal from '../components/common/DeleteModal';
import { createTrainerSchema, updateTrainerSchema } from '../validation/schemas/TrainerSchema';
import { useNotification } from '../context/NotificationContext';
import { useBodyOverflow } from '../utils/tools';

function Trainers() {
    const [Trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);
    const [isModalOpen , setIsModalOpen] = useState(false); // Controls modal visibility (true/false)
    const [editingTrainer, setEditingTrainer] = useState(null); // Stores Trainer being edited (null for new Trainer, object for editing)
    const [deletingTrainerId, setDeletingTrainerId] = useState(null); // ID of Trainer being deleted
    const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls delete confirmation dialog visibility
    const { success ,error} = useNotification();
  
    // fetch Trainers from backend
    async function fetchTrainers() {
        try {
            setLoading(true);
            const response = await TrainerService.getTrainers();
            console.log('Fetched Trainers:', response);
            setTrainers(response);
          } catch (err) {
            error('Failed to load Trainers');
            console.error(err); 
          } finally {
            setLoading(false);
          }
      }
    useEffect( ()=>{
      fetchTrainers();
    }, []);
    
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
  
    // Prevent background scrolling when delete modal is open
    useBodyOverflow(showDeleteModal);
    
    // opens modal for adding/editing Trainer
    const openModal = (TrainerItem=null) => {
      closeModal(); // Close any existing modal
      setEditingTrainer(TrainerItem);    // Set Trainer being edited (or null for new Trainer)
      setIsModalOpen(true);     // Show modal
    };
    
    const closeModal = () => {
      setIsModalOpen(false);    // Hide modal
      setEditingTrainer(null);    // Clear editing data
  };
    const openDeleteModal = (TrainerId) => {
      setDeletingTrainerId(TrainerId);
      setShowDeleteModal(true);
    }
    const closeDeleteModal = () => {
      setDeletingTrainerId(null);
      setShowDeleteModal(false);
    }
    const handleDeleteConfirm = async () => {
      try {
        closeDeleteModal();
        setLoading(true);
        await TrainerService.deleteTrainer(deletingTrainerId);
        success('Trainer deleted successfully');
        fetchTrainers(); // Refresh Trainer list
      } catch (error) {
        error('Failed to delete Trainer');
        console.error(error);
      } finally {
        setLoading(false);
        setDeletingTrainerId(null);
        setShowDeleteModal(false);
      }
    };
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingTrainer) {
        // Update existing Trainer
        await TrainerService.updateTrainer(editingTrainer.id, formData);
      } else {
        // Create new Trainer
        await TrainerService.createTrainer(formData);
      }
      success(`Trainer ${editingTrainer ? 'updated' : 'created'} successfully`);    
    } catch (err) {
      error('Failed to save Trainer');
      console.error(err);
    } finally {
      setLoading(false);
      closeModal();
      fetchTrainers();
    }
  };
  return (
    <div className='space-y-6'>
        <div className="flex flex-col gap-4  md:flex-row md:justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Trainers Management</h2>
            <button 
              onClick={() => openModal(null)} // Open modal for adding new trainer
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Trainer
            </button>
        </div>
        {/* loading spinner */}
        {loading ? (
          <div className="flex  justify-center items-center h-64">
            <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) :(
        // class table container
        <div id='class-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg'>
        {Trainers.length === 0 ? (
           <p className='text-gray-500'>No trainers found.</p>
        ) : (
          <>
          <h2 className='text-xl font-semibold mb-4'>Trainer List</h2>
          <div className=' overflow-x-auto'>
          <table  className='table-auto w-full text-center max-w-[800px] border  rounded-lg divide-y divide-gray-200 '>
              <thead className='bg-[#ebeef2]'>
                <tr>
                    {[{ header: 'Trainer', width: '15%' },
                      { header: 'Image', width: '25%' , minWidth: '112px'},
                      { header: 'Speciality', width: '15%' },
                      { header: 'Certificate', width: '15%' },
                      { header: 'Years of Experience', width: '15%' },
                      { header: 'Actions', width: '15%' }
                    ].map(({ header, width, minWidth }) => (
                          <th key={header} className='px-2 py-3  text-md font-semibold text-gray-800  tracking-wider'
                          style={{width:width, minWidth:minWidth}}
                          >
                            {header}
                          </th>
                        ))}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {Trainers.map(trainer => (
                  <tr key={trainer.id}>
                    <td className='px-2 py-3 text-md font-semibold text-gray-900'>{trainer.name}</td>
                    <td className='px-2 py-3 text-md font-semibold text-gray-900'>
                      <img 
                      src={ `/uploads/trainers/${trainer.image}` } 
                      alt={trainer.name} className='inline size-24 rounded ' />
                    </td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{trainer.speciality}</td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{trainer.certificate}</td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{trainer.years_of_experience}</td>
                    <td className='px-2 py-3 space-y-1 text-sm text-gray-900'>
                      <button 
                        onClick={() => openModal(trainer)} // Open modal for editing this trainer
                        className='bg-success m-[auto] block hover:bg-green-600 text-white px-3 py-1 rounded '
                      >
                        Edit
                        <i className="fa-solid fa-pencil-alt ml-1"></i>
                      </button>
                      <button  onClick={() => openDeleteModal(trainer.id)} className='bg-red-600 m-[auto] flex items-center hover:bg-red-700 text-white px-3 py-1 rounded'>
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
        </div>)
        }
        {isModalOpen && 
        <div id="form" >
        <FormBuilder title={editingTrainer ? 'Edit Trainer' : 'Add Trainer'}
          fields={[
            { name: 'name', label: 'Trainer Name', type: 'text', required: true },
            { name: 'speciality', label: 'Speciality', type: 'text', required: true },
            { name: 'certificate', label: 'Certificate', type: 'text', required: true },
            { name: 'years_of_experience', label: 'Years of Experience', type: 'number', required: true },
            { name: 'image', label: 'Trainer Image', type: 'file', required: true }
          ]}
          initialData={editingTrainer ? (() => {
            const { id: _, ...rest } = editingTrainer;
            return rest;
          })() : {
            name: '',
            speciality: '',
            certificate: '',
            years_of_experience: '',
            image: null
          }}
          validationMode={editingTrainer ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          schema = { editingTrainer ? updateTrainerSchema : createTrainerSchema}
        />
        </div>
        }
        {/* this extra div so space-y don't add margin to y axis of delete modal */}
        {showDeleteModal && 
        <div>
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message="Are you sure you want to delete this trainer?"
              onConfirm={handleDeleteConfirm}
              onCancel={closeDeleteModal}
            />
          </div>
        </div>
        }

    </div>
  );
}

export default Trainers;
