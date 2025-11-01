import { useState,useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import {passwordSchema,usernameSchema } from "../validation/schemas/SettingSchema.js";
import settingService from "../services/settingService.js"
import { useNotification } from "../context/NotificationContext.jsx";

/*
import FormBuilder from '../components/common/FormBuiler.jsx';
import { useBodyOverflow } from "../utils/tools.js";

*/

function Setting() {
  const [username, setUsername] = useState('');;
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useNotification();

  useEffect( ()=>{
    // get user from local storage
    const user = JSON.parse(localStorage.getItem('user') );

    if (user) {
      setUsername(user.username);
    }
  }, [] );

  async function handleUsernameUpdate(username) {
    try{
      await usernameSchema.validate({ username });
      await settingService.updateUsername(username);
      success('Username updated successfully');
      setUsername(username);
      localStorage.setItem('user', JSON.stringify({username}));
    }catch(err){
      error('Failed to update username');
      console.error(err);
    }
  }
  async function handlePasswordUpdate(password) {
    try{
      await passwordSchema.validate({ password });
      await settingService.updatePassword(password);
      success('Password updated successfully');
    }catch(err){
      error('Failed to update password');
      console.error(err);
    }
  }

  return (
  <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
      </div>
      {// container for updating username and password
      }
        <div className=" bg-bg max-w-[800px] p-4 shadow-md shadow-shadowColor rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Update credentials</h2>
          <div className=" space-y-3">
            <UserForm Username={username} onSubmit={handleUsernameUpdate} />
            <PasswordForm  onSubmit={handlePasswordUpdate} />
          </div>
       </div>
       {// theme toggle
       }
       <div className="mt-4 flex space-x-5 bg-bg max-w-[800px] p-4 shadow-md shadow-shadowColor rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Theme</h2>
              <button type="button" onClick={toggleTheme} 
              className={`flex-start border-gray-300 border-2 duration-300 ${theme === 'dark' ? 'bg-gradient-to-r from-slate-800 to-slate-900 ' : 'bg-gradient-to-r from-blue-100 to-blue-50 '} shadow-md w-20 px-2 py-[5px] rounded-3xl flex  items-center `}>
                  <div className={`w-7 transition-all duration-200 flex items-center justify-center shadow-md rounded-full min-w-5 h-7 ${theme === 'dark' ? 'bg-slate-100 translate-x-[36px]':'bg-yellow-100'}`}><i className={`fa-solid ${theme === 'dark' ? 'fa-moon text-black' :'fa-sun text-yellow-600'  }`}></i></div>
              </button>
            
        </div>

  </div>
  )
}
function UserForm({ Username, onSubmit }) {
  const [username, setUsername] = useState(Username);
  const [usernameError, setUsernameError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect( ()=>{
    setUsername(Username);
  }, [Username] );

  async function submit(e){
    try{
      e.preventDefault();
      setIsLoading(true);
      setUsernameError('');
      await usernameSchema.validate({ username });
      onSubmit(username);
    }catch(err){
      setUsernameError(err.message);
      return false;
    }finally{
      setIsLoading(false);
    }
  }
  return (
    <form onSubmit={submit}>
        <label className="block text-sm font-medium mb-1" htmlFor="username">Username</label>
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex space-x-2">
            <input type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input " />
            <button type="submit" className="btn-primary">
                <i className="fa-solid fa-save "></i>
            </button>
          </div>
        )}
        {usernameError && <p className="text-danger text-sm">{usernameError} <i class="fa-solid fa-circle-exclamation"></i></p>}
    </form>
  )
}
function PasswordForm({onSubmit }) {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function submit(e){
    try{
     e.preventDefault();
     setIsLoading(true);
     setPasswordError('');
     await passwordSchema.validate({ password });
    onSubmit(password);
    setPassword('');
    }catch(err){
      setPasswordError(err.message);
    }finally{
      setIsLoading(false);
    }
  }
  return (
    <form onSubmit={submit}>
        <label className="block text-sm font-medium mb-1" htmlFor="password">Password</label>
        {isLoading ? (
          <div className="flex bg-red justify-center items-center p-4">
              <div className="animate-spin color-blue rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          ) : (
              <div className="flex space-x-2">
                <input type="password"
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  className="input" />
                  <button type="submit" className="btn-primary">
                      <i className="fa-solid fa-save"></i>
                  </button>
                  {passwordError && <p className="text-danger text-sm">{passwordError} <i className="fa-solid fa-circle-exclamation"></i></p>}
              </div>
            )
        }

    </form>
  )
    }
export default  Setting;