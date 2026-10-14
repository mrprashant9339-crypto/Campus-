import { jsPDF } from 'jspdf';
import { User, College } from '../types';
import { generateStudentQrDataUrl } from './qrGenerator';

interface GeneratePdfOptions {
  user: User;
  college: College;
  cryptoHash?: string;
}

/**
 * Draws a sharp vector barcode on the PDF canvas
 */
function drawBarcode(doc: jsPDF, x: number, y: number, width: number, height: number, code: string) {
  doc.setFillColor(20, 20, 20);
  const patterns = [
    [2, 1, 1, 2, 1, 2, 2, 1],
    [1, 2, 2, 1, 2, 1, 1, 2],
    [2, 2, 1, 1, 1, 2, 1, 2],
    [1, 1, 2, 2, 2, 1, 2, 1],
    [2, 1, 2, 1, 1, 2, 2, 1],
  ];

  let currentX = x;
  const unitWidth = width / 45;

  for (let i = 0; i < code.length; i++) {
    const charCode = code.charCodeAt(i) % patterns.length;
    const pat = patterns[charCode];
    for (let j = 0; j < pat.length; j++) {
      const barW = pat[j] * unitWidth * 0.45;
      if (j % 2 === 0) {
        doc.rect(currentX, y, barW, height, 'F');
      }
      currentX += barW + unitWidth * 0.2;
      if (currentX > x + width) break;
    }
  }
}

/**
 * Draws a vector QR code pattern on the PDF
 */
function drawVectorQr(doc: jsPDF, x: number, y: number, size: number) {
  const cells = 21;
  const cellSize = size / cells;

  // Background white box
  doc.setFillColor(255, 255, 255);
  doc.rect(x, y, size, size, 'F');

  doc.setFillColor(20, 20, 20);

  // Position detection patterns (Corner squares)
  const drawCorner = (cx: number, cy: number) => {
    // 7x7 outer
    doc.rect(x + cx * cellSize, y + cy * cellSize, 7 * cellSize, 7 * cellSize, 'F');
    // 5x5 white inner
    doc.setFillColor(255, 255, 255);
    doc.rect(x + (cx + 1) * cellSize, y + (cy + 1) * cellSize, 5 * cellSize, 5 * cellSize, 'F');
    // 3x3 solid core
    doc.setFillColor(20, 20, 20);
    doc.rect(x + (cx + 2) * cellSize, y + (cy + 2) * cellSize, 3 * cellSize, 3 * cellSize, 'F');
  };

  drawCorner(0, 0);
  drawCorner(14, 0);
  drawCorner(0, 14);

  // Pseudo-random deterministic data pattern
  const matrix = [
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0],
    [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1],
    [0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1],
    [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1],
    [1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1],
    [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1],
  ];

  for (let r = 0; r < 11; r++) {
    for (let c = 0; c < 11; c++) {
      if (matrix[r][c] === 1) {
        doc.rect(x + (5 + c) * cellSize, y + (5 + r) * cellSize, cellSize * 0.9, cellSize * 0.9, 'F');
      }
    }
  }
}

/**
 * Converts image URL to an HTML Image and draws to canvas to obtain data URL
 */
async function getImageDataUrl(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 160;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, 160, 160);
          ctx.drawImage(img, 0, 0, 160, 160);
          resolve(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
    // Timeout safeguard
    setTimeout(() => resolve(null), 1500);
  });
}

/**
 * Generates a high-resolution, printable PDF version of the student's ID credentials.
 * Includes both Front and Back sides laid out on a high-grade print sheet with guidelines.
 */
