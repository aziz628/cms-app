
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
  // keep only fields used in form submission
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

// Filter out sessions in the block that have ended before newHourStart
function blockFilter(block, newHourStart) {
  // block is an object with index as keys and session arrays as values
  return Object.entries(block).forEach(([index, sessions]) => {
    block[index] = sessions.filter((s) => s.endTime > newHourStart);
  });
}

// Find free column in the block for the new session
function findFreeColumn(block, newSession) {
  // get the number of columns in the block
  const blockLength = Object.keys(block).length;
  
  // Check existing columns for availability
  for (let i = 0; i < blockLength; i++) {
    // Get all sessions in the column
    const sessions = block[i] || [];
    
    // Check for overlap
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
export {
    generateTimeSlotsFromSessions,
    cleanUpSession,
    convertTimeToMinutes,
    blockFilter,
    findFreeColumn
};