import { useState , useEffect} from 'react';
import EventService from '../services/EventService.js'
import FormBuilder from '../components/common/FormBuiler';
import DeleteModal from '../components/common/DeleteModal';
import { createEventSchema, updateEventSchema } from '../validation/schemas/eventSchema.js';
import { useNotification } from '../context/NotificationContext';
import { useBodyOverflow } from '../utils/tools';

function Events() {
  const [Events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  const [isModalOpen , setIsModalOpen] = useState(false); // Controls modal visibility (true/false)
  const [editingEvent, setEditingEvent] = useState(null); // Stores Trainer being edited (null for new Trainer, object for editing)
  const [deletingEventId, setDeletingEventId] = useState(null); // ID of Trainer being deleted
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls delete confirmation dialog visibility
  const { success ,error} = useNotification();
  
    // fetch Events from backend
    async function fetchEvents() {
        try {
            setLoading(true);
            const response = await EventService.getEvents();
            console.log('Fetched Events:', response);
            setEvents(response);
          } catch (err) {
            error('Failed to load Events');
            console.error(err); 
          } finally {
            setLoading(false);
          }
      }
    useEffect( ()=>{
      fetchEvents();
    }, []);
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
    
    // opens modal for adding/editing Event
    const openModal = (Event=null) => {
      closeModal(); // Close any existing modal
      setEditingEvent(Event);    // Set Event being edited (or null for new Event)
      setIsModalOpen(true);     // Show modal
    };
    
    const closeModal = () => {
      setIsModalOpen(false);    // Hide modal
      setEditingEvent(null);    // Clear editing data
  };
    const openDeleteModal = (EventId) => {
      setDeletingEventId(EventId);
      setShowDeleteModal(true);
    }
    const closeDeleteModal = () => {
      setDeletingEventId(null);
      setShowDeleteModal(false);
    }
    const handleDeleteConfirm = async () => {
      try {
        closeDeleteModal();
        setLoading(true);
        await EventService.deleteEvent(deletingEventId);
        success('Event deleted successfully');
        fetchEvents(); // Refresh Event list
      } catch (error) {
        error('Failed to delete Event');
        console.error(error);
      } finally {
        setLoading(false);
        setDeletingEventId(null);
        setShowDeleteModal(false);
      }
    };
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingEvent) {
        // Update existing Event
        await EventService.updateEvent(editingEvent.id, formData);
      } else {
        // Create new Event
        await EventService.createEvent(formData);
      }
      success(`Event ${editingEvent ? 'updated' : 'created'} successfully`);    
    } catch (err) {
      error('Failed to save Event');
      console.error(err);
    } finally {
      setLoading(false);
      closeModal();
      fetchEvents();
    }
  };
  return (
    <div className='space-y-6'>
      {// title and button
      }
      <div className="flex flex-col gap-4  md:flex-row md:justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Events Management</h2>
            <button 
              onClick={() => openModal(null)} // Open modal for adding new Event
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Event
            </button>
        </div>
      {
      loading 
      ? (
        <div className="flex  justify-center items-center h-64">
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      )
      :<div id='events-table'  className='bg-white max-w-[800px] p-4 shadow-md rounded-lg'>
        {Events.length === 0 ? (
           <p className='text-gray-500'>No events found.</p>
        ) : (
          <>
          <h2 className='text-xl font-semibold mb-4'>Event List</h2>
          <div className=' overflow-x-auto'>
            <table  className='table-auto w-full text-center max-w-[800px] border  rounded-lg divide-y divide-gray-200 '>
              <thead className='bg-[#ebeef2]'>
                <tr>
                  {[{ header: 'Event', width: '15%' },
                    { header: 'Image', width: '25%', minWidth: '112px' },
                    { header: 'Description', width: '20%' },
                    { header: 'Date', width: '20%' },
                    { header: 'Location', width: '10%' },
                    { header: 'Actions', width: '10%' }
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
                {Events?.map(EventItem => (
                  <tr key={EventItem.id}>
                    <td className='px-2 py-3 text-md font-semibold text-gray-900'> {EventItem.title}</td>
                    <td className='  px-2 py-3 text-md font-semibold text-gray-900'>
                      <img 
                      src={ `/uploads/Events/${EventItem.image}` } 
                      alt={EventItem.title} className='inline size-24 rounded ' />
                    </td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{EventItem.description}</td>
                    <td className='px-2 py-3 text-sm text-gray-900'>
                      {new Date(EventItem.date).toLocaleString(undefined, 
                      {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                    </td>
                    <td className='px-2 py-3 text-sm text-gray-900'>{EventItem.location}</td>
                    <td className='px-2 py-3 space-y-1 text-sm text-gray-900'>
                      <button 
                        onClick={() => openModal(EventItem)} // Open modal for editing this Event
                        className='bg-success hover:bg-green-600 block m-[auto] text-white px-3 py-1 rounded '
                      >
                        Edit
                        <i className="fa-solid fa-pencil-alt ml-1"></i>
                      </button>
                      <button  onClick={() => openDeleteModal(EventItem.id)} className='bg-red-600 m-[auto] flex items-center hover:bg-red-700 text-white px-3 py-1 rounded'>
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
        <FormBuilder title={editingEvent ? 'Edit Event' : 'Add Event'}
        // values : title, description, date, location, image 
          fields={[
            { name: 'title', label: 'Event Title', type: 'text', required: true },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'date', label: 'Event Date & Time', type: 'datetime-local', required: true },
            { name: 'location', label: 'Location', type: 'text', required: true },
            { name: 'image', label: 'Event Image', type: 'file', required: true }
          ]}
          initialData={editingEvent ? (() => {
            const { id: _, ...rest } = editingEvent;
            if (rest.date) {
              const eventDate = new Date(rest.date);
              rest.date = eventDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
            }
            return rest;
          })() : {
            title: '',
            description: '',
            date: null,
            location: '',
            image: null
          }}
          validationMode={editingEvent ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          schema = { editingEvent ? updateEventSchema : createEventSchema}
        />
        </div>
        }
        {/* this extra div so space-y don't add margin to y axis of delete modal */}
        {showDeleteModal && 
        <div>
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message="Are you sure you want to delete this event?"
              onConfirm={handleDeleteConfirm}
              onCancel={closeDeleteModal}
            />
          </div>
        </div>
        }
    </div>
  );
}

export default Events;
