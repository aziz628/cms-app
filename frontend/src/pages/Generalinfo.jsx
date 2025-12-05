import { useState,useEffect } from 'react'; // Add useState to existing useEffect import
import generalService from '../services/generalService.js'; // Create this service
import FormBuilder from '../components/common/FormBuiler.jsx';
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools.js';
import { useScrollToForm } from '../utils/tools.js';
import { useNotification } from '../context/NotificationContext.jsx';
import {createBusinessHourSchema, updateBusinessHourSchema } from '../validation/schemas/generalinfoSchema.js';
import { getCurrentPage } from '../utils/tools.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { AboutSummaryForm, HeroTitleForm, HeroSubtitleForm } from '../components/forms/GeneralInfoForms.jsx';

export default function Info() {
    // data holding states
    const [aboutSummary, setAboutSummary] = useState('');
    const [aboutImage, setAboutImage] = useState(null);
    const [businessHours, setBusinessHours] = useState([]);
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroImage, setHeroImage] = useState(null);

    // loading states
    const [AboutSummaryLoading, setLoadingAboutSummary] = useState(true);
    const [AboutImageLoading, setLoadingAboutImage] = useState(true);
    const [HeroTitleLoading, setLoadingHeroTitle] = useState(true);
    const [HeroSubtitleLoading, setLoadingHeroSubtitle] = useState(true);
    const [HeroImageLoading, setLoadingHeroImage] = useState(true);
    const [HoursLoading, setLoadingHours] = useState(true);

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
             // set loading states
            setLoadingAboutSummary(true);
            setLoadingHours(true);
            setLoadingHeroTitle(true);
            setLoadingHeroSubtitle(true);
            setLoadingHeroImage(true);
            setLoadingAboutImage(true);
            try {
                const data = await generalService.getGeneralInfo();

                // set data states
                setAboutSummary(data.about_summary);
                setBusinessHours(data.business_hours);
                setHeroTitle(data.hero_title);
                setHeroSubtitle(data.hero_subtitle);
                setHeroImage(data.hero_image);
                setAboutImage(data.about_image);

            } catch (err) {
                error("Failed to load data");
                console.error("Error fetching data:", err);
                
            } finally {
                // reset loading states
                setLoadingHeroTitle(false);
                setLoadingHeroSubtitle(false);
                setLoadingHeroImage(false);
                setLoadingAboutImage(false);
                setLoadingAboutSummary(false);
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
            setLoadingAboutSummary(true);
            await generalService.updateAboutSummary(formData);
            success('About summary updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update about summary');
            console.error(err);
        } finally {
            setLoadingAboutSummary(false);
        }
    }
    // form submit handlers 

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
    const handleHeroTitleSubmit = async (formData) => {
        try {
            setLoadingHeroTitle(true);
            await generalService.updateHeroTitle(formData);
            success('Hero title updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update hero title');
            console.error(err);
        } finally {
            setLoadingHeroTitle(false);
        }
    };
    const handleHeroSubtitleSubmit = async (formData) => {
        try {
            setLoadingHeroSubtitle(true);
            await generalService.updateHeroSubtitle(formData);
            success('Hero subtitle updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update hero subtitle');
            console.error(err);
        } finally {
            setLoadingHeroSubtitle(false);
        }
    };
    const handleHeroImageSubmit = async (formData) => {
        try {
            setLoadingHeroImage(true);
            await generalService.updateHeroImage(formData);
            success('Hero image updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update hero image');
            console.error(err);
        } finally {
            setLoadingHeroImage(false);
        }
    };
    const handleAboutImageSubmit = async (formData) => {
        try {
            setLoadingAboutImage(true);
            await generalService.updateAboutImage(formData);
            success('About image updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update about image');
            console.error(err);
        } finally {
            setLoadingAboutImage(false);
        }
    };

    // delete confirmation handler
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

    // file input change handlers
    const handleFileChange = (type, e) => {
        const file = e.target.files[0];

        // size limit is 2mb
        if (file && file.size <= 2 * 1024 * 1024) {
            const formData = new FormData();
            formData.append(type, file);
            if (type === 'hero_image') {
                handleHeroImageSubmit(formData);
            } else if (type === 'about_image') {
                handleAboutImageSubmit(formData);
            }
        } else {
            error('File size exceeds 2MB');
        }
    }


    return (
        <div className='space-y-4'>
            {/* General Information Header */}
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">General Information</h1>
                <button onClick={() => openModal()} className="btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Business Hour
                </button>
            </div>

            {/* Business Hours Section */}
            <div  className='bg-containerBg shadow-shadowColor max-w-[800px] p-4 shadow-md rounded-lg space-y-8'>                
                    
                    {/* Business Hours Form */}
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">Hero Title</h2>
                        {HeroTitleLoading ? (
                            <LoadingSpinner size='small'/>
                            ) : (
                                    <HeroTitleForm HeroTitle={heroTitle} onSubmit={handleHeroTitleSubmit} />
                            )
                        }
                    </div>
                    { /* Hero Subtitle Form */}
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">Hero Subtitle</h2>
                        {HeroSubtitleLoading ? (
                            <LoadingSpinner size='small'/>
                        ) : (
                            <HeroSubtitleForm HeroSubtitle={heroSubtitle} onSubmit={handleHeroSubtitleSubmit} />
                        )}
                    </div>

                    { /* Hero Image Form */}
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">Hero Image</h2>
                        {HeroImageLoading ? (
                            <LoadingSpinner size='small'/>
                            ) : (
                                <div className='flex flex-col space-y-2'>
                                    {/* preview for image */}
                                    {heroImage && (
                                        <img src={`/uploads/${getCurrentPage()}/${heroImage}`} alt="Hero" className="mt-2 inline size-24 rounded" />
                                    )}

                                    {/* input for the new image file */}
                                    <input type="file" accept="image/*" onChange={(e) => handleFileChange('hero_image', e)} />
                                </div>
                            )
                        }
                    </div>
                    
                    { /* Hero Image Form */}
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">About Summary</h2>
                        {AboutSummaryLoading ? (
                            <LoadingSpinner size='small'/>
                        ) : (
                            <AboutSummaryForm AboutSummary={aboutSummary} onSubmit={handleAboutSubmit} />
                        )}
                    </div>
                    
                    { /* About Image Form */}
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">About Summary image</h2>
                        {AboutImageLoading ? (
                            <LoadingSpinner size='small'/>
                            ) : (
                                <div className='flex flex-col space-y-2'>
                                    {/* preview for image */}
                                    {aboutImage && (
                                        <img src={`/uploads/${getCurrentPage()}/${aboutImage}`} alt="About Summary" className="mt-2 inline size-32 rounded" />
                                    )}
                                    {/* input for the new image file */}
                                    <input type="file" name='about_image' accept="image/*" onChange={(e) => handleFileChange('about_image', e)} />
                                </div>
                            )
                        }
                    </div>
                
                {/* Business Hours Table */}
                <div className='space-y-2'>
                    <h2 className="text-xl font-semibold mb-4">Business Hours</h2>
                        
                        {HoursLoading 
                        ?   (
                            <>                   
                            {/* Loading Indicator  */}
                               <LoadingSpinner  />
                            </>
                            ) 
                        : (<>
                           { /* Business Hours Table */}
                                {businessHours?.length > 0 
                                ? (
                                        <div className='overflow-x-auto'>
                                            <table className=' text-center w-full max-w-[800px] border  rounded-lg divide-y  divide-borderColor'>
                                                <thead className='bg-tableHeaderBg '>
                                                    <tr>
                                                        {
                                                            ['Day', 'Open Time', 'Close Time', 'Actions'].map((header, index) => (
                                                                <th key={index} className='px-4 py-2'>{header}</th>
                                                            ))
                                                    }
                                                </tr>
                                            </thead>
                                            <tbody className='divide-y divide-borderColor'>
                                                {
                                                    businessHours.map((hour) => (
                                                        <tr key={hour.id}>
                                                            <td className='px-4 py-2 font-semibold'>{hour.day?.charAt(0)?.toUpperCase() + hour.day?.slice(1)}</td>
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
                                   ) 
                                : (
                                    <p className='text-muted'>No business hours found.</p>
                                )}
                            </>
                            )
                        }
                </div>
               
            </div>
            
            { /* Modal for Adding/Editing Business Hours */}
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

                { /* Delete Confirmation Modal */}
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

