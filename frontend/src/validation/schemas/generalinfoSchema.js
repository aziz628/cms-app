import * as yup from "yup";
import {createChangeDetection} from "../validationRules"

export const aboutSchema = yup.object({
  about_summary: yup.string()
  .min(10, "About summary must be at least 10 characters")
  .max(1000, "About summary cannot exceed 1000 characters")
  .required("About summary is required")
  
});

const baseBusinessHourSchema = {
  day: yup.string().required("Day is required"),
  open_time: yup.string().matches(/^\d{2}:\d{2}$/, "Open time must be in HH:MM format"),
  close_time: yup.string()
  .matches(/^\d{2}:\d{2}$/, "Close time must be in HH:MM format")
  .test('is-after', 'End time must be 30 minutes after start time', function(value) {
      const { open_time } = this.parent;
      if (!open_time || !value) return true;

      try {
        const [startHour, startMin] = open_time.split(':').map(Number);
        const [endHour, endMin] = value.split(':').map(Number);
        
        // Validate format
        if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
          return false;
        }
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        return endMinutes - startMinutes > 30; // At least 30 minutes later
      } catch {
        return false;
      }
  })
};

export const createBusinessHourSchema = yup.object({
  day: baseBusinessHourSchema.day.required("Day is required"),
  open_time: baseBusinessHourSchema.open_time.required("Open time is required"),
  close_time: baseBusinessHourSchema.close_time.required("Close time is required"),
});
export const updateBusinessHourSchema = yup.object(baseBusinessHourSchema).test('hasChanges',
  'No changes detected',
  createChangeDetection([
    {name:"day"},
    {name:"open_time"},
    {name:"close_time"},
  ]));