import { useState } from 'react';
import HourRow from './HourRow.jsx';
import {
    convertTimeToMinutes,
    blockFilter,
    findFreeColumn
} from './scheduleHelpers.js';

const SESSION_WIDTH = 120; // Width of each session block in pixels

function DayColumn({ day, sessions, hours, onEditSession, onDeleteSession, getClassName }) {
  let pointer = 0;

  // a block to keep track of overlapping sessions
  // the block is a map of column index to array of sessions in that column
  let block = {};
  const [maxWidth, setMaxWidth] = useState(SESSION_WIDTH); // to keep track of max width needed for the column
  const convertedSessions = sessions.map(session => ({
    ...session,
    startTime: convertTimeToMinutes(session.start_time),
    endTime: convertTimeToMinutes(session.end_time)
  }));
  return (
    <div
      className="flex flex-col border-r" style={{ minWidth: `${maxWidth}px` }}
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
            // if new columns number exceeds maxWidth, update it
            let newRowMinWidth = Object.keys(block).length * SESSION_WIDTH;
            if (newRowMinWidth > maxWidth) {
              setMaxWidth(newRowMinWidth);
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
export default DayColumn;