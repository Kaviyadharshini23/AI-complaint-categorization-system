export type Role = 'faculty' | 'student' | 'admin';
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'resolved';
export type Category = 'Infrastructure' | 'Academic' | 'IT' | 'Administrative' | 'Hostel' | 'Library' | 'Laboratory' | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department?: string;
  password: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userRole: 'faculty' | 'student';
  department: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: Status;
  keywords: string[];
  suggestion: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  complaintId?: string;
  createdAt: string;
}
