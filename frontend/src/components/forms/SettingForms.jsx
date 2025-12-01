import  { useState, useEffect } from 'react';
import { usernameSchema, passwordSchema } from '../../validation/schemas/SettingSchema.js';

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
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
export { UserForm, PasswordForm };