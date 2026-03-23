import { Category, Priority } from './types';

const categoryKeywords: Record<Category, string[]> = {
  Infrastructure: ['building', 'room', 'door', 'window', 'ceiling', 'floor', 'wall', 'plumbing', 'electricity', 'power', 'light', 'fan', 'ac', 'air conditioning', 'lift', 'elevator', 'parking', 'road', 'toilet', 'bathroom', 'washroom', 'water', 'leak', 'broken', 'damage', 'repair', 'maintenance', 'construction'],
  Academic: ['syllabus', 'curriculum', 'exam', 'result', 'grade', 'marks', 'attendance', 'lecture', 'class', 'schedule', 'timetable', 'faculty', 'teacher', 'professor', 'assignment', 'project', 'semester', 'course', 'subject', 'evaluation'],
  IT: ['computer', 'laptop', 'projector', 'wifi', 'internet', 'network', 'software', 'hardware', 'printer', 'server', 'email', 'password', 'login', 'system', 'website', 'portal', 'erp', 'lms', 'screen', 'monitor', 'mouse', 'keyboard'],
  Administrative: ['fee', 'payment', 'certificate', 'document', 'id card', 'admission', 'registration', 'scholarship', 'hostel', 'mess', 'canteen', 'transport', 'bus', 'office', 'clerk', 'staff', 'process', 'form', 'application'],
  Hostel: ['hostel', 'dormitory', 'room', 'roommate', 'warden', 'mess', 'food', 'curfew', 'visitor', 'laundry', 'bed', 'mattress', 'furniture'],
  Library: ['library', 'book', 'journal', 'reference', 'borrow', 'return', 'fine', 'catalog', 'reading', 'study room', 'digital', 'e-book', 'database'],
  Laboratory: ['lab', 'laboratory', 'equipment', 'chemical', 'reagent', 'experiment', 'apparatus', 'instrument', 'microscope', 'safety', 'goggles', 'gloves'],
  Other: [],
};

const highPriorityKeywords = ['urgent', 'emergency', 'critical', 'immediate', 'dangerous', 'hazard', 'safety', 'fire', 'flood', 'injury', 'accident', 'broken', 'not working', 'shutdown', 'outage', 'security', 'threat', 'collapsed', 'electric shock', 'gas leak'];
const mediumPriorityKeywords = ['delay', 'slow', 'issue', 'problem', 'complaint', 'pending', 'waiting', 'overdue', 'inconvenience', 'malfunction', 'faulty', 'damaged', 'poor', 'missing', 'unavailable'];

export function classifyComplaint(text: string): { category: Category; priority: Priority; keywords: string[]; suggestion: string } {
  const lower = text.toLowerCase();

  // Category detection
  let bestCategory: Category = 'Other';
  let bestScore = 0;
  const foundKeywords: string[] = [];

  for (const [cat, words] of Object.entries(categoryKeywords) as [Category, string[]][]) {
    let score = 0;
    for (const w of words) {
      if (lower.includes(w)) { score++; foundKeywords.push(w); }
    }
    if (score > bestScore) { bestScore = score; bestCategory = cat; }
  }

  // Priority detection
  let priority: Priority = 'low';
  let highScore = 0;
  let medScore = 0;
  for (const w of highPriorityKeywords) { if (lower.includes(w)) highScore++; }
  for (const w of mediumPriorityKeywords) { if (lower.includes(w)) medScore++; }
  if (highScore > 0) priority = 'high';
  else if (medScore > 0) priority = 'medium';

  // Unique keywords
  const uniqueKeywords = [...new Set(foundKeywords)].slice(0, 6);
  if (uniqueKeywords.length === 0) {
    const words = lower.split(/\s+/).filter(w => w.length > 4).slice(0, 3);
    uniqueKeywords.push(...words);
  }

  // Suggestion
  const suggestion = generateSuggestion(bestCategory, priority, lower);

  return { category: bestCategory, priority, keywords: uniqueKeywords, suggestion };
}

function generateSuggestion(category: Category, priority: Priority, text: string): string {
  const suggestions: Record<Category, string[]> = {
    Infrastructure: ['Submit a maintenance request to the facilities department.', 'Contact the building maintenance team for immediate inspection.', 'Report to the campus infrastructure helpdesk with location details.'],
    Academic: ['Reach out to the Head of Department for academic concerns.', 'Contact the academic office for syllabus or examination queries.', 'Schedule a meeting with your course coordinator.'],
    IT: ['Raise a ticket with the IT helpdesk for technical support.', 'Contact the IT department for hardware/software issues.', 'Check if the issue persists after restarting the device.'],
    Administrative: ['Visit the administrative office during working hours.', 'Submit the required documents to the concerned department.', 'Follow up with the administrative staff for status updates.'],
    Hostel: ['Report to the hostel warden immediately.', 'Submit a written complaint to the hostel administration.', 'Contact the hostel maintenance team.'],
    Library: ['Speak with the librarian about your concern.', 'Check the library portal for digital resource access.', 'Submit a request form at the library front desk.'],
    Laboratory: ['Inform the lab instructor or technician.', 'Report safety concerns to the lab safety officer.', 'Submit an equipment request to the department.'],
    Other: ['Contact the general helpdesk for assistance.', 'Submit details to the appropriate department.', 'Reach out to the student/faculty welfare committee.'],
  };
  const pool = suggestions[category];
  if (priority === 'high') return 'URGENT: ' + pool[1] + ' This requires immediate attention.';
  return pool[Math.floor(Math.random() * pool.length)];
}

export function chatbotClassify(messages: string[]): string {
  const combined = messages.join(' ');
  const result = classifyComplaint(combined);
  return `Based on my analysis:\n\n📂 **Category:** ${result.category}\n⚡ **Priority:** ${result.priority.toUpperCase()}\n🔑 **Keywords:** ${result.keywords.join(', ')}\n💡 **Suggestion:** ${result.suggestion}\n\nWould you like me to submit this complaint?`;
}
