import { useState,useEffect } from 'react'; // Add useState to existing useEffect import
import generalService from '../services/generalService.js'; // Create this service
import FormBuilder from '../components/common/FormBuiler.jsx';
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools.js';
import { useScrollToForm } from '../utils/tools.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { aboutSchema, createBusinessHourSchema, updateBusinessHourSchema } from '../validation/schemas/generalinfoSchema.js';

export default function Info() {
    // data holding states
    const [aboutSummary, setAboutSummary] = useState('');
    const [businessHours, setBusinessHours] = useState([]);
    // loading states
    const [SummaryLoading, setLoadingSummary] = useState(false);
    const [HoursLoading, setLoadingHours] = useState(false);
    // modal appearance states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // editing states
    const [EditingHour, setEditingHour] = useState(false);
    const [hourToDeleteID, setHourToDeleteID] = useState(null);

    const {success,error}=useNotification();

    // Prevent background scrolling when delete modal is open
    useBodyOverflow(isDeleteModalOpen);

    // Fetch initial data
    async function fetchData() {
            setLoadingSummary(true);
            setLoadingHours(true);
            try {
                const data = await generalService.getGeneralInfo();
                setAboutSummary(data.about_summary);
                setBusinessHours(data.business_hours);
            } catch (err) {
                error("Failed to load data");
                console.error("Error fetching data:", err);
            } finally {
                setLoadingSummary(false);
                setLoadingHours(false);
            }
        }
    
    useEffect(() => {
        fetchData();
    }, []);

    // Scroll to form when modal opens
    useScrollToForm(isModalOpen);

    // open/close modal for adding/editing/deleting business hours
    const openModal = (hour=null) => {
        setEditingHour(hour);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);    // Hide modal
        setEditingHour(null);    // Clear editing data
    };
    const openDeleteModal = (hourId) => {
        setHourToDeleteID(hourId);
        setIsDeleteModalOpen(true);
    }
    const closeDeleteModal = () => {
        setHourToDeleteID(null);
        setIsDeleteModalOpen(false);
    }
    // form submission handlers
    const handleAboutSubmit = async (formData) => {
        try {
            setLoadingSummary(true);
            await generalService.updateAboutSummary(formData);
            success('About summary updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update about summary');
            console.error(err);
        } finally {
            setLoadingSummary(false);
        }
    }
    const handleFormSubmit = async (formData) => {
        try {
        setLoadingHours(true);
        if (EditingHour) {
            // Update existing hour
            await generalService.updateBusinessHour(EditingHour.id, formData);
        } else {
            // Create new hour
            await generalService.createBusinessHour(formData);
        }
        success(`Business hour ${EditingHour ? 'updated' : 'created'} successfully`);
        fetchData();
        } catch (err) {
        error('Failed to save business hour');
        console.error(err);
        } finally {
        setLoadingHours(false);
        closeModal();
    }
  };
    const handleDeleteConfirm = async () => {
        try {
            // Call delete API
            await generalService.deleteBusinessHour(hourToDeleteID);
            closeDeleteModal();
            success('Business hour deleted successfully');
            fetchData(); // Refresh data
        } catch (err) {
            error('Failed to delete business hour');
            console.error(err);
        } finally {
            setHourToDeleteID(null);
            setIsDeleteModalOpen(false);
        }
    };    


    return (
        <div className='space-y-4'>
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">General Information</h1>
                <button onClick={() => openModal()} className="btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Business Hour
                </button>
            </div>
            <div  className='bg-containerBg shadow-shadowColor max-w-[800px] p-4 shadow-md rounded-lg space-y-8'>                
                            <div className='space-y-2'>
                                <h2 className="text-xl font-semibold ">About Summary</h2>
                                {SummaryLoading ? (
                                    <div className="flex bg-red justify-center items-center p-2">
                                        <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                    </div>
                                    ) : (
                                            <AboutSummaryForm AboutSummary={aboutSummary} onSubmit={handleAboutSubmit} />
                                    )
                                }
                            </div>
                                <div className='space-y-2'>
                                    <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
                                    {HoursLoading ? (
                                        <div className="flex bg-red justify-center items-center p-4">
                                            <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                        ) : (
                                            <>
                                            {businessHours?.length > 0 ? (
                                                    <div className='overflow-x-auto'>
                                                        <table className=' text-center w-full max-w-[800px] border  rounded-lg divide-y  divide-gray-200'>
                                                            <thead className='bg-[#ebeef2]'>
                                                                <tr>
                                                                    {
                                                                        ['Day', 'Open Time', 'Close Time', 'Actions'].map((header, index) => (
                                                                            <th key={index} className='px-4 py-2'>{header}</th>
                                                                        ))
                                                                }
                                                            </tr>
                                                        </thead>
                                                        <tbody className='divide-y divide-gray-200'>
                                                            {
                                                                businessHours.map((hour) => (
                                                                    <tr key={hour.id}>
                                                                        <td className='px-4 py-2 font-semibold'>{hour.day}</td>
                                                                        <td className='px-4 py-2'>{hour.open_time}</td>
                                                                        <td className='px-4 py-2'>{hour.close_time}</td>
                                                                        <td className='px-4 py-2 space-y-1 text-sm flex flex-col justify-center items-center'>
                                                                            <button onClick={() => openModal(hour)} className="bg-success m-[auto] flex items-center hover:bg-hoverSuccess text-btnText px-3 py-1 rounded">
                                                                                Edit
                                                                                <i className="fa-solid fa-pencil-alt ml-1"></i>

                                                                            </button>
                                                                            <button onClick={() => openDeleteModal(hour.id)} className="bg-danger m-[auto] flex items-center hover:bg-hoverDanger text-btnText px-3 py-1 rounded">
                                                                                Delete
                                                                                <span className="ml-1"><i className="fa-solid fa-trash-alt"></i></span>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                    </div>
                                                ) : (
                                                <p className='text-muted'>No business hours found.</p>
                                            )}
                                            </>
                                         )
                                    }
                            </div>
               
            </div>
             {isModalOpen &&
                    <div id='form'>
                        <FormBuilder
                            title={EditingHour ? "Edit Business Hour" : "Add Business Hour"}
                            fields={[
                                { name: 'day', label: 'Day', type: 'text', placeholder: 'format : day or day1-day2' },
                                { name: 'open_time', label: 'Open Time', type: 'time' },
                                { name: 'close_time', label: 'Close Time', type: 'time' },
                            ]}
                            initialData={EditingHour 
                            ? (() => {
                                        const { id: _, ...rest } = EditingHour;
                                        return rest;
                                    })() 
                            : { day: 'Monday', open_time: '', close_time: '' }}
                            validationMode={EditingHour ? 'update' : 'create'}
                            schema={EditingHour ? updateBusinessHourSchema : createBusinessHourSchema}
                            onSubmit={handleFormSubmit}
                            onClose={closeModal}
                            useFormData={false}
                        />
                    </div>
                }
                {
                isDeleteModalOpen && 
                    <div>
                        <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                            <DeleteModal
                                message="Are you sure you want to delete this business hour?"
                                onCancel={closeDeleteModal}
                                onConfirm={handleDeleteConfirm}
                            />
                        </div>
                    </div>
                }
        </div>
    )

}
function AboutSummaryForm({ AboutSummary, onSubmit }) {
    const [summary, setAboutSummary] = useState(AboutSummary || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        setAboutSummary(AboutSummary || '');
    }, [AboutSummary]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await aboutSchema.validate({ about_summary: summary })
            onSubmit({ about_summary: summary });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} className=''>
            <div className='flex flex-wrap items-center space-x-3'>
            <textarea
                id="about-summary"
                value={summary}
                onChange={(e) => setAboutSummary(e.target.value)}
                className="h-20 min-w-48 p-2 border border-gray-300 rounded"
                rows="4"
                placeholder="Enter your gym summary..."
            />
            <button type="submit" className="btn-primary">
                      <i className="fa-solid fa-save"></i>
                  </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}