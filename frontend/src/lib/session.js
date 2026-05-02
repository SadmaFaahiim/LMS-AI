const SESSION_KEY = 'lms_session';

export function loginTeacher() {
  const session = {
    role: 'teacher',
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function loginStudent(studentName) {
  const session = {
    role: 'student',
    studentName,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession() {
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr);
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function requireTeacherRole() {
  const session = getSession();
  if (!session || session.role !== 'teacher') {
    window.location.href = '/';
    return null;
  }
  return session;
}

export function requireStudentRole() {
  const session = getSession();
  if (!session || session.role !== 'student') {
    window.location.href = '/';
    return null;
  }
  return session;
}

export function isLoggedIn() {
  return getSession() !== null;
}
