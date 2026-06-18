/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to draw a sleek, modern Deltaclause Corporate Logo
function drawDeltaclauseLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number = 1
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // 1. Draw the stylized logo mark: Hexagonal/shield emblem
  const grad = ctx.createLinearGradient(-25, -25, 25, 25);
  grad.addColorStop(0, '#4f46e5'); // Indigo-600
  grad.addColorStop(1, '#8b5cf6'); // Violet-500

  // Draw smooth rounded shield element
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(26, -18);
  ctx.lineTo(26, 12);
  ctx.lineTo(0, 30);
  ctx.lineTo(-26, 12);
  ctx.lineTo(-26, -18);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.shadowColor = 'rgba(79, 70, 229, 0.25)';
  ctx.shadowBlur = 10;
  ctx.fill();

  // Draw inner "D" and "C" intersections as clean white lines
  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left 'D' curve
  ctx.beginPath();
  ctx.moveTo(-10, -14);
  ctx.lineTo(-10, 14);
  ctx.moveTo(-10, -14);
  ctx.bezierCurveTo(4, -14, 10, -8, 10, 0);
  ctx.bezierCurveTo(10, 8, 4, 14, -10, 14);
  ctx.stroke();

  // Right overlapping 'C' curve
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(4, 0, 8, -Math.PI / 2 - 0.2, Math.PI / 2 + 0.2, false);
  ctx.stroke();

  // 2. Draw Text Brand
  ctx.fillStyle = '#0f172a'; // Deep slate text
  ctx.font = '700 24px "Space Grotesk", "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Deltaclause', 42, -5);

  // Subtitle
  ctx.fillStyle = '#64748b'; // Muted slate text
  ctx.font = '500 8.5px "Inter", "Space Grotesk", sans-serif';
  ctx.fillText('INTELLIGENT PROJECT ACADEMY', 42, 14);

  ctx.restore();
}

// Helper to draw a beautiful digital signature for "Siddharth Roy, Director"
function drawSignature(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Digital ink style (smooth, dark blue-indigo pen ink)
  ctx.strokeStyle = '#1e3a8a';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Smooth Bezier path simulations of a stylized signature "S. Roy"
  ctx.beginPath();
  // S letter
  ctx.moveTo(-45, 5);
  ctx.bezierCurveTo(-55, -20, -30, -32, -40, -5);
  ctx.bezierCurveTo(-45, 10, -25, 18, -30, 0);
  // connector
  ctx.bezierCurveTo(-28, -6, -20, -10, -18, -2);
  // R letter
  ctx.bezierCurveTo(-15, -15, -10, -18, -12, -4);
  ctx.bezierCurveTo(-12, 12, -5, -4, 2, -10);
  // o y letters
  ctx.bezierCurveTo(5, -4, 8, -6, 12, -1);
  ctx.bezierCurveTo(15, 6, 18, -3, 22, -15);
  ctx.bezierCurveTo(24, -2, 26, 18, 18, 22);
  ctx.bezierCurveTo(14, 24, 25, 2, 45, -5);
  ctx.stroke();

  // Thick fast pen underline flourish
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(30, 58, 138, 0.7)';
  ctx.lineWidth = 1.8;
  ctx.moveTo(-52, 12);
  ctx.bezierCurveTo(-20, 16, 20, 10, 48, 14);
  ctx.stroke();

  ctx.restore();
}

// Helper to wrap text over canvas
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
  return currentY + lineHeight;
}

/**
 * Generates and downloads a High-Resolution (1600x1200) Certificate of Completion PNG.
 */
export function downloadCertificate(
  studentName: string,
  internshipTitle: string,
  certificateId: string,
  completionDate: string,
  durationMonths: number
) {
  // Create solid offline high-DPI canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear & background color: Classic cream white paper surface
  ctx.fillStyle = '#fdfdfd';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* --- 1. CERTIFICATE MARGIN BORDERS --- */
  // Outer margin
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#0f172a'; // Slate-900 border
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Inset fine border
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#c5a85c'; // Accent gold border
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Corner decorative visual designs
  const cornerSize = 40;
  const margin = 48;
  const corners = [
    { x: margin, y: margin, dx: 1, dy: 1 },
    { x: canvas.width - margin, y: margin, dx: -1, dy: 1 },
    { x: margin, y: canvas.height - margin, dx: 1, dy: -1 },
    { x: canvas.width - margin, y: canvas.height - margin, dx: -1, dy: -1 },
  ];

  corners.forEach((c) => {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = '#c5a85c';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#c5a85c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize * c.dx, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, cornerSize * c.dy);
    ctx.stroke();
    ctx.restore();
  });

  /* --- 2. WATERMARK / BACKGROUND EMBELLISHMENTS --- */
  ctx.save();
  ctx.globalAlpha = 0.025;
  ctx.translate(canvas.width / 2, canvas.height / 2);
  // Large circular watermark crest
  ctx.beginPath();
  ctx.arc(0, 0, 240, 0, Math.PI * 2);
  ctx.lineWidth = 16;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
  ctx.font = '240px Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 0, 0);
  ctx.restore();

  /* --- 3. LOGO HEADER --- */
  drawDeltaclauseLogo(ctx, canvas.width / 2 - 120, 150, 1.35);

  /* --- 4. CERTIFICATE TITLE AND SUB-INFO --- */
  ctx.fillStyle = '#64748b'; // Slate-500
  ctx.font = 'italic 500 20px "Georgia", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.fillText('This certificate is proudly and officially awarded to', canvas.width / 2, 340);

  // Recipient Name (Bold Accent Display)
  ctx.fillStyle = '#0f172a'; // Slate-900
  ctx.font = '600 54px "Georgia", "Times New Roman", serif';
  ctx.fillText(studentName, canvas.width / 2, 430);

  // Inset horizontal divider
  ctx.strokeStyle = 'rgba(197, 168, 92, 0.4)'; // Gold alpha
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2 - 200, 475);
  ctx.lineTo(canvas.width / 2 + 200, 475);
  ctx.stroke();

  // Accomplishment declaration text
  ctx.fillStyle = '#475569'; // Slate-600
  ctx.font = '500 18px "Inter", sans-serif';
  ctx.fillText('for successful completion of all industrial project milestones as a', canvas.width / 2, 530);

  // Program Title
  ctx.fillStyle = '#4f46e5'; // Indigo-600
  ctx.font = '700 32px "Space Grotesk", sans-serif';
  ctx.fillText(internshipTitle, canvas.width / 2, 600);

  // Duration Subtitle
  ctx.fillStyle = '#64748b'; // Slate-500
  ctx.font = '500 15px "Inter", monospace';
  ctx.fillText(
    `DURATION: ${durationMonths} ${durationMonths === 1 ? 'MONTH' : 'MONTHS'} OF PROJECT-BASED TASKS & PEER EVALUATION`,
    canvas.width / 2,
    650
  );

  /* --- 5. COMPREHENSIVE GOLD METALLIC SEAL EMBLEM --- */
  const sealX = canvas.width / 2;
  const sealY = 820;

  ctx.save();
  ctx.translate(sealX, sealY);

  // Scalloped points of the seal
  const points = 48;
  const outerRad = 62;
  const innerRad = 52;
  ctx.beginPath();
  ctx.fillStyle = '#c5a85c'; // Elegant gold
  for (let i = 0; i < points; i++) {
    const angle = (i * Math.PI) / (points / 2);
    const r = i % 2 === 0 ? outerRad : innerRad;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();

  // Golden inner ring
  ctx.beginPath();
  ctx.arc(0, 0, 44, 0, Math.PI * 2);
  ctx.fillStyle = '#d4af37'; // Slightly brighter gold
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, 0, 40, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Seal engraving
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 8px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VERIFIED', 0, -10);
  ctx.fillText('DC SEAL', 0, 0);
  ctx.fillText('★ 2026 ★', 0, 10);
  ctx.restore();

  /* --- 6. SIGNATURE BLOCK (Left) --- */
  const signLeftX = 300;
  drawSignature(ctx, signLeftX, 810);

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(signLeftX - 120, 850);
  ctx.lineTo(signLeftX + 120, 850);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 14px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Siddharth Roy', signLeftX, 875);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Inter", sans-serif';
  ctx.fillText('Director, Deltaclause', signLeftX, 895);

  /* --- 7. DATE RECORD (Right) --- */
  const dateRightX = canvas.width - 300;

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(dateRightX - 120, 850);
  ctx.lineTo(dateRightX + 120, 850);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 14px "Inter", sans-serif';
  ctx.textAlign = 'center';
  const displayDate = new Date(completionDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(displayDate, dateRightX, 875);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Inter", sans-serif';
  ctx.fillText('Date of Completion', dateRightX, 895);

  /* --- 8. FOOTER SECURE VERIFICATION ID --- */
  ctx.fillStyle = '#94a3b8'; // Slate-400
  ctx.font = '12px "Inter", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    `SECURE DIGITAL RECORD VERIFICATION ID: ${certificateId}`,
    canvas.width / 2,
    1100
  );
  ctx.fillText(
    `Verify record authenticity online at: https://deltaclause.com/verify`,
    canvas.width / 2,
    1120
  );

  // Trigger file download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Deltaclause_Certificate_${studentName.replace(/\s+/g, '_')}.png`;
  link.href = dataUrl;
  link.click();
}

/**
 * Generates and downloads a High-Resolution (1200x1700) Internship Offer Letter PNG.
 */
export function downloadOfferLetter(
  studentName: string,
  internshipTitle: string,
  durationMonths: number
) {
  // Create high density virtual canvas (A4 ratio ~1:1.41)
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Clear & background color: Stark premium bond white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /* --- 1. LIGHT ELEGANT DOCUMENT BORDERS --- */
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

  // Top accent brand band
  const bandGrad = ctx.createLinearGradient(40, 40, canvas.width - 40, 40);
  bandGrad.addColorStop(0, '#4f46e5');
  bandGrad.addColorStop(1, '#8b5cf6');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(40, 40, canvas.width - 80, 5);

  /* --- 2. CORPORATE LETTERHEAD LOGO --- */
  drawDeltaclauseLogo(ctx, 100, 110, 1.2);

  // Date on right hand side
  ctx.fillStyle = '#475569';
  ctx.font = '500 15px "Inter", sans-serif';
  ctx.textAlign = 'right';
  const currentDateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  ctx.fillText(`Date: ${currentDateStr}`, canvas.width - 100, 110);
  ctx.fillText('Ref: DC/OL/2026/' + Math.floor(1000 + Math.random() * 9000), canvas.width - 100, 135);

  // Subtle clean divider beneath header
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(100, 185);
  ctx.lineTo(canvas.width - 100, 185);
  ctx.stroke();

  /* --- 3. DOCUMENT TITLE --- */
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 28px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('INTERNSHIP OFFER LETTER', canvas.width / 2, 250);

  /* --- 4. SALUTATIONS & OPENING AGREEMENT --- */
  ctx.fillStyle = '#1e293b';
  ctx.font = '700 16px "Inter", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Dear ${studentName},`, 100, 320);

  ctx.fillStyle = '#334155';
  ctx.font = '400 15px/26px "Inter", sans-serif';
  
  const introPara = `We are absolutely delighted to offer you a remote project-based Internship position as a ${internshipTitle} at Deltaclause. Your educational training and project assessment cycle commences immediately upon administrative enrollment verification and will continue for a mandatory tenure of ${durationMonths} ${durationMonths === 1 ? 'Month' : 'Months'} of practical milestones.`;
  wrapText(ctx, introPara, 100, 360, canvas.width - 200, 24);

  /* --- 5. DETAILED ASSIGNMENT CLAUSES --- */
  let currentY = 470;

  const clauses = [
    {
      title: '1. Program Scope & Practical Milestones',
      text: 'As an intern with Deltaclause, you will operate remote workflows designed to model the exact engineering standards of outstanding international tech organizations. You are required to submit industrial task lists, integrate core peer-reviewed modules, and share complete Github repositories for review.',
    },
    {
      title: '2. Professional Conduct & Continuous Assessment',
      text: 'You agree to maintain absolute integrity in all project codebases. Plagiarism from online templates or unauthorized resources is strictly prohibited. Your work will undergo formal evaluations from administrative verifiers before graduation and certification.',
    },
    {
      title: '3. Compensation, Stipends, and Global Perks',
      text: 'This program is an unpaid, educationally structured, project-intensive training program designed for self-paced development. Outstanding interns will receive a verifiable Certificate of Internship, customized Letters of Recommendation (LOR) for career and academic portfolios, and lucrative corporate referral point payouts.',
    },
    {
      title: '4. Remote Security & Intellectual Secrecy',
      text: 'All internal specifications, server configurations, and database credentials supplied relative to project guides are of highly confidential nature. Sharing or transmitting proprietary material outside the official assessment workspace will trigger immediate program cancellation.',
    },
  ];

  clauses.forEach((c) => {
    // Stage Title
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillText(c.title, 100, currentY);
    currentY += 24;

    // Stage Body
    ctx.fillStyle = '#475569';
    ctx.font = '400 14px "Inter", sans-serif';
    currentY = wrapText(ctx, c.text, 100, currentY, canvas.width - 200, 21);
    currentY += 15; // padding below paragraph
  });

  /* --- 6. ACCEPTANCE & CLOSING SIGN-OFF --- */
  ctx.fillStyle = '#1e293b';
  ctx.font = '500 15px "Inter", sans-serif';
  const closingText = 'We look forward to collaborating with you and witnessing your technical breakthroughs throughout this challenge. Welcome to our elite engineering circle.';
  currentY = wrapText(ctx, closingText, 100, currentY + 10, canvas.width - 200, 23);

  currentY += 60;

  // Draw Authorized signature of Director
  drawSignature(ctx, 220, currentY);

  // Divider lines
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, currentY + 45);
  ctx.lineTo(340, currentY + 45);
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 14px "Space Grotesk", sans-serif';
  ctx.fillText('Siddharth Roy', 100, currentY + 70);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Inter", sans-serif';
  ctx.fillText('Director, Deltaclause Academy', 100, currentY + 88);

  // Circular Embossed Seal representation on bottom right
  const sealX = canvas.width - 220;
  ctx.save();
  ctx.translate(sealX, currentY + 30);
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.fillStyle = '#4f46e5';
  ctx.globalAlpha = 0.08;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 48, 0, Math.PI * 2);
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.stroke();

  ctx.fillStyle = '#4f46e5';
  ctx.font = '700 8.5px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DELTACLAUSE', 0, -8);
  ctx.fillText('★★★', 0, 2);
  ctx.fillText('AUTHORIZED', 0, 12);
  ctx.restore();

  /* --- 7. FOOTER CONTACT DETAILS --- */
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, canvas.height - 110);
  ctx.lineTo(canvas.width - 100, canvas.height - 110);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 11px "Inter", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Deltaclause Intelligent Project Academy • verify@deltaclause.com • https://deltaclause.com',
    canvas.width / 2,
    canvas.height - 85
  );

  // Trigger file download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `Deltaclause_OfferLetter_${studentName.replace(/\s+/g, '_')}.png`;
  link.href = dataUrl;
  link.click();
}
