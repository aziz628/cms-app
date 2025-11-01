import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { useNotification } from '../context/NotificationContext.jsx';
function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { error: notifyError, success } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login({ username, password });
            console.log('Login response:', response);
            login({ username: response.username });
            // Redirect or update UI after successful login
            success('Login successful');
            navigate('/');
        } catch (error) {
            notifyError('An error occurred during login');
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className='text-black bg-white p-8 rounded shadow-md w-full max-w-md'>
                <h1 className='text-2xl font-bold mb-6 text-center'>Gym cms Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
                        <label className='block mb-2 font-medium' htmlFor='username'>
                            Username
                        </label>
                        <input 
                            type='text' 
                            id='username' 
                            className='w-full p-2 border text-black rounded' 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className='mb-6'>
                        <label className='block mb-2 font-medium' htmlFor='password'>Password</label>
                        <div className='relative'>
                        <input 
                            id='password' 
                            className='w-full p-2 border  rounded' 
                            value={password} 
                            type ={showPassword ? "text" : "password"}
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                        {/* switch the eye icon when clicked */}
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} absolute right-2 top-[calc(50%-9px)] cursor-pointer`} 
                        onClick={() => setShowPassword(!showPassword)}></i>
                        </div>
                    </div>
                    <button type='submit' className='w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition' disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    
                </form>
                <div className='mt-4 text-center'>
                    <a href='#' className='text-blue-600 hover:underline'>Forgot Password?</a>
                </div>
            </div>

        </div>
    );
}

export default Login;