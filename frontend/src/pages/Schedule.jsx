import { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import scheduleService from '../services/scheduleService';
import FormBuilder from '../components/common/FormBuilder';
import DeleteModal from '../components/common/DeleteModal';
import { createScheduleSchema, updateScheduleSchema,DAYS } from '../validation/schemas/scheduleSchema';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import {
    generateTimeSlotsFromSessions,
} from '../components/schedule/scheduleHelpers.js';
import DayColumn from '../components/schedule/DayColumn.jsx';

function Schedule() {
  const [sessionsByDay, setSessionsByDay] = useState({});
  const [hoursSlots , setHoursSlots] = useState([]); // Array of time slots for the schedule
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { success, error } = useNotification();
  
  async function fetchSchedule (){
    try{
      setLoading(true)
      const data =await scheduleService.getSchedule()
      setSessionsByDay(data.sessions_by_day || {})
      setClasses(data.classes || [])
      setHoursSlots(generateTimeSlotsFromSessions(data.sessions_by_day || {}))
    }catch(err){
      error('Failed to load schedule')
      console.error(err)
    }finally{
      setLoading(false)
    } 
  }
  useEffect(()=>{
    fetchSchedule()
  },[])
  
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

  const openModal = (session = null) => {
    if (classes?.length === 0 ) {
      error('Please add classes first before creating sessions');
      return;
    }
    setEditingSession(session);
    setIsModalOpen(true);
  }
  
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSession(null);
  };

  const getClassName = (classId) => {
    const classItem = classes.find(c => c.id === classId);
    return classItem ? classItem.name : 'Unknown';
  };

  // Delete modal handlers
  const openDeleteModal = (sessionId) => {
    setDeletingSessionId(sessionId);
    setShowDeleteModal(true);
  };
  
  const closeDeleteModal = () => {
    setDeletingSessionId(null);
    setShowDeleteModal(false);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await scheduleService.deleteSession(deletingSessionId);
      success('Session deleted successfully');
      closeDeleteModal();
      fetchSchedule()
    } catch (err) {
      error('Failed to delete session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
   // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      if (editingSession) {
        await scheduleService.updateSession(editingSession.id, formData);
        success('Session updated successfully');
      } else {
        await scheduleService.createSession(formData);
        success('Session created successfully');
      }
      closeModal();
      fetchSchedule();
    } catch (err) {
      error('Failed to save session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" >
      <div className="flex flex-col gap-4  md:flex-row md:justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Schedule Management</h2>
        <button 
              onClick={() => {openModal(null)} } // Open modal for adding new session
              className="bg-primary hover:bg-hoverPrimary text-btnText px-4 py-2 rounded flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Session
        </button>
      </div>
      {/* loading spinner */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        // class table container
        <div id='class-table'  className='bg-surface  p-4 shadow-md rounded-lg'>
          <h2 className="text-xl font-semibold mb-4">Class Schedule</h2>
          {Object.keys(sessionsByDay).length > 0 
          ?(
            <div className=' overflow-x-auto'>
              <div id='week_schedule' className='text-center w-fit flex overflow-x-auto border rounded-lg '>
              
                {/* Hours column */}
                <div className="flex flex-col border-r">
                
                  { // have first cell  empty in the header to not overlap with days in the headers
                    hoursSlots[0] && ( // have a bottom margin to seperate from  body cells
                      <div className="px-2 py-4 h-[60px]  text-sm font-medium text-muted border-b" style={{ height: '60px' }}></div>
                    )
                  }
                  {hoursSlots.map((hour) => (
                    <div
                      key={hour.hourStart}
                      className="px-2 py-4 text-sm font-medium  border-b"
                      style={{ height: '60px' }}
                    >
                      <span className='whitespace-nowrap'>{hour.hourStart} - {hour.hourEnd === '24:00' ? '00:00' : hour.hourEnd}</span>

                    </div>
                  ))}
                </div>
                {/* Days columns */}
                {Object.entries(sessionsByDay).map(([day, sessions]) => (
                  <DayColumn 
                    key={day} 
                    day={day} 
                    sessions={sessions} 
                    getClassName={getClassName}
                    hours={hoursSlots}
                    onEditSession={(session) => openModal(session)}
                    onDeleteSession={(sessionId) => openDeleteModal(sessionId)}
                  />
                ))}
              </div>
            
            </div>)
          :(
            <p className='text-muted pl-2 mt-4'>No sessions found.</p>
          )}
        </div>
      )}
      {isModalOpen &&  
        <div id="form">
          <FormBuilder
          title={editingSession ? 'Edit Session' : 'Add Session'}
          fields={[
                  { 
                    name: 'class_id', 
                    label: 'Class', 
                    type: 'select',
                    options: classes.map(c => ({ value: c.id, label: c.name })),
                    required: true 
                  },
                  { 
                    name: 'day_of_week', 
                    label: 'Day', 
                    type: 'select',
                    options: DAYS.map(d => ({ value: d })),
                    required: true 
                  },
                  { name: 'start_time', label: 'Start Time', type: 'time', required: true },
                  { name: 'end_time', label: 'End Time', type: 'time', required: true }
          ]}
          initialData={editingSession ? (() => {
            const { id: _, ...rest } = editingSession;
            return rest;
          })() : {
            class_id: classes[0]?.id ,
            day_of_week: 'Monday',
            start_time: '',
            end_time: ''
          }}
          validationMode={editingSession ? 'edit' : 'create'}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          schema={editingSession ? updateScheduleSchema : createScheduleSchema}
          useFormData={false}
          ></FormBuilder>
        </div>
        }

      {showDeleteModal && (
        <div>
          <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <DeleteModal
              message={"Are you sure you want to delete this session?"}
              onConfirm={handleDeleteConfirm}
              onCancel={closeDeleteModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}



export default Schedule;