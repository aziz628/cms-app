// src/validation/schemas/scheduleSchema.js
import * as yup from 'yup';
import { createChangeDetection } from '../validationRules';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Time format validation (HH:MM)
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

const scheduleBaseFields = {
  day: yup.string()
    .oneOf(daysOfWeek, 'Please select a valid day of the week')
    .required('Day is required'),
    
  class_name: yup.string()
    .min(2, 'Class name must be at least 2 characters')
    .max(50, 'Class name must be at most 50 characters'),
    
  instructor: yup.string()
    .min(2, 'Instructor name must be at least 2 characters')
    .max(50, 'Instructor name must be at most 50 characters'),
    
  start_time: yup.string()
    .matches(timeRegex, 'Start time must be in 24-hour format (HH:MM)'),
    
  end_time: yup.string()
    .matches(timeRegex, 'End time must be in 24-hour format (HH:MM)')
    .test('is-after-start', 'End time must be after start time', function(endTime) {
      const { start_time } = this.parent;
      if (!start_time || !endTime) return true; // Skip validation if either field is missing
      return endTime > start_time;
    })
};

export const createScheduleSchema = yup.object({
  day: scheduleBaseFields.day,
  class_name: scheduleBaseFields.class_name.required('Class name is required'),
  instructor: scheduleBaseFields.instructor.required('Instructor name is required'),
  start_time: scheduleBaseFields.start_time.required('Start time is required'),
  end_time: scheduleBaseFields.end_time.required('End time is required')
});

export const updateScheduleSchema = yup.object(scheduleBaseFields)
  .test(
    'hasChanges',
    'No changes detected',
    createChangeDetection([
      { name: 'day' },
      { name: 'class_name' },
      { name: 'instructor' },
      { name: 'start_time' },
      { name: 'end_time' }
    ])
  );