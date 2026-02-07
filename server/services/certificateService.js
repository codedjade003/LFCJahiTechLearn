import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

import Certificate from '../models/Certificate.js';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CertificateService {
  /**
   * Generate a beautiful certificate PDF
   */
  async generateCertificatePDF(certificateData) {
    return new Promise((resolve, reject) => {
      try {
        const debugEnabled = process.env.CERTIFICATE_DEBUG === 'true';

        if (debugEnabled) {
          console.log('='.repeat(80));
          console.log('📄 GENERATING CERTIFICATE PDF');
          console.log('='.repeat(80));
        }
        
        // Convert Mongoose document to plain object if needed
        const certData = certificateData.toObject ? certificateData.toObject() : certificateData;
        
        if (debugEnabled) {
          console.log('Certificate Data Type:', typeof certData);
          console.log('Is Mongoose Document:', !!certificateData.toObject);
          console.log('Student Name:', certData.studentName);
          console.log('Course Title:', certData.courseTitle);
          console.log('Certificate ID:', certData.certificateId);
          console.log('='.repeat(80));
        }
        
        // Use the plain object for PDF generation
        certificateData = certData;

        const doc = new PDFDocument({
          size: 'A4',
          layout: 'landscape',
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Background and border
        this.drawBackground(doc);
        this.drawBorder(doc);

        // Header
        this.drawHeader(doc);

        // Certificate title (adjusted for logo)
        doc.fontSize(36)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text('CERTIFICATE OF COMPLETION', 50, 180, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Decorative line
        doc.moveTo(250, 230)
           .lineTo(doc.page.width - 250, 230)
           .strokeColor('#d4af37')
           .lineWidth(2)
           .stroke();

        // "This is to certify that"
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text('This is to certify that', 50, 260, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Student name
        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fillColor('#2d3748')
           .text(certificateData.studentName, 50, 290, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Completion text
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text('has successfully completed the course', 50, 340, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Course title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text(certificateData.courseTitle, 50, 370, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Course details
        const detailsY = 420;
        if (certificateData.metadata) {
          let details = [];
          if (certificateData.metadata.courseLevel) {
            details.push(`Level: ${certificateData.metadata.courseLevel}`);
          }
          if (certificateData.metadata.courseDuration) {
            details.push(`Duration: ${certificateData.metadata.courseDuration}`);
          }
          if (certificateData.finalScore) {
            details.push(`Score: ${certificateData.finalScore}%`);
          }
          
          if (details.length > 0) {
            doc.fontSize(11)
               .font('Helvetica')
               .fillColor('#718096')
               .text(details.join(' • '), 50, detailsY, {
                 align: 'center',
                 width: doc.page.width - 100
               });
          }
        }

        // Date and certificate ID
        const bottomY = 480;
        const completionDate = new Date(certificateData.completionDate);
        const formattedDate = completionDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text(`Date of Completion: ${formattedDate}`, 100, bottomY, {
             align: 'left'
           });

        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text(`Certificate ID: ${certificateData.certificateId}`, doc.page.width - 300, bottomY, {
             align: 'right',
             width: 200
           });

        // Validation code
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#2b6cb0')
           .text(`Validation Code: ${certificateData.validationCode}`, 50, bottomY + 25, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Validation URL
        const validationUrl = `${process.env.CLIENT_URL || 'https://lfcjahitechlearn.com'}/validate/${certificateData.validationCode}`;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#4299e1')
           .text(`Verify at: ${validationUrl}`, 50, bottomY + 45, {
             align: 'center',
             width: doc.page.width - 100,
             link: validationUrl,
             underline: true
           });

        // Instructor signature section
        if (certificateData.instructorName) {
          const signatureY = bottomY + 80;
          doc.moveTo(doc.page.width / 2 - 100, signatureY)
             .lineTo(doc.page.width / 2 + 100, signatureY)
             .strokeColor('#cbd5e0')
             .lineWidth(1)
             .stroke();

          doc.fontSize(11)
             .font('Helvetica-Bold')
             .fillColor('#2d3748')
             .text(certificateData.instructorName, 50, signatureY + 10, {
               align: 'center',
               width: doc.page.width - 100
             });

          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#718096')
             .text('Course Instructor', 50, signatureY + 28, {
               align: 'center',
               width: doc.page.width - 100
             });
        }

        // Footer
        this.drawFooter(doc);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  drawBackground(doc) {
    // Light background gradient effect using rectangles
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fillColor('#f7fafc')
       .fill();
  }

  drawBorder(doc) {
    // Outer border
    doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
       .strokeColor('#2d3748')
       .lineWidth(3)
       .stroke();

    // Inner decorative border
    doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
       .strokeColor('#d4af37')
       .lineWidth(1)
       .stroke();
  }

  drawHeader(doc) {
    // Try to add logo
    try {
      const envLogoPath = process.env.CERTIFICATE_LOGO_PATH;

      // Try multiple possible logo paths
      const logoPaths = [
        envLogoPath,
        path.join(__dirname, '../public/logo.png'),
        path.join(__dirname, '../../public/logo.png'),
        path.join(__dirname, '../../lfc-learning/public/logo.png')
      ].filter(Boolean);
      
      let logoPath = null;
      for (const p of logoPaths) {
        if (fs.existsSync(p)) {
          logoPath = p;
          break;
        }
      }
      
      if (logoPath) {
        // Add logo centered at top
        const logoSize = 60;
        const logoX = (doc.page.width - logoSize) / 2;
        doc.image(logoPath, logoX, 50, {
          width: logoSize,
          height: logoSize,
          align: 'center'
        });
        
        // Organization name below logo
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text('LFC Jahi Tech Learn', 50, 120, {
             align: 'center',
             width: doc.page.width - 100
           });

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#718096')
           .text('Excellence in Digital Education', 50, 145, {
             align: 'center',
             width: doc.page.width - 100
           });
      } else {
        // Fallback without logo
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text('LFC Jahi Tech Learn', 50, 70, {
             align: 'center',
             width: doc.page.width - 100
           });

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#718096')
           .text('Excellence in Digital Education', 50, 95, {
             align: 'center',
             width: doc.page.width - 100
           });
      }
    } catch (error) {
      if (process.env.CERTIFICATE_DEBUG === 'true') {
        console.error('Error adding logo to certificate:', error);
      }
      // Fallback without logo
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#1a365d')
         .text('LFC Jahi Tech Learn', 50, 70, {
           align: 'center',
           width: doc.page.width - 100
         });

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#718096')
         .text('Excellence in Digital Education', 50, 95, {
           align: 'center',
           width: doc.page.width - 100
         });
    }
  }

  drawFooter(doc) {
    const footerY = doc.page.height - 40;
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#a0aec0')
       .text('This certificate is awarded in recognition of successful course completion', 50, footerY, {
         align: 'center',
         width: doc.page.width - 100
       });
  }

  /**
   * Create certificate record in database
   */
  async createCertificate(userId, courseId, enrollmentId) {
    try {
      console.log('🔍 Checking for existing certificate...');
      console.log('User ID:', userId);
      console.log('Course ID:', courseId);
      console.log('Enrollment ID:', enrollmentId);

      // Check if certificate already exists
      const existingCert = await Certificate.findOne({
        user: userId,
        course: courseId,
        enrollment: enrollmentId
      }).populate('user', 'name email'); // ADD THIS POPULATE

      if (existingCert && existingCert.status === 'valid') {
        console.log('✅ Found existing certificate:');
        console.log('Certificate ID:', existingCert.certificateId);
        console.log('Student Name:', existingCert.studentName);
        console.log('Course Title:', existingCert.courseTitle);
        return existingCert;
      }

      console.log('📝 No existing certificate found, creating new one...');

      // Fetch enrollment and course data with proper population
      const Enrollment = (await import('../models/Enrollment.js')).default;
      const { Course } = await import('../models/Course.js');
      const User = (await import('../models/User.js')).default;

      // FIXED: Proper population for your schema
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({
        path: 'user',
        select: 'name email'  // Only these fields exist in your schema
      })
      .populate({
        path: 'course',
        select: 'title level duration instructor sections'
      });

    if (!enrollment || !enrollment.completed) {
      throw new Error('Course not completed');
    }

    const course = enrollment.course;
    const user = enrollment.user;

    // Debug logging
    console.log('📝 Certificate Generation Debug:');
    console.log('User object:', user);
    console.log('User name:', user?.name);
    console.log('User email:', user?.email);

    // Generate unique IDs
    const certificateId = Certificate.generateCertificateId();
    const validationCode = Certificate.generateValidationCode();

    // Calculate total modules
    const totalModules = course.sections?.reduce((sum, section) => 
      sum + (section.modules?.length || 0), 0) || 0;

    // SIMPLIFIED: Get student name from your schema
    let studentName = 'Student';
    if (user) {
      if (user.name && user.name.trim() && user.name !== 'undefined') {
        studentName = user.name.trim();
      } else if (user.email) {
        // Fallback to email
        studentName = user.email.split('@')[0];
        studentName = studentName.charAt(0).toUpperCase() + studentName.slice(1);
      }
    }

    console.log('Final student name:', studentName);

    // Create certificate
    const certificate = new Certificate({
      user: userId,
      course: courseId,
      enrollment: enrollmentId,
      certificateId,
      validationCode,
      completionDate: enrollment.updatedAt || new Date(),
      finalScore: enrollment.progress || enrollment.finalScore || 100,
      studentName: studentName,  // This should now work
      courseTitle: course.title,
      instructorName: course.instructor?.name || 'Course Instructor',
      metadata: {
        courseDuration: course.duration,
        courseLevel: course.level,
        totalModules,
        completedModules: enrollment.moduleProgress?.filter(m => m.completed).length || totalModules
      }
    });

    await certificate.save();
    
    console.log('💾 Certificate saved to database:');
    console.log('Certificate ID:', certificate.certificateId);
    console.log('Student Name:', certificate.studentName);
    console.log('Course Title:', certificate.courseTitle);
    console.log('Validation Code:', certificate.validationCode);
    
    return certificate;
  } catch (error) {
    console.error('❌ Certificate creation error:', error);
    throw error;
  }
}
  /**
   * Validate certificate by validation code
   */
  async validateCertificate(validationCode) {
    try {
      console.log('🔍 Validating certificate with code:', validationCode);
      
      // Clean and format the validation code
      const cleanCode = validationCode.trim().toUpperCase().replace(/\s+/g, '');
      
      const certificate = await Certificate.findOne({ 
        validationCode: cleanCode 
      })
      .populate('user', 'name email firstName lastName')
      .populate('course', 'title level duration instructor');

      if (!certificate) {
        console.log('❌ Certificate not found for code:', cleanCode);
        return { valid: false, message: 'Certificate not found' };
      }

      console.log('✅ Certificate found:', certificate.certificateId);
      console.log('Student Name:', certificate.studentName);
      console.log('Course Title:', certificate.courseTitle);

      if (certificate.status !== 'valid') {
        return { 
          valid: false, 
          message: `Certificate is ${certificate.status}`,
          certificate 
        };
      }

      return { 
        valid: true, 
        message: 'Certificate is valid',
        certificate 
      };
    } catch (error) {
      console.error('❌ Validation service error:', error);
      throw error;
    }
  }

  /**
   * Revoke a certificate
   */
  async revokeCertificate(certificateId, reason) {
    try {
      const certificate = await Certificate.findOne({ certificateId });
      
      if (!certificate) {
        throw new Error('Certificate not found');
      }

      certificate.status = 'revoked';
      certificate.revokedAt = new Date();
      certificate.revokedReason = reason;

      await certificate.save();
      
      console.log('💾 Certificate saved to database:');
      console.log('Certificate ID:', certificate.certificateId);
      console.log('Student Name:', certificate.studentName);
      console.log('Course Title:', certificate.courseTitle);
      console.log('Validation Code:', certificate.validationCode);
      
      return certificate;
    } catch (error) {
      throw error;
    }
  }
}

export default new CertificateService();
