// src/validation/schemas/scheduleSchema.js
import * as yup from 'yup';
import { createChangeDetection } from '../validationRules';

// Days of the week
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Time validation helper - checks if time is in HH:MM format
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// Base field definitions for schedule sessions
const baseScheduleFields = {
  class_id: yup.number()
    .positive('Please select a class')
    .integer('Invalid class selection'),
  
  day_of_week: yup.string()
    .oneOf(DAYS, 'Please select a valid day'),
  
  start_time: yup.string()
    .matches(timeRegex, 'Start time must be in HH:MM format')
    .required('Start time is required'),
  
  end_time: yup.string()
    .matches(timeRegex, 'End time must be in HH:MM format')
    .required('End time is required')
    .test('is-after', 'End time must be 30 minutes after start time', function(value) {
      const { start_time } = this.parent;
      if (!start_time || !value) return true;
      
      try {
        const [startHour, startMin] = start_time.split(':').map(Number);
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

// Schema for creating a new session - all required
export const createScheduleSchema = yup.object({
  class_id: baseScheduleFields.class_id.required('Class is required'),
  day_of_week: baseScheduleFields.day_of_week.required('Day is required'),
  start_time: baseScheduleFields.start_time,
  end_time: baseScheduleFields.end_time
});

// Schema for updating a session
export const updateScheduleSchema = yup.object({
  class_id: baseScheduleFields.class_id,
  day_of_week: baseScheduleFields.day_of_week,
  start_time: baseScheduleFields.start_time,
  end_time: baseScheduleFields.end_time
}).test(
  'hasChanges',
  'No changes detected',
  createChangeDetection([
    { name: 'class_id', type: 'number' },
    { name: 'day_of_week', type: 'text' },
    { name: 'start_time', type: 'text' },
    { name: 'end_time', type: 'text' }
  ])
);
