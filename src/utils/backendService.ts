/**
 * Deltaclause Intelligent Academy - Backend API Connection Layer
 * Connects the React front-end directly to the Spring Boot JPA + Redis + JWT Secure Backend
 */

// Determine secure production-ready dynamic backend URL
export const BACKEND_URL = ((import.meta as any).env?.VITE_API_URL as string) || 
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')
    ? window.location.origin 
    : 'http://localhost:8080');

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: string;
  points: number;
  referralCode: string;
}

/**
 * Checks if the Spring Boot server is online.
 */
export async function checkBackendStatus(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Attempt simple unauthenticated catalog poll
    const response = await fetch(`${BACKEND_URL}/api/internships/catalog`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    return false;
  }
}

/**
 * Fetches the dynamic catalog from the Spring Boot backend with automatic week-to-month calculation mapping.
 */
export async function fetchCatalogFromBackend(): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/internships/catalog`, {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        durationMonths: item.durationMonths || (item.durationWeeks ? Math.max(1, Math.round(item.durationWeeks / 4)) : 2),
        taskSheetName: item.taskSheetName,
        taskSheetPdfUrl: item.taskSheetPdfUrl,
        category: item.category || 'Software Engineering',
        enrolledCount: item.enrolledCount || 0
      }));
    }
  } catch (err) {
    console.warn('Backend catalog retrieval offline:', err);
  }
  return [];
}

/**
 * Initiates Phase 1: requests email verification code (OTP cached in Redis)
 */
export async function requestSignUpOtp(email: string, name: string, referralCode?: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup/otp-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, referralCode: referralCode || '' })
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || 'Failed to dispatch verification code.');
    }
    return { message: text };
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Connection refused: Spring Boot security server at port 8080 is unreachable. Please ensure your backend application is booted.');
    }
    throw err;
  }
}

/**
 * Initiates Phase 2: validates OTP and registers student in MySQL via Hibernate
 */
export async function verifySignUpOtp(email: string, code: string, name: string, referralCode?: string, password?: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup/otp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, name, referralCode: referralCode || '', password: password || '' })
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || json.error || 'Invalid OTP code entered.');
    }
    return json as AuthResponse;
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Connection refused: Spring Boot security server at port 8080 is unreachable. Please ensure your backend application is booted.');
    }
    throw err;
  }
}

/**
 * Regular Sign In verifying credentials against Spring Security database checks
 */
export async function signInBackend(email: string, pass: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    if (!response.ok) {
      const text = await response.text();
      let parsedError = 'Clearance rejected. Please verify email and security credentials.';
      try {
        const errorJson = JSON.parse(text);
        parsedError = errorJson.message || errorJson.error || parsedError;
      } catch (e) {
        if (text) parsedError = text;
      }
      throw new Error(parsedError);
    }

    return await response.json() as AuthResponse;
  } catch (err: any) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('Failed to connect'))) {
      throw new Error('Connection refused: Spring Boot security server at port 8080 is unreachable. Please ensure your backend application is booted.');
    }
    throw err;
  }
}

/**
 * Saves a new internship on the Spring Boot backend
 */
export async function createInternshipOnBackend(internship: any): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/internships/admin/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: internship.id,
        title: internship.title,
        description: internship.description,
        price: internship.price,
        durationMonths: internship.durationMonths,
        taskSheetName: internship.taskSheetName,
        taskSheetPdfUrl: internship.taskSheetPdfUrl,
        category: internship.category,
        enrolledCount: internship.enrolledCount || 0
      })
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend internship sync offline:', err);
  }
  return null;
}

/**
 * Triggers enrollment evaluation on the Spring Boot backend, sending dynamic emails (Offer Letter / Certificate)
 */
export async function evaluateEnrollmentOnBackend(
  id: string,
  status: string,
  adminNotes?: string,
  certificateId?: string
): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const params = new URLSearchParams();
    params.append('status', status);
    if (adminNotes) params.append('adminNotes', adminNotes);
    if (certificateId) params.append('certificateId', certificateId);

    const response = await fetch(`${BACKEND_URL}/api/enrollments/admin/${id}/evaluate?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend evaluation sync offline:', err);
  }
  return null;
}

/**
 * Request Password Reset OTP from Spring Boot backend (Phase 1)
 */
export async function requestForgotPasswordOtp(email: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password/otp-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const text = await response.text();
    if (!response.ok) {
      // Decode error if JSON
      let errMsg = text;
      try {
        const errorJson = JSON.parse(text);
        errMsg = errorJson.message || errorJson.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg || 'Failed to request password reset OTP.');
    }
    return { message: text };
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Connection refused: Spring Boot security server at port 8080 is unreachable. Please ensure your backend application is booted.');
    }
    throw err;
  }
}

/**
 * Reset Password using OTP verify on Spring Boot backend (Phase 2)
 */
export async function resetPasswordWithOtp(email: string, code: string, newPassword: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password/otp-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });

    const text = await response.text();
    if (!response.ok) {
      // Decode error if JSON
      let errMsg = text;
      try {
        const errorJson = JSON.parse(text);
        errMsg = errorJson.message || errorJson.error || errMsg;
      } catch (e) {}
      throw new Error(errMsg || 'Failed to reset password. Please check the code.');
    }
    return { message: text };
  } catch (err: any) {
    if (err.message && err.message.includes('Failed to fetch')) {
      throw new Error('Connection refused: Spring Boot security server at port 8080 is unreachable. Please ensure your backend application is booted.');
    }
    throw err;
  }
}

