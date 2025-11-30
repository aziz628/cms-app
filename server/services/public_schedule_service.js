import { timeToMinutes } from "../utils/time_format.js";
// constants
const ROW_HEIGHT = 60;         // px
const SESSION_WIDTH = 120;     // px 


// main function to compute layout
function computeLayout(schedule) {
    let sessions_by_day = schedule.sessions_by_day
    let classes = schedule.classes
    let Widths = {};  // to store max width per day

    // enrich sessions with class names
    for (const day in sessions_by_day) {

        sessions_by_day[day] = sessions_by_day[day].map(s => ({
            ...s,
            class_name: classes.find(c => c.id === s.class_id)?.name
        }));
    }

    const hoursSlots = generateTimeSlotsFromSessions(sessions_by_day);
    const finalLayout = {};

    for (const [day, sessions] of Object.entries(sessions_by_day)) {
        let ColWidth = SESSION_WIDTH;

        // sort sessions by start time
        const converted_sessions = sessions.map(s => ({
            ...s,
            startMinutes: timeToMinutes(s.start_time),
            endMinutes:   timeToMinutes(s.end_time)
        }))
        .sort((a,b) => a.startMinutes - b.startMinutes);

        let pointer = 0;
        let block = {};

        finalLayout[day] = {};   // will store absolute positioned sessions

        hoursSlots.forEach((slot) => {
            // compute slot start and end in minutes
            const slotStart = timeToMinutes(slot.hourStart);
            const slotEnd   = timeToMinutes(slot.hourEnd);

            // remove finished sessions
            blockFilter(block, slotStart);

            // add new sessions that start inside this slot
            while (pointer < converted_sessions.length &&
                   converted_sessions[pointer].startMinutes < slotEnd) {
                
                // copy this session
                const s = { ...converted_sessions[pointer++] };
                
                // assign to a column
                const col = findFreeColumn(block, s);
                
                // add to block 
                if (!block[col]) block[col] = []; // initialize column
                block[col].push(s);

                // compute absolute position of the session using startMinutes and endMinutes
                const sessionTop =
                    (s.startMinutes - slotStart);

                const sessionHeight =
                    s.endMinutes - s.startMinutes;
                
                // add row to final layout
                if (!finalLayout[day]?.[slotStart]) finalLayout[day][slotStart] = [];
                
                // add to final layout
                finalLayout[day]?.[slotStart]?.push({
                    id: s.id,
                    class_name: s.class_name,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    colIndex: col,
                    width: SESSION_WIDTH - 2,
                    height: sessionHeight,
                    left: col * SESSION_WIDTH,
                    top: sessionTop
                });
            }
            // update ColWidth
            const currentWidth = (Object.keys(block).length) * SESSION_WIDTH;
            if (currentWidth > ColWidth) ColWidth = currentWidth;
        });
        // store max width for this day
        Widths[day] = ColWidth;
    }
    // result gonna be in format of { hoursSlots, layoutByDay, SESSION_WIDTH, ROW_HEIGHT, maxWidth }
    // where layoutByDay is { day: { slotStart: [sessions] } }

    return {
        hoursSlots,
        layoutByDay: finalLayout,
        SESSION_WIDTH,
        timeToMinutes,
        ROW_HEIGHT,
        Widths
    };
}


// --  utilities functions -- 


// remove sessions that have ended before newHourStart from all columns
function blockFilter(block, newHourStart) {
    for (const col of Object.keys(block)) {
        block[col] = block[col].filter(
            s => s.endMinutes > newHourStart
        );
    }
}

// find first free column for the new session
function findFreeColumn(block, newSession) {
    const colCount = Object.keys(block).length;

    for (let c = 0; c < colCount; c++) {
        const colSessions = block[c] || [];
        const overlaps = colSessions.some(s =>
            !(s.endMinutes <= newSession.startMinutes ||
              newSession.endMinutes <= s.startMinutes)
        );
        if (!overlaps) return c;
    }
    return colCount; // create new column
}


// timeslot generator 
function generateTimeSlotsFromSessions(sessions_by_day) {
    const hoursSet = new Set();

    Object.values(sessions_by_day).forEach(sessions => {
        sessions.forEach(s => {
            // get start and end in minutes
            const start = timeToMinutes(s.start_time);
            const end   = timeToMinutes(s.end_time);

            // determine the hours spanned by this session
            const hour_start = Math.floor(start / 60);
            const hour_end = Math.ceil(end / 60);

            for (let h = hour_start; h < hour_end && h < 24; h++) {
                hoursSet.add(h);
            }
        });
    });

    // convert set to sorted array of time slots
   const sorted_hours = [...hoursSet].sort((a,b)=>a-b).map(h =>  {  
            // generate "HH:MM" format
        let obj= {
        hourStart: `${String(h).padStart(2,'0')}:00`,
        hourEnd:   `${String(h+1).padStart(2,'0')}:00`
     }
     return obj;
});
   return sorted_hours;
}


export default computeLayout;