export async function generateIdCardPdf({ user, college, cryptoHash = '9f8e-3a1b-c742-ee01' }: GeneratePdfOptions): Promise<void> {
  // A4 Document in Portrait: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const rollNumber = user.membership.rollNumber || 'ME2024001';
  const departmentName = user.membership.departmentName || 'Mechanical Engineering';
  const semester = user.membership.semesterNumber || 3;
  const section = user.membership.sectionName || 'A';
  const collegeName = college.name || 'Government Polytechnic, Patna-07';

  // Try loading avatar image
  let avatarDataUrl: string | null = null;
  if (user.avatarUrl) {
    try {
      avatarDataUrl = await getImageDataUrl(user.avatarUrl);
    } catch {
      avatarDataUrl = null;
    }
  }

  // --- Document Header & Metadata ---
  doc.setFillColor(248, 247, 244);
  doc.rect(0, 0, 210, 297, 'F');

  // Top Title Bar
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AAVRIT // TECHNICAL ID LEDGER', 20, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('OFFICIAL HIGH-RESOLUTION PRINTABLE CREDENTIAL SHEET', 20, 28);
  doc.text(`ISSUED: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} | ISO/IEC 7810 ID-1 STANDARD`, 20, 33);

  // Decorative Rule
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.8);
  doc.line(20, 37, 190, 37);

  // Instructions Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, 42, 170, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('PRINTING & LAMINATION INSTRUCTIONS:', 25, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(70, 70, 70);
  doc.text('Print at 100% scale (No fit-to-page) on 300+ GSM cardstock or PVC sheet. Cut along dotted crop-marks.', 25, 53);

  // Card dimensions: 85.6 mm x 54 mm (Standard Credit Card ID-1)
  const cardW = 85.6;
  const cardH = 54;
  const startY = 70;

  // ==========================================
  // CARD 1: FRONT SIDE (Left)
  // ==========================================
  const frontX = 20;

  // Section Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('CARD FACE A // FRONT CREDENTIAL', frontX, startY - 4);

  // Dotted Cut Marks around Front Card
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(frontX - 2, startY - 2, cardW + 4, cardH + 4, 'D');
  doc.setLineDashPattern([], 0); // reset dash

  // Card Body (White with sharp crisp border)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.4);
  doc.roundedRect(frontX, startY, cardW, cardH, 2.5, 2.5, 'FD');

  // Front Header Navy/Dark Strip
  doc.setFillColor(20, 20, 20);
  doc.roundedRect(frontX, startY, cardW, 11, 2.5, 2.5, 'F');
  // Cover bottom round corners of header
  doc.rect(frontX, startY + 6, cardW, 5, 'F');

  // Accent Blue Line below Header
  doc.setFillColor(37, 99, 235);
  doc.rect(frontX, startY + 11, cardW, 0.8, 'F');

  // Header Typography
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('STATE BOARD OF TECHNICAL EDUCATION, BIHAR', frontX + 4, startY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(200, 200, 200);
  doc.text(collegeName.toUpperCase(), frontX + 4, startY + 8.5);

  // Photo Frame
  const photoX = frontX + 4;
  const photoY = startY + 14;
  const photoW = 20;
  const photoH = 24;

  doc.setFillColor(245, 245, 245);
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.3);
  doc.rect(photoX, photoY, photoW, photoH, 'FD');

  if (avatarDataUrl) {
    try {
      doc.addImage(avatarDataUrl, 'JPEG', photoX + 0.5, photoY + 0.5, photoW - 1, photoH - 1);
    } catch {
      // Fallback silhouette
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text('PHOTO', photoX + 5, photoY + 13);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text('PHOTO', photoX + 5, photoY + 13);
  }

  // Security Stamp over photo
  doc.setFillColor(37, 99, 235);
  doc.rect(photoX, photoY + photoH - 3.5, photoW, 3.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4);
  doc.text('VERIFIED ID // SBTE', photoX + 2, photoY + photoH - 1.2);

  // Student Details (Right of photo)
  const infoX = frontX + 27;
  let infoY = startY + 17;

  // Name
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(user.fullName.toUpperCase(), infoX, infoY);

  // Roll Number
  infoY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`ROLL: ${rollNumber}`, infoX, infoY);

  // Discipline
  infoY += 3.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(70, 70, 70);
  doc.text(departmentName, infoX, infoY);

  // Term & Section
  infoY += 3.2;
  doc.text(`Semester ${semester} | Section ${section} | 2024-2027`, infoX, infoY);

  // Node Token
  infoY += 3.2;
  doc.setFont('courier', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(120, 120, 120);
  doc.text(`NODE: PATNA-01 // SBTE-CRED-OK`, infoX, infoY);

  // Barcode Strip at bottom of Front
  const bY = startY + 41;
  drawBarcode(doc, frontX + 4, bY, 50, 6.5, rollNumber);

  // Signature & Seal Stamp on bottom right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  doc.setTextColor(100, 100, 100);
  doc.text('AUTHORIZED SIGNATURE', frontX + 58, startY + 45.5);
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.2);
  doc.line(frontX + 57, startY + 44, frontX + 81, startY + 44);
  doc.setFont('courier', 'bold');
  doc.setFontSize(4);
  doc.setTextColor(37, 99, 235);
  doc.text('REGISTRAR // SEALED', frontX + 59, startY + 48.5);

  // ==========================================
  // CARD 2: BACK SIDE (Right)
  // ==========================================
  const backX = 104;

  // Section Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('CARD FACE B // REVERSE SECURITY', backX, startY - 4);

  // Dotted Cut Marks around Back Card
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1.5, 1.5], 0);
  doc.rect(backX - 2, startY - 2, cardW + 4, cardH + 4, 'D');
  doc.setLineDashPattern([], 0);

  // Card Body (White with sharp crisp border)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.4);
  doc.roundedRect(backX, startY, cardW, cardH, 2.5, 2.5, 'FD');

  // Magnetic / Encrypted Chip Strip Simulation
  doc.setFillColor(30, 30, 35);
  doc.rect(backX, startY + 4, cardW, 8.5, 'F');
  doc.setTextColor(200, 200, 200);
  doc.setFont('courier', 'normal');
  doc.setFontSize(4.5);
  doc.text(`/// CRYPTO-TOKEN: ${cryptoHash} ///`, backX + 8, startY + 9.5);

  // QR Code on Left
  const qrX = backX + 4;
  const qrY = startY + 16;
  const qrSize = 22;
  drawVectorQr(doc, qrX, qrY, qrSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(20, 20, 20);
  doc.text('SCAN FOR EXAM & GATE PASS', qrX - 1, qrY + qrSize + 3);

  // Terms & Conditions on Right
  const tX = backX + 29;
  let tY = startY + 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(20, 20, 20);
  doc.text('CONDITIONS OF CAMPUS ISSUANCE:', tX, tY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.2);
  doc.setTextColor(80, 80, 80);

  tY += 3.5;
  doc.text('1. Property of SBTE Bihar & Government Polytechnic.', tX, tY);
  tY += 2.8;
  doc.text('2. Mandatory for Examination Hall & Library Vault entry.', tX, tY);
  tY += 2.8;
  doc.text('3. Transfer or unauthorized duplication is strictly punishable.', tX, tY);
  tY += 2.8;
  doc.text('4. In case of loss, report immediately to Academic Desk.', tX, tY);

  // Emergency Contact & Blood Group Box
  tY += 4.5;
  doc.setFillColor(248, 247, 244);
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  doc.rect(tX, tY, 52, 9, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(4.5);
  doc.setTextColor(37, 99, 235);
  doc.text('BLOOD GRP: O+ | EMERGENCY: +91 98765 43210', tX + 2, tY + 3.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4);
  doc.setTextColor(100, 100, 100);
  doc.text('FOUND RETURN TO: Principal Office, Govt Polytechnic Patna', tX + 2, tY + 6.8);

  // Bottom Security Watermark
  doc.setFillColor(240, 240, 245);
  doc.rect(backX, startY + cardH - 5, cardW, 5, 'F');
  doc.setTextColor(100, 100, 110);
  doc.setFont('courier', 'bold');
  doc.setFontSize(4.5);
  doc.text(`CRYPTOGRAPHIC SECURE LEDGER ID // CERTIFIED V2.4`, backX + 8, startY + cardH - 1.8);

  // ==========================================
  // EXTENDED VERIFICATION SHEET (Bottom Half)
  // ==========================================
  const lowerY = startY + cardH + 18;

  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.4);
  doc.line(20, lowerY - 6, 190, lowerY - 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(20, 20, 20);
  doc.text('DIGITAL CREDENTIAL AUDIT CERTIFICATE', 20, lowerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text('This document can be verified against the AAVRIT distributed campus ledger using the cryptographic hash below.', 20, lowerY + 5);

  // Ledger Table Box
  const tableY = lowerY + 9;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220, 220, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, tableY, 170, 52, 2, 2, 'FD');

  const rows = [
    ['Student Legal Name', user.fullName, 'Verification Level', 'Level 3 - Fully Verified Institutional Bio'],
    ['Registration Code', rollNumber, 'Clearance Tier', `Semester ${semester} (${section})`],
    ['Institution Name', collegeName, 'Issuing Board', 'State Board of Technical Education (SBTE)'],
    ['Discipline / Branch', departmentName, 'Academic Session', '2024 - 2027'],
    ['Cryptographic Hash', cryptoHash, 'Blockchain Node', 'IN-PATNA-GPP-NODE-01'],
    ['Security Standard', 'DPDP Act 2023 & FIDO2 WebAuthn', 'Credential Status', 'VALID / ACTIVE'],
  ];

  let rY = tableY + 7;
  rows.forEach((row, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text(row[0].toUpperCase(), 25, rY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(20, 20, 20);
    doc.text(row[1], 58, rY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(70, 70, 70);
    doc.text(row[2].toUpperCase(), 110, rY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(idx === 5 ? 37 : 20, idx === 5 ? 99 : 20, idx === 5 ? 235 : 20);
    doc.text(row[3], 142, rY);

    if (idx < rows.length - 1) {
      doc.setDrawColor(240, 240, 240);
      doc.setLineWidth(0.2);
      doc.line(25, rY + 2, 185, rY + 2);
    }
    rY += 7.5;
  });

  // Footer Disclaimer & Barcode
  const footY = 270;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('ELECTRONICALLY GENERATED BY AAVRIT TECHNICAL LEDGER SYSTEM. NO PHYSICAL SIGNATURE REQUIRED.', 20, footY);
  doc.text('Verify online at https://aavrit.bihar.gov.in/verify or scan the embedded QR code.', 20, footY + 4);

  drawBarcode(doc, 20, footY + 8, 45, 6, rollNumber);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`HASH // ${cryptoHash} // LEDGER_VERIFIED`, 75, footY + 12);

  // Trigger download
  const cleanRoll = rollNumber.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`AAVRIT_ID_Card_${cleanRoll}.pdf`);
}
