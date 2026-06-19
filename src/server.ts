import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { INITIAL_INTERNSHIPS, PRELOADED_ENROLLMENTS, PRELOADED_CERTIFICATES, PRELOADED_REFERRALS, PRELOADED_TICKETS, PRELOADED_ANNOUNCEMENTS } from "./src/data.js";

async function startServer() {
  const app = express();
  app.use(express.json());

  const PORT = 3000;

  // --- IN-MEMORY DATABASE STATE ---
  // Users Store: Initiated with defaults
  const users = new Map<string, any>([
    [
      "rahulguptandless@gmail.com",
      {
        email: "rahulguptandless@gmail.com",
        name: "Rahul Gupta",
        password: "rahul123", // Hashes not required for simple fallback
        role: "ROLE_ADMIN",
        referralCode: "rahul123",
        points: 0,
      }
    ],
    [
      "vidolve@gmail.com",
      {
        email: "vidolve@gmail.com",
        name: "Vikas Sharma",
        password: "vikas123",
        role: "ROLE_STUDENT",
        referralCode: "vidolve@gmail.com",
        points: 350,
      }
    ]
  ]);

  // Internships, Enrollments, Certificates, Referrals, Tickets, Announcements local store
  const internships = [...INITIAL_INTERNSHIPS];
  const enrollments = [...PRELOADED_ENROLLMENTS];
  const certificates = [...PRELOADED_CERTIFICATES];
  const referrals = [...PRELOADED_REFERRALS];
  const tickets = [...PRELOADED_TICKETS];
  const announcements = [...PRELOADED_ANNOUNCEMENTS];
  let refundThreshold = 3;

  // OTP Map (email -> { code, type, name, referralCode, password })
  const otpMap = new Map<string, any>();

  // Helper helper to generate random 6-digit OTP
  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Helper helper to mock authentication based on Bearer token
  const getPrincipalFromToken = (req: express.Request): any => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Format is mock-token-<email>
      if (token.startsWith("mock-token-")) {
        const email = token.replace("mock-token-", "");
        return users.get(email.trim().toLowerCase()) || null;
      }
    }
    return null;
  };

  // --- API BACKEND ROUTES ---

  // Auth Status check
  app.get("/api/internships/catalog", (req, res) => {
    res.json(internships);
  });

  // Request Signup OTP (Phase 1)
  app.post("/api/auth/signup/otp-request", (req, res) => {
    const { email, name, referralCode } = req.body;
    if (!email || !name) {
      return res.status(400).send("Error: Name and email are required fields.");
    }
    const cleanEmail = email.trim().toLowerCase();

    if (users.has(cleanEmail)) {
      return res.status(400).send("Error: Email is already registered in our directory.");
    }

    const otp = generateOTP();
    otpMap.set(cleanEmail, { code: otp, name, referralCode, type: "signup" });

    // Print OTP in large bold status banner in console so user can grab it
    console.log(`\n============== [OTP DISPATCHED] ==============`);
    console.log(`✉️  EMAIL  : ${cleanEmail}`);
    console.log(`🔑 OTP    : ${otp}`);
    console.log(`👤 STUDENT: ${name}`);
    console.log(`==============================================\n`);

    res.send(`Verification passcode officially sent to ${cleanEmail}`);
  });

  // Verify Signup OTP (Phase 2)
  app.post("/api/auth/signup/otp-verify", (req, res) => {
    const { email, code, name, referralCode, password } = req.body;
    if (!email || !code || !name) {
      return res.status(400).json({ error: "Missing required OTP registration fields." });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cached = otpMap.get(cleanEmail);

    if (!cached || cached.code !== code.trim() || cached.type !== "signup") {
      return res.status(401).json({ error: "Error: The verification code entered is invalid or has expired." });
    }

    // Register user row
    const userRole = "ROLE_STUDENT"; // Default new user role
    const newUser = {
      email: cleanEmail,
      name: name.trim(),
      password: password || "student123", // Default fallback if empty
      role: userRole,
      referralCode: cleanEmail.split("@")[0] + Math.floor(100 + Math.random() * 900),
      points: referralCode ? 100 : 0 // Bonus points if referred
    };

    users.set(cleanEmail, newUser);
    otpMap.delete(cleanEmail);

    // Create active simulation token
    const token = `mock-token-${cleanEmail}`;

    res.json({
      token,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      points: newUser.points,
      referralCode: newUser.referralCode,
    });
  });

  // Sign In verification
  app.post("/api/auth/signin", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required parameters." });
    }
    const formattedEmail = email.trim().toLowerCase();

    // 1. Core Default Admin clearances check
    if (formattedEmail === "rahulguptandless@gmail.com" && password === "rahul123") {
      const token = "mock-token-admin";
      return res.json({
        token: "mock-token-rahulguptandless@gmail.com",
        email: "rahulguptandless@gmail.com",
        name: "Rahul Gupta",
        role: "ROLE_ADMIN",
        points: 0,
        referralCode: "rahul123"
      });
    }

    // 2. Preloaded Student clearance
    if (formattedEmail === "vidolve@gmail.com" && password === "vikas123") {
      return res.json({
        token: "mock-token-vidolve@gmail.com",
        email: "vidolve@gmail.com",
        name: "Vikas Sharma",
        role: "ROLE_STUDENT",
        points: 350,
        referralCode: "vidolve@gmail.com"
      });
    }

    // 3. Look up registered student row
    const user = users.get(formattedEmail);
    if (user && user.password === password) {
      return res.json({
        token: `mock-token-${formattedEmail}`,
        email: user.email,
        name: user.name,
        role: user.role,
        points: user.points,
        referralCode: user.referralCode
      });
    }

    res.status(401).send("Error: Access Clearance Rejected. Please verify email and security credentials.");
  });

  // Request Forgotten Password Reset OTP
  app.post("/api/auth/forgot-password/otp-request", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send("Error: Email is required.");
    }
    const cleanEmail = email.trim().toLowerCase();

    if (!users.has(cleanEmail)) {
      return res.status(400).send("Error: No registered account matches the specified email address.");
    }

    const otp = generateOTP();
    otpMap.set(cleanEmail, { code: otp, type: "reset" });

    console.log(`\n============== [PASSWORD RESET OTP] ==============`);
    console.log(`✉️  EMAIL  : ${cleanEmail}`);
    console.log(`🔑 RESET OTP: ${otp}`);
    console.log(`==================================================\n`);

    res.send(`Verification passcode for password reset sent to ${cleanEmail}`);
  });

  // Reset Password (Phase 2 OTP Verification)
  app.post("/api/auth/forgot-password/otp-verify", (req, res) => {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).send("Error: Email, code, and newPassword are required parameters.");
    }
    const cleanEmail = email.trim().toLowerCase();
    const cached = otpMap.get(cleanEmail);

    if (!cached || cached.code !== code.trim() || cached.type !== "reset") {
      return res.status(401).send("Error: The recovery OTP code has expired or is invalid.");
    }

    const user = users.get(cleanEmail);
    if (!user) {
      return res.status(404).send("Error: Account verification failed. User not found.");
    }

    user.password = newPassword.trim();
    otpMap.delete(cleanEmail);

    res.send("Credentials updated successfully!");
  });

  // Admin Catalog Creation
  app.post("/api/internships/admin/create", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const internship = req.body;
    const newEntry = {
      id: internship.id || `int-${Math.floor(100 + Math.random() * 900)}`,
      title: internship.title,
      description: internship.description,
      price: internship.price,
      durationMonths: internship.durationMonths || 2,
      taskSheetName: internship.taskSheetName,
      taskSheetPdfUrl: internship.taskSheetPdfUrl,
      category: internship.category || "Software Engineering",
      enrolledCount: internship.enrolledCount || 0
    };

    internships.push(newEntry);
    res.json(newEntry);
  });

  // Submit Enrollment (Apply)
  app.post("/api/enrollments/apply", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Access denied. Authentication required." });
    }

    const {
      id,
      internshipId,
      studentName,
      status,
      durationMonths,
      transactionId,
      paymentScreenshotUrl,
      studentPhone,
      qualification,
      collegeName,
      domainApplied,
      agreedToPhases,
      agreedToPayment
    } = req.body;

    const months = durationMonths || 2;
    const expiryDateObj = new Date();
    expiryDateObj.setMonth(expiryDateObj.getMonth() + months);
    const expiryStr = expiryDateObj.toISOString().substring(0, 10);

    const newEnrollment: any = {
      id: id || `EMR-${Math.floor(100000 + Math.random() * 900000)}`,
      studentEmail: principal.email,
      studentName: studentName || principal.name,
      internshipId,
      status: "payment_pending",
      durationMonths: months,
      transactionId,
      paymentScreenshotUrl,
      paymentTimestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      taskAttempts: 0,
      expiryDate: expiryStr,
      studentPhone,
      qualification,
      collegeName,
      domainApplied,
      agreedToPhases,
      agreedToPayment
    };

    enrollments.push(newEnrollment);
    res.json(newEnrollment);
  });

  // Get My Enrollments
  app.get("/api/enrollments/my", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Access denied. Authentication required." });
    }

    const myEnrollments = enrollments.filter(e => e.studentEmail.toLowerCase() === principal.email.toLowerCase());
    res.json(myEnrollments);
  });

  // Get All Enrollments (Admins can fetch all)
  app.get("/api/enrollments/all", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }
    res.json(enrollments);
  });

  // Member Submission (Submit Milestone)
  app.post("/api/enrollments/:id/submit", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Access denied. Authentication required." });
    }

    const { id } = req.params;
    const submissionUrl = req.query.submissionUrl as string;
    const submissionNote = req.query.submissionNote as string;

    const enrollment = enrollments.find(e => e.id === id);
    if (!enrollment) {
      return res.status(404).send("Enrollment not found.");
    }

    if (enrollment.studentEmail.toLowerCase() !== principal.email.toLowerCase()) {
      return res.status(403).json({ error: "Access denied." });
    }

    enrollment.status = "submitted";
    enrollment.submissionUrl = submissionUrl;
    enrollment.submissionNote = submissionNote;
    enrollment.submissionTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    enrollment.taskAttempts = (enrollment.taskAttempts || 0) + 1;

    res.json(enrollment);
  });


  // Evaluate Enrollment status (Offer details / code feedback / completion certificates)
  app.post("/api/enrollments/admin/:id/evaluate", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Access denied. Admin role required." });
    }

    const { id } = req.params;
    const status = req.query.status as string;
    const adminNotes = req.query.adminNotes as string;
    const certificateId = req.query.certificateId as string;

    const enrollment = enrollments.find(e => e.id === id);
    if (!enrollment) {
      return res.status(404).send("Enrollment not found.");
    }

    const oldStatus = enrollment.status;
    enrollment.status = status as any;
    if (adminNotes) enrollment.adminNotes = adminNotes;

    const targetInternship = internships.find(i => i.id === enrollment.internshipId);
    const internshipTitle = targetInternship ? targetInternship.title : "Deltaclause Industrial Program";

    if (status.toLowerCase() === "active" && oldStatus.toLowerCase() !== "active") {
      console.log(`✉️  [MOCK EMAIL SENT] To: ${enrollment.studentEmail} | Offer Letter for ${internshipTitle}`);
    } else if (status.toLowerCase() === "completed") {
      enrollment.completionDate = new Date().toISOString().substring(0, 10);
      const certId = certificateId || `DC-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
      enrollment.certificateId = certId;

      const newCert = {
        id: certId,
        enrollmentId: id,
        studentName: enrollment.studentName,
        internshipTitle,
        completionDate: enrollment.completionDate,
        durationMonths: targetInternship ? targetInternship.durationMonths : 2
      };
      certificates.push(newCert);

      if (oldStatus.toLowerCase() !== "completed") {
        console.log(`✉️  [MOCK EMAIL SENT] To: ${enrollment.studentEmail} | Graduation Certificate: ${certId}`);
      }
    } else if (status.toLowerCase() === "redo") {
      enrollment.adminNotes = adminNotes || "Please review standard requirements and submit again.";
    }

    res.json(enrollment);
  });

  // Certificate Public verify
  app.get("/api/certificates/verify/:id", (req, res) => {
    const { id } = req.params;
    const cert = certificates.find(c => c.id.trim().toLowerCase() === id.trim().toLowerCase());
    if (cert) {
      res.json(cert);
    } else {
      res.status(404).send(`Error: Certificate signature record with ID ${id} could not be resolved.`);
    }
  });

  app.post("/api/certificates/admin/issue", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Access denied." });
    }
    const cert = req.body;
    certificates.push(cert);
    res.json(cert);
  });

  // --- SUPPORT TICKETS API ---
  app.get("/api/tickets/my", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const myTickets = tickets.filter(t => t.studentEmail.toLowerCase() === principal.email.toLowerCase());
    res.json(myTickets);
  });

  app.get("/api/tickets/all", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    res.json(tickets);
  });

  app.post("/api/tickets/create", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const { subject, message } = req.body;
    const newTicket: any = {
      id: `tkt-${Math.floor(100 + Math.random() * 900)}`,
      studentEmail: principal.email,
      studentName: principal.name,
      subject: subject || "Issue Support",
      message: message || "",
      status: "open",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      replies: [
        {
          sender: "student",
          message: message || "",
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        }
      ]
    };
    tickets.push(newTicket);
    res.json(newTicket);
  });

  app.post("/api/tickets/:id/reply", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const { id } = req.params;
    const { message, sender } = req.body;
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    // Students can only reply to their own tickets. Admins can reply to any.
    if (principal.role !== "ROLE_ADMIN" && ticket.studentEmail.toLowerCase() !== principal.email.toLowerCase()) {
      return res.status(403).json({ error: "Access denied." });
    }

    const reply = {
      sender: sender || (principal.role === "ROLE_ADMIN" ? "admin" : "student"),
      message: message || "",
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    ticket.replies.push(reply);

    // If admin replies, we can mark ticket status as resolved or open depending on request
    if (principal.role === "ROLE_ADMIN") {
      ticket.status = "resolved"; // default status update upon admin response
    }

    res.json(ticket);
  });

  app.post("/api/tickets/:id/resolve", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const { id } = req.params;
    const { replyMessage } = req.body;
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found." });
    }

    ticket.status = "resolved";
    if (replyMessage) {
      ticket.replies.push({
        sender: "admin",
        message: replyMessage,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
      });
    }
    res.json(ticket);
  });

  // --- REFERRALS API ---
  app.get("/api/referrals/my", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const myReferrals = referrals.filter(r => r.referrerEmail.toLowerCase() === principal.email.toLowerCase());
    res.json(myReferrals);
  });

  app.get("/api/referrals/all", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    res.json(referrals);
  });

  app.post("/api/referrals/add", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const { referrerEmail, referredEmail, referredName } = req.body;
    const newReferral: any = {
      id: `ref-${Math.floor(1000 + Math.random() * 9000)}`,
      referrerEmail: referrerEmail || principal.email,
      referredEmail: referredEmail || "",
      referredName: referredName || "",
      signupDate: new Date().toISOString().substring(0, 10),
      status: "joined",
      rewardClaimed: false
    };
    referrals.push(newReferral);

    // Give points to user who referred if applicable
    const referringUser = users.get(newReferral.referrerEmail.toLowerCase());
    if (referringUser) {
      referringUser.points = (referringUser.points || 0) + 100; // default referee point prize
    }

    res.json(newReferral);
  });

  app.post("/api/referrals/:id/action", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal) {
      return res.status(401).json({ error: "Authentication required." });
    }
    const { id } = req.params;
    const { status, rewardClaimed } = req.body;
    const referral = referrals.find(r => r.id === id);
    if (!referral) {
      return res.status(404).json({ error: "Referral not found." });
    }

    if (status) referral.status = status;
    if (rewardClaimed !== undefined) referral.rewardClaimed = rewardClaimed;
    res.json(referral);
  });

  // --- ANNOUNCEMENTS API ---
  app.get("/api/announcements/all", (req, res) => {
    res.json(announcements);
  });

  app.post("/api/announcements/create", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const { id, title, message, targetInternshipId, targetDuration, badge } = req.body;
    const newAnnouncement: any = {
      id: id || `ann-${Date.now()}`,
      title: title || "Important Update",
      message: message || "",
      targetInternshipId: targetInternshipId || "all",
      targetDuration: targetDuration || 0,
      badge: badge || "warning",
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    announcements.unshift(newAnnouncement);
    res.json(newAnnouncement);
  });

  app.delete("/api/announcements/:id", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const { id } = req.params;
    const index = announcements.findIndex(ann => String(ann.id) === String(id));
    if (index !== -1) {
      announcements.splice(index, 1);
      res.json({ success: true, message: `Announcement ${id} successfully retracted.` });
    } else {
      res.status(404).json({ error: "Announcement not found." });
    }
  });

  // --- SETTINGS (REFUND THRESHOLD) ---
  app.get("/api/settings/refund-threshold", (req, res) => {
    res.json({ refundThreshold });
  });

  app.post("/api/settings/refund-threshold", (req, res) => {
    const principal = getPrincipalFromToken(req);
    if (!principal || principal.role !== "ROLE_ADMIN") {
      return res.status(403).json({ error: "Admin access required." });
    }
    const { threshold } = req.body;
    if (threshold !== undefined) {
      refundThreshold = Number(threshold);
    }
    res.json({ refundThreshold });
  });

  // --- VITE MIDDLEWARE SETUP / STATIC FILES ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Security Auth and Admin Services successfully running on http://localhost:${PORT}`);
  });
}

startServer();