/**
 * Sends a new enrollment request to the backend.
 */
export async function applyForProgram(enrollment: any): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/enrollments/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: enrollment.id,
        internshipId: enrollment.internshipId,
        studentName: enrollment.studentName,
        studentEmail: enrollment.studentEmail,
        status: enrollment.status,
        durationMonths: enrollment.durationMonths,
        transactionId: enrollment.transactionId,
        paymentScreenshotUrl: enrollment.paymentScreenshotUrl,
        studentPhone: enrollment.studentPhone,
        qualification: enrollment.qualification,
        collegeName: enrollment.collegeName,
        domainApplied: enrollment.domainApplied,
        agreedToPhases: enrollment.agreedToPhases,
        agreedToPayment: enrollment.agreedToPayment
      })
    });

    if (response.ok) {
      return await response.json();
    } else {
      const text = await response.text();
      console.warn('Backend enrollment creation warning:', text);
    }
  } catch (err) {
    console.warn('Backend applyForProgram offline:', err);
  }
  return null;
}

/**
 * Fetches current user's enrollments from Spring Boot or mock backend
 */
export async function fetchMyEnrollments(): Promise<any[]> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return [];

  try {
    const response = await fetch(`${BACKEND_URL}/api/enrollments/my`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend fetchMyEnrollments offline:', err);
  }
  return [];
}

/**
 * Submits work project milestone link to backend.
 */
export async function submitMilestoneOnBackend(
  enrollmentId: string,
  submissionUrl: string,
  submissionNote: string
): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/enrollments/${enrollmentId}/submit?submissionUrl=${encodeURIComponent(submissionUrl)}&submissionNote=${encodeURIComponent(submissionNote)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend submit milestone offline:', err);
  }
  return null;
}

/**
 * Verifies certificate validity against dynamic backend certificates registry
 */
export async function verifyCertificateOnBackend(certificateId: string): Promise<any> {
  try {
    const cleanId = certificateId.trim().toUpperCase();
    const response = await fetch(`${BACKEND_URL}/api/certificates/verify/${encodeURIComponent(cleanId)}`, {
      method: 'GET'
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend verifyCertificate offline:', err);
  }
  return null;
}

// --- SUPPORT TICKETS API SERVICE ---

export async function fetchTicketsOnBackend(): Promise<any[]> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return [];
  const role = localStorage.getItem('dc_user_role');

  try {
    const endpoint = role === 'ROLE_ADMIN' ? '/api/tickets/all' : '/api/tickets/my';
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend fetchTickets offline:', err);
  }
  return [];
}

export async function createTicketOnBackend(subject: string, message: string): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/tickets/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ subject, message })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend createTicket offline:', err);
  }
  return null;
}

export async function replyToTicketOnBackend(ticketId: string, message: string, sender?: string): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, sender })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend replyToTicket offline:', err);
  }
  return null;
}

export async function resolveTicketOnBackend(ticketId: string, replyMessage?: string): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/tickets/${ticketId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ replyMessage })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend resolveTicket offline:', err);
  }
  return null;
}


// --- REFERRALS API SERVICE ---

export async function fetchReferralsOnBackend(): Promise<any[]> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return [];
  const role = localStorage.getItem('dc_user_role');

  try {
    const endpoint = role === 'ROLE_ADMIN' ? '/api/referrals/all' : '/api/referrals/my';
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend fetchReferrals offline:', err);
  }
  return [];
}

export async function addReferralOnBackend(referrerEmail: string, referredEmail: string, referredName: string): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/referrals/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ referrerEmail, referredEmail, referredName })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend addReferral offline:', err);
  }
  return null;
}

export async function updateReferralActionOnBackend(id: string, status?: string, rewardClaimed?: boolean): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/referrals/${id}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status, rewardClaimed })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend updateReferralAction offline:', err);
  }
  return null;
}


// --- ANNOUNCEMENTS API SERVICE ---

export async function fetchAnnouncementsOnBackend(): Promise<any[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/announcements/all`, {
      method: 'GET'
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend fetchAnnouncements offline:', err);
  }
  return [];
}

export async function createAnnouncementOnBackend(announcement: any): Promise<any> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return null;

  try {
    const response = await fetch(`${BACKEND_URL}/api/announcements/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        id: announcement.id,
        title: announcement.title,
        message: announcement.message,
        targetInternshipId: announcement.targetInternshipId,
        targetDuration: announcement.targetDuration,
        badge: announcement.badge
      })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Backend createAnnouncement offline:', err);
  }
  return null;
}

export async function deleteAnnouncementOnBackend(id: string): Promise<boolean> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (err) {
    console.warn('Backend deleteAnnouncement offline:', err);
  }
  return false;
}


// --- REFUND THRESHOLD SETTING ---

export async function fetchRefundThresholdOnBackend(): Promise<number | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/refund-threshold`, {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      return data.refundThreshold;
    }
  } catch (err) {
    console.warn('Backend fetchRefundThreshold offline:', err);
  }
  return null;
}

export async function updateRefundThresholdOnBackend(threshold: number): Promise<boolean> {
  const token = localStorage.getItem('dc_bearer_token');
  if (!token) return false;

  try {
    const response = await fetch(`${BACKEND_URL}/api/settings/refund-threshold`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ threshold })
    });
    return response.ok;
  } catch (err) {
    console.warn('Backend updateRefundThreshold offline:', err);
  }
  return false;
}



