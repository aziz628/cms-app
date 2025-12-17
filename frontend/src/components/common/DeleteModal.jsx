import { useState } from "react";
function DeleteModal({ message, onConfirm, onCancel }) {
  const [loading,setLoading]=useState(false)
  return (
        <div  className="bg-surface rounded-lg shadow-lg p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
          {loading && <div className="flex py-4 justify-center items-center h-[fit-content]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>}
          <p className="mb-4">{message}</p>
          <div className="flex justify-end space-x-2">
            <button onClick={()=>{setLoading(true);onConfirm()}} 
            className="bg-danger hover:bg-hoverDanger text-btnText px-4 py-2 rounded">
              Delete
            </button>
            <button onClick={onCancel} 
            className="bg-muted hover:bg-hoverMuted text-btnText px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
  );
}
export default DeleteModal;