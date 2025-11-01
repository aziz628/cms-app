import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import scheduleService from '../services/scheduleService';
import FormBuilder from '../components/common/FormBuiler';
import DeleteModal from '../components/common/DeleteModal';
import { createScheduleSchema, updateScheduleSchema,DAYS } from '../validation/schemas/scheduleSchema';

const SESSION_WIDTH = 120; // Width of each session block in pixels

  function Schedule() {
  const [sessionsByDay, setSessionsByDay] = useState({});
  const [hoursSlots , setHoursSlots] = useState([]); // Array of time slots for the schedule
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { success, error } = useNotification();
  async function fetchSchedule (){
    try{
      setLoading(true)
      const data =await scheduleService.getSchedule()
      setSessionsByDay(data.sessionsByDay || {})
      setClasses(data.classes || [])
      setHoursSlots(generateTimeSlotsFromSessions(data.sessionsByDay || {}))
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <i className="fa-solid fa-plus mr-2"></i>
              Add New Session
        </button>
      </div>
      {/* loading spinner */}
      {loading ? (
          <div className="flex  justify-center items-center h-64">
            <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) :(
        // class table container
        <div id='class-table'  className='bg-white  p-4 shadow-md rounded-lg'>
          <h2 className="text-xl font-semibold mb-4">Class Schedule</h2>
          <div className=' overflow-x-auto'>
            <div id='week_schedule' className='text-center flex overflow-x-auto border rounded-lg '>
              {/* Hours column */}
              <div className="flex flex-col border-r">
                { // have first cell  empty in the header to not overlap with days in the headers
                  hoursSlots[0] && ( // have a bottom margin to seperate from  body cells
                    <div className="px-2 py-4 h-[60px] mb-2 text-sm font-medium text-gray-600 border-b" style={{ height: '60px' }}></div>
                  )
                }
                {hoursSlots.map((hour) => (
                  <div
                    key={hour.hourStart}
                    className="px-2 py-4 text-sm font-medium text-gray-600 border-b"
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
          
          </div>
          {Object.keys(sessionsByDay).length === 0 && (
            <p className='text-gray-500 pl-2 mt-4'>No sessions found.</p>
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

function DayColumn({ day, sessions, hours, onEditSession, onDeleteSession, getClassName }) {
  let pointer = 0;
  let block = {};
  const convertedSessions = sessions.map(session => ({
    ...session,
    startTime: convertTimeToMinutes(session.start_time),
    endTime: convertTimeToMinutes(session.end_time)
  }));
  return (
    <div
      className="flex flex-col border-r flex-1"
    >
      {/* Day Header */}  
      <div className="px-2 py-2 bg-gray-50 mb-2 h-[60px] border-b text-center font-semibold">
        {day}
      </div>
      {/*column body */}
      <div className=' flex-1 relative min-w-[120px]'>
        { /* hour rows */}
        {
          hours.map(({ hourStart, hourEnd }) => {
            // convert the hours from hh:mm format to minutes from midnight
            const hourStartMinutes = convertTimeToMinutes(hourStart);
            const hourEndMinutes = convertTimeToMinutes(hourEnd);
            // filter the block to remove sessions that have ended before the current hour
            blockFilter(block, hourStartMinutes);
            const toDisplay = []; // sessions to display in the current hour row
            let rowMinWidth = Object.keys(block).length * SESSION_WIDTH;

            // process sessions that start within the current hour
            while (pointer < convertedSessions.length && convertedSessions[pointer].startTime < hourEndMinutes) {
              const newSession = { ...convertedSessions[pointer] };
              pointer++;
              // Find free column for this session
              let freeCol = findFreeColumn(block, newSession);
              if (!block[freeCol]) block[freeCol] = []; // initialize if not exists
                
              block[freeCol].push(newSession);

              // Compute layout properties
              newSession.colIndex = freeCol;
              newSession.top = newSession.startTime - hourStartMinutes;
              newSession.height = newSession.endTime - newSession.startTime;
              newSession.left = newSession.colIndex * SESSION_WIDTH;
              // assign class name
              newSession.className = getClassName(newSession.class_id);
                            
              // Add to display list
              toDisplay.push(newSession);
            }
            return (
            <HourRow
              key={hourStart}
              sessions={toDisplay}
              rowMinWidth={rowMinWidth}
              onEditSession={onEditSession}
              onDeleteSession={onDeleteSession}
            />
          )
          })
        }

      </div>

    </div>
  )
}
function HourRow({  sessions, rowMinWidth, onEditSession, onDeleteSession }) {
  return (
    <div
      className="relative border-b h-[60px]" 
      style={{minWidth: `${rowMinWidth}px`}}
    >
      {sessions.map((session) => (
        <div
          key={session.id}
          className="absolute rounded  z-30 flex flex-col justify-between text-white bg-secondary "
          style={{
            top: `${Math.max(0, session.top)}px`,
            left: `${session.left}px`,
            width: `${SESSION_WIDTH - 2}px`, // minus 2px for both sides 1px border
            height: `${session.height}px`,
            borderWidth: '1px',
            borderColor: 'black'
          }}
        >
          {/* session details */}
          <div className='p-1 space-y-1 text-xs font-semibold flex flex-col no-wrap '>
            <span className='block'>{session.className.charAt(0).toUpperCase() + session.className.slice(1)}</span>
            <div className='p-0 text-[13px]' style={{ marginTop: '-5px' }} >
              <span className='mr-2'>{session.start_time}</span> 
              <span>{session.end_time}</span>
            </div>
          </div>
          {/* button actions */}
          <div className='flex justify-center gap-2 h-[20px]  w-full' style={{ marginTop: '-2px' }}>
            <button 
              className="text-xs px-[4px] flex items-center h-[15px] bg-green-600 hover:bg-green-700 rounded" 
              onClick={() => onEditSession(cleanUpSession(session))}>
              <i className="fas fa-edit text-[10px]"></i>
            </button>
            <button 
              className="text-xs px-[4px] flex items-center h-[15px] bg-red-600 hover:bg-red-700 rounded" 
              onClick={() => onDeleteSession(session.id)}>
              <i className="fas fa-trash text-[10px]"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function generateTimeSlotsFromSessions(sessionsByDay) {
    const hoursSet = new Set();
    
    // Extract all hours that have sessions across all days
    Object.values(sessionsByDay).forEach(sessions => {
        sessions.forEach(session => {
            const startMinutes = convertTimeToMinutes(session.start_time);
            const endMinutes = convertTimeToMinutes(session.end_time);

            // Get hour range [floor(start), ceil(end)[ 
            const startHour = Math.floor(startMinutes / 60) ;
            const endHour = Math.ceil(endMinutes / 60);

            // Add all hours in the range
            for (let hour = startHour; hour < endHour && hour < 24; hour++) {
                // check if hour is already in set
                if (!hoursSet.has(hour)) {
                    hoursSet.add(hour);
                }
            }
        });
    });
    
    // Convert Set to sorted array of time slot objects
     const timeSlots = Array.from(hoursSet)
        .sort((a, b) => a - b)
        .map(hour => ({
            hourStart: hour.toString().padStart(2, '0') + ':00',
            hourEnd: ((hour + 1)).toString().padStart(2, '0') + ':00'
        }));      
    return timeSlots;
}

function cleanUpSession(session) {
  // keep only feilds used in form submission
  return {
    id: session.id,
    class_id: session.class_id,
    day_of_week: session.day_of_week,
    start_time: session.start_time,
    end_time: session.end_time
  };
}

// convert the time in hh:mm format to minutes from midnight
function convertTimeToMinutes(time) {
  if (typeof time !== "string") return time;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
/*
function convertMinutesToTime(minutes) {
  const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
}
*/
function blockFilter(block, newHourStart) {
  // block is an object with index as keys and session arrays as values
  return Object.entries(block).forEach(([index, sessions]) => {
    block[index] = sessions.filter((s) => s.endTime > newHourStart);
  });
}

function findFreeColumn(block, newSession) {
  const blockLength = Object.keys(block).length;
  
  // Check existing columns for availability
  for (let i = 0; i < blockLength; i++) {
    const sessions = block[i] || [];
    const overlaps = sessions.some(existingSession => 
      !(existingSession.endTime <= newSession.startTime || newSession.endTime <= existingSession.startTime)
    );
    if (!overlaps) {
      return i; // Found free column, exit immediately
    }
  }
  
  // No free column found, use next available
  return blockLength;
}

export default Schedule;