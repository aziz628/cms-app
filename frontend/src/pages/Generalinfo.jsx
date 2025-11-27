import { useState,useEffect } from 'react'; // Add useState to existing useEffect import
import generalService from '../services/generalService.js'; // Create this service
import FormBuilder from '../components/common/FormBuiler.jsx';
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools.js';
import { useScrollToForm } from '../utils/tools.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { aboutSchema, createBusinessHourSchema, updateBusinessHourSchema,hero_title_Schema,hero_subtitle_Schema } from '../validation/schemas/generalinfoSchema.js';
import { getCurrentPage } from '../utils/tools.js';
export default function Info() {
    // data holding states
    const [aboutSummary, setAboutSummary] = useState('');
    const [aboutImage, setAboutImage] = useState(null);
    const [businessHours, setBusinessHours] = useState([]);
    const [heroTitle, setHeroTitle] = useState('');
    const [heroSubtitle, setHeroSubtitle] = useState('');
    const [heroImage, setHeroImage] = useState(null);

    // loading states
    const [AboutSummaryLoading, setLoadingAboutSummary] = useState(false);
    const [AboutImageLoading, setLoadingAboutImage] = useState(false);
    const [HeroTitleLoading, setLoadingHeroTitle] = useState(false);
    const [HeroSubtitleLoading, setLoadingHeroSubtitle] = useState(false);
    const [HeroImageLoading, setLoadingHeroImage] = useState(false);
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
            setLoadingAboutSummary(true);
            setLoadingHours(true);
            setLoadingHeroTitle(true);
            setLoadingHeroSubtitle(true);
            setLoadingHeroImage(true);
            setLoadingAboutImage(true);
            try {
                const data = await generalService.getGeneralInfo();
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
    // handle title , subtitle , about image , hero image updates

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
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">General Information</h1>
                <button onClick={() => openModal()} className="btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Business Hour
                </button>
            </div>
            <div  className='bg-containerBg shadow-shadowColor max-w-[800px] p-4 shadow-md rounded-lg space-y-8'>                
                            
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">Hero Title</h2>
                        {HeroTitleLoading ? (
                            <div className="flex bg-red justify-center items-center p-2">
                                <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                            ) : (
                                    <HeroTitleForm HeroTitle={heroTitle} onSubmit={handleHeroTitleSubmit} />
                            )
                        }
                    </div>
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">Hero Subtitle</h2>
                        {HeroSubtitleLoading ? (
                            <div className="flex bg-red justify-center items-center p-2">
                                <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <HeroSubtitleForm HeroSubtitle={heroSubtitle} onSubmit={handleHeroSubtitleSubmit} />
                        )}
                    </div>
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">Hero Image</h2>
                        {HeroImageLoading ? (
                            <div className="flex bg-red justify-center items-center p-2">
                                <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
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
                    
                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">About Summary</h2>
                        {AboutSummaryLoading ? (
                            <div className="flex bg-red justify-center items-center p-2">
                                <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <AboutSummaryForm AboutSummary={aboutSummary} onSubmit={handleAboutSubmit} />
                        )}
                    </div>

                    <div className='space-y-2'>
                        <h2 className="text-xl font-semibold ">About Summary image</h2>
                        {AboutImageLoading ? (
                            <div className="flex bg-red justify-center items-center p-2">
                                <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
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

function HeroTitleForm({ HeroTitle, onSubmit }) {
    const [title, setHeroTitle] = useState(HeroTitle || '');
    const [error, setError] = useState(null);
    useEffect(() => {
        setHeroTitle(HeroTitle || '');
    }, [HeroTitle]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await hero_title_Schema.validate({ hero_title: title })
            onSubmit({ hero_title: title });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} className=''>
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="border border-gray-300 rounded p-2"
                    placeholder="Enter hero title..."
                />
                <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}
function HeroSubtitleForm({ HeroSubtitle, onSubmit }) {
    const [subtitle, setHeroSubtitle] = useState(HeroSubtitle || '');
    const [error, setError] = useState(null);

    useEffect(() => {
        setHeroSubtitle(HeroSubtitle || '');
    }, [HeroSubtitle]);

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await hero_subtitle_Schema.validate({ hero_subtitle: subtitle })
            onSubmit({ hero_subtitle: subtitle });
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSubmit} className=''>
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="border border-gray-300 rounded p-2"
                    placeholder="Enter hero subtitle..."
                />
                <button type="submit" className="btn-primary">
                    <i className="fa-solid fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}