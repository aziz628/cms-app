import { useState, useEffect } from 'react';
import { phoneSchema, emailSchema, locationSchema} from '../../validation/schemas/ContactSchema.js';

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
export {PhoneForm,EmailForm,LocationForm};