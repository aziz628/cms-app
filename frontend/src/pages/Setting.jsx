import { useState,useEffect } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import {passwordSchema,usernameSchema } from "../validation/schemas/SettingSchema.js";
import settingService from "../services/settingService.js"
import { useNotification } from "../context/NotificationContext.jsx";
import { UserForm, PasswordForm } from "../components/forms/SettingForms.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Setting() {
  const [username, setUsername] = useState('');
  const { theme, toggleTheme } = useTheme();
  const { success, error } = useNotification();
  const { user } = useAuth();

  useEffect( ()=>{
    // set initial username (only when logged in)
    if (user) {
      setUsername(user?.username);
    }
  }, [user] );

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
              className={`flex-start border-borderColor border-2 duration-300 ${theme === 'dark' ? 'bg-gradient-to-r from-slate-800 to-slate-900 ' : 'bg-gradient-to-r from-blue-100 to-blue-50 '} shadow-md w-20 px-2 py-[5px] rounded-3xl flex  items-center `}>
                 
                  {/* toggle button icon */}
                  <div className={`w-7 transition-all duration-200 flex items-center justify-center shadow-md rounded-full min-w-5 h-7 ${theme === 'dark' ? 'bg-slate-100 translate-x-[36px]':'bg-yellow-100'}`}>
                    <i className={`fa-solid ${theme === 'dark' ? 'fa-moon text-bg' :'fa-sun text-warning'  }`}></i>
                  </div>

              </button>
        </div>

  </div>
  )
}

export default  Setting;