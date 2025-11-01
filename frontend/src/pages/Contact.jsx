import { useState,useEffect } from 'react'; // Add useState to existing useEffect import
import contactService from '../services/contactService.js'; // Create this service
import FormBuilder from '../components/common/FormBuiler.jsx';
import DeleteModal from '../components/common/DeleteModal.jsx';
import { useBodyOverflow } from '../utils/tools.js';
import { useScrollToForm } from '../utils/tools.js';
import { useNotification } from '../context/NotificationContext.jsx';
import { addSocialMediaSchema ,updateSocialMediaSchema, locationSchema,emailSchema,phoneSchema } from '../validation/schemas/ContactSchema.js';
function Contact() {
      // data holding states
    const [socialMedias, setSocialMedias] = useState([]);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [emailAddresse, setEmailAddresse] = useState('');
    const [locationAddress, setLocationAddress] = useState(''); 
    // loading states
    const [loadingSocialMedia, setLoadingSocialMedia] = useState(false);
    const [loadingPhone, setLoadingPhone] = useState(false);
    const [loadingEmail, setLoadingEmail] = useState(false);
    const [loadingLocationAddress, setLoadingLocationAddress] = useState(false);
    // modal appearance states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    // editing states
    const [EditingLink, setEditingLink] = useState(false);
    const [linkToDeleteID, setLinkToDeleteID] = useState(null);
    const {success,error}=useNotification();
    
    // Prevent background scrolling when delete modal is open
    useBodyOverflow(isDeleteModalOpen);

    // Fetch initial data
    async function fetchData() {
            setLoadingSocialMedia(true);
            setLoadingPhone(true);
            setLoadingEmail(true);
            setLoadingLocationAddress(true);
            try {
                const data = await contactService.getContactInfo();
                const socialMediaLinks = data.social_media_links || [];
                const contactInfo = data.contact_info || {
                    phone_number: '',
                    email: '',
                    address: ''
                };
                setSocialMedias(socialMediaLinks );
                setPhoneNumber(contactInfo.phone_number);
                setEmailAddresse(contactInfo.email);
                setLocationAddress(contactInfo.address);
            } catch (err) {
                error("Failed to load data");
                console.error("Error fetching data:", err);
            } finally {
                setLoadingSocialMedia(false);
                setLoadingPhone(false);
                setLoadingEmail(false);
                setLoadingLocationAddress(false);
            }
        }

    useEffect(() => {
        fetchData();
    }, []);

    // Scroll to form when modal opens
    useScrollToForm(isModalOpen);

    // open/close modal for adding/editing/deleting business hours
    const openModal = (link=null) => {
        setEditingLink(link);
        setIsModalOpen(true);
    }

    const closeModal = () => {
        setIsModalOpen(false);    // Hide modal
        setEditingLink(null);    // Clear editing data
    };
    const openDeleteModal = (linkId) => {
        setLinkToDeleteID(linkId);
        setIsDeleteModalOpen(true);
    }
    const closeDeleteModal = () => {
        setLinkToDeleteID(null);
        setIsDeleteModalOpen(false);
    }
    const handlePhoneNumberSubmit = async (formData) => {
        try {
            setLoadingPhone(true);
            await contactService.updatePhoneNumber(formData);
            success('Phone number updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update phone number');
            console.error(err);
        } finally {
            setLoadingPhone(false);
        }
    }
    const handleEmailSubmit = async (formData) => {
        try {
            setLoadingEmail(true);
            await contactService.updateEmail(formData);
            success('Email updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update email');
            console.error(err);
        } finally {
            setLoadingEmail(false);
        }
    }
    const handleLocationSubmit = async (formData) => {
        try {
            setLoadingLocationAddress(true);
            await contactService.updateLocation(formData);
            success('Location updated successfully');
            fetchData();
        } catch (err) {
            error('Failed to update location Address');
            console.error(err);
        } finally {
            setLoadingLocationAddress(false);
        }
    }
    // form submission handlers
    const handleSocialMediaSubmit = async (formData) => {
        try {
            setLoadingSocialMedia(true);
            if (EditingLink) {
                // Update existing link
                await contactService.updateSocialMediaLink(EditingLink.id, formData);
            } else {
                // Create new link
                await contactService.addSocialMediaLink(formData);
            }
            success(`Social media link ${EditingLink ? 'updated' : 'created'} successfully`);
            fetchData();
        } catch (err) {
            error('Failed to update social media link');
            console.error(err);
        } finally {
            setLoadingSocialMedia(false);
            closeModal();
        }
    }
   const handleDeleteConfirm = async () => {
        try {
            // Call delete API
            await contactService.deleteSocialMediaLink(linkToDeleteID);
            closeDeleteModal();
            success('Social media link deleted successfully');
            fetchData(); // Refresh data
        } catch (err) {
            error('Failed to delete social media link');
            console.error(err);
        } finally {
            setLinkToDeleteID(null);
            setIsDeleteModalOpen(false);
        }
    };    
    return(
        <div className='space-y-4'>
            {/*title and button for new link */}
            <div className='flex justify-between items-center'>
                <h1 className="text-2xl font-bold mb-4">Contact Information</h1>
                <button onClick={() => openModal()} className="btn-primary">
                    <i className="fa-solid fa-plus mr-2"></i>
                    Add Social Media Link
                </button>
            </div>
            <div  className='bg-containerBg shadow-shadowColor max-w-[800px] p-4 shadow-md rounded-lg space-y-8'>   
                <div className='space-y-2'>
                    <h2 className="text-xl font-semibold ">Phone Number</h2>
                    {loadingPhone ? (
                        <div className="flex bg-red justify-center items-center p-2">
                            <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <PhoneForm phoneNumber={phoneNumber} onSubmit={handlePhoneNumberSubmit} />
                    )}
                </div>    
                <div className='space-y-2'>
                    <h2 className="text-xl font-semibold ">Email Address</h2>
                    {loadingEmail ? (
                        <div className="flex bg-red justify-center items-center p-2">
                            <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <EmailForm emailAddresse={emailAddresse} onSubmit={handleEmailSubmit} />
                    )}
                </div>    
                <div className='space-y-2'>
                    <h2 className="text-xl font-semibold ">Location Address</h2>
                    {loadingLocationAddress ? (
                        <div className="flex bg-red justify-center items-center p-2">
                            <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <LocationForm locationAddress={locationAddress} onSubmit={handleLocationSubmit} />
                    )}
                </div>      
                <div className='space-y-2'> 
                    <h2 className='text-xl font-semibold'>Social Media Links</h2>
                    {loadingSocialMedia ? (
                        <div className="flex bg-red justify-center items-center p-2">
                            <div className="animate-spin color-blue rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        socialMedias.length === 0 ? (
                            <p className='text-gray-500'>No social media links found.</p>
                        ) : (
                            <div className='overflow-x-auto '>
                                <table className=' text-center w-full border max-w-[800px] rounded-lg divide-y divide-gray-200 '>
                                    <thead className='bg-[#ebeef2]'>
                                        <tr>
                                            {
                                                ['Platform','Link','Actions'].map((header,i) => (
                                                    <th key={i} className='px-4 py-2 text-md text-tableHeaderBg text-text font-semibold   tracking-wider'>
                                                        {header}
                                                    </th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {socialMedias.map((link) => (
                                            <tr key={link.id}>
                                                <td className='p-2 font-semibold'>{link.platform}</td>
                                                <td className='p-2'>{link.link}</td>
                                                <td className='p-2'>
                                                    <button onClick={() => openModal(link)} className='bg-success m-[auto] flex items-center hover:bg-hoverSuccess text-btnText px-3 py-1 rounded'>Edit</button>
                                                    <button onClick={() => openDeleteModal(link.id)} className='bg-danger m-[auto] flex items-center hover:bg-hoverDanger text-btnText px-3 py-1 rounded'>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Social Media Link Modal */}
            {isModalOpen && (
                <div id='form'>
                    <FormBuilder
                        title={EditingLink ? 'Edit Social Media Link' : 'Add Social Media Link'}
                        fields={[
                            { name: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g., Facebook' },
                            { name: 'link', label: 'Link', type: 'text', placeholder: 'example facebook.com' }
                        
                        ]
                        }
                        schema={EditingLink ? updateSocialMediaSchema : addSocialMediaSchema}
                        initialData={EditingLink
                            ? (() => {
                                const { id: _, ...rest } = EditingLink;
                                return rest;
                            })()
                            : { platform: '', link: '' }
                        }
                        validationMode={EditingLink ? 'update' : 'create'}
                        onSubmit={handleSocialMediaSubmit}
                        onClose={closeModal}
                        useFormData={false}
                    />
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div>
                    <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <DeleteModal
                            message={`Are you sure you want to delete this social media link ?`}
                            onConfirm={handleDeleteConfirm}
                            onCancel={closeDeleteModal}
                        />
                    </div>
                </div>
            )}
        </div>
    )

}

function PhoneForm({phoneNumber,onSubmit}) {
     // form state
    const [phone, setPhone] = useState(phoneNumber || '');
    const [error, setError] = useState(null);

    // update phone when prop changes
    useEffect(() => {
        setPhone(phoneNumber || '');
    }, [phoneNumber]);

    // handle form submission
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await phoneSchema.validate({ phone_number: phone })
            onSubmit({ phone_number: phone });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} >
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input"
                    placeholder="Enter phone number"
                />
                <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    )
}
function EmailForm({emailAddresse,onSubmit}) {
        // form state
    const [email, setEmail] = useState(emailAddresse || '');
    const [error, setError] = useState(null);
    // update email when prop changes
    useEffect(() => {
        setEmail(emailAddresse || '');
    }, [emailAddresse]);
    // handle form submission
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await emailSchema.validate({ email: email })
            onSubmit({ email: email });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} >
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="Enter email address"
                />
                <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}

        </form>
    );
}
function LocationForm({locationAddress,onSubmit}) {
        // form state
    const [location, setLocation] = useState(locationAddress || '');
    const [error, setError] = useState(null);
    // update location when prop changes
    useEffect(() => {
        setLocation(locationAddress || '');
    }, [locationAddress]);
    // handle form submission
    const handleSubmit = async (e) => {
        try {
            e.preventDefault();
            await locationSchema.validate({ address: location })
            onSubmit({ address: location });
        } catch (err) {
            setError(err.message);
        }
    }
    return (
        <form onSubmit={handleSubmit} >
            <div className='flex flex-wrap items-center space-x-3'>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input"
                    placeholder="Enter location"
                />
                <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i>
                </button>
            </div>
            {error && <p className="text-danger text-sm mt-2">{error} <i className="fas fa-exclamation-circle"></i></p>}
        </form>
    );
}
export default Contact;