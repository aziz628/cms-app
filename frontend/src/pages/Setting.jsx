import { useState,useEffect } from "react";
import settingService from "../services/settingService.js"
import FormBuilder from '../components/common/FormBuiler.jsx';
import { createSettingSchema, updateSettingSchema } from "../validation/schemas/settingSchema.js";
import { useNotification } from "../context/NotificationContext.jsx";
import { useBodyOverflow } from "../utils/tools.js";

// setting page 
// tab for contact info and a tab for opening hours and  about info

//   one input field for about summary
//  and a dynamic list for business hours with add, edit, delete functionality
// the page gonna have one input field for address, phone number, email
// and a dynamic list for social media links with add, edit, delete functionality

function Setting() {
    const [info, setInfo] = useState({
    about_summary: '',
    business_hours: []
  });
  const [contactInfo, setContactInfo] = useState({
    address: '',
    phone_number: '',
    email: '',
    social_media_links: []
  });
  
}