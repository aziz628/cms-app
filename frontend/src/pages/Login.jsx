import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth,AUTH_STATES } from '../context/AuthContext';
import authService from '../services/authService';
import { useNotification } from '../context/NotificationContext.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useTheme } from '../context/ThemeContext.jsx';



function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, authState } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { error: notifyError, success } = useNotification();
    const { theme, toggleTheme } = useTheme();

    // If user already logged in, redirect to dashboard
    useEffect(() => {
        if (authState === AUTH_STATES.AUTHENTICATED) {
            navigate('/dashboard');
            return;
        }
    }, [authState]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login({ username, password });

            login({ username: response?.username });
            // Redirect or update UI after successful login
            success('Login successful');
            navigate('/dashboard');
        } catch (err) {
            notifyError('An error occurred during login');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-bg'>
             {/* Theme Toggle Button */}
            <button 
                onClick={toggleTheme}
                className='absolute top-4 right-7 px-3 py-[2px] rounded bg-text shadow-xl text-containerBg hover:bg-text transition'
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
                <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xl`}></i>
            </button>

            {/* Login Form Container */}
            { // show loading spinner when checking auth state
            authState===AUTH_STATES.LOADING 
            ? <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
            : <div className='text-text bg-surface p-8 rounded-md shadow-xl w-full max-w-md'>
                <h1 className='text-2xl font-bold mb-6 text-center'>Gym cms Login</h1>
                {/* Login Form */}
                
                { // show spinner when submitting form
                loading
                    ?  <LoadingSpinner />
                    :
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className='mb-4'>
                                <label className='block mb-2 font-medium' htmlFor='username'>
                                    Username
                                </label>
                                <input 
                                    type='text' 
                                    id='username' 
                                    className='input w-full ' 
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
                                    className='input w-full ' 
                                    value={password} 
                                    type ={showPassword ? "text" : "password"}
                                    onChange={(e) => setPassword(e.target.value)} 
                                    required 
                                />
                                {/* switch the eye icon when clicked */}
                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}  absolute right-2 top-[calc(50%-9px)] cursor-pointer`} 
                                onClick={() => setShowPassword(!showPassword)}></i>
                                </div>
                            </div>
                            <button type='submit' className='w-full bg-primary text-btnText p-2 rounded hover:bg-hoverPrimary transition' disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                            
                        </form>
                    </>
                }
            </div>
            
            }

        </div>
    );
}

export default Login;