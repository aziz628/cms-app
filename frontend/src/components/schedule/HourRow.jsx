import {
    cleanUpSession,
} from './scheduleHelpers.js';

const SESSION_WIDTH = 120; // Width of each session block in pixels

function HourRow({  sessions, rowMinWidth, onEditSession, onDeleteSession }) {
  return (
    <div
      className="relative border-b h-[60px]" 
      style={{minWidth: `${rowMinWidth}px`}}
    >
      {sessions.map((session) => (
        <div
          key={session.id}
          className="absolute rounded  z-30 flex flex-col justify-between text-btnText bg-secondary "
          style={{
            top: `${Math.max(0, session.top)}px`,
            left: `${session.left}px`,
            width: `${SESSION_WIDTH }px`, // minus 2px for both sides 1px border
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
              className="text-xs px-[4px] flex items-center h-[15px] bg-success hover:bg-hoverSuccess rounded" 
              onClick={() => onEditSession(cleanUpSession(session))}>
              <i className="fas fa-edit text-[10px]"></i>
            </button>
            <button 
              className="text-xs px-[4px] flex items-center h-[15px] bg-danger hover:bg-hoverDanger rounded" 
              onClick={() => onDeleteSession(session.id)}>
              <i className="fas fa-trash text-[10px]"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
export default HourRow;