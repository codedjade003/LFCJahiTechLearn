import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');

import Certificate from '../models/Certificate.js';
import { Readable } from 'stream';

class CertificateService {
  /**
   * Generate a beautiful certificate PDF
   */
  async generateCertificatePDF(certificateData) {
    return new Promise((resolve, reject) => {
      try {
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

        // Certificate title
        doc.fontSize(36)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text('CERTIFICATE OF COMPLETION', 50, 150, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Decorative line
        doc.moveTo(250, 200)
           .lineTo(doc.page.width - 250, 200)
           .strokeColor('#d4af37')
           .lineWidth(2)
           .stroke();

        // "This is to certify that"
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text('This is to certify that', 50, 230, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Student name
        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fillColor('#2d3748')
           .text(certificateData.studentName, 50, 260, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Completion text
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#4a5568')
           .text('has successfully completed the course', 50, 310, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Course title
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#1a365d')
           .text(certificateData.courseTitle, 50, 340, {
             align: 'center',
             width: doc.page.width - 100
           });

        // Course details
        const detailsY = 390;
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
        const bottomY = 450;
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
        const validationUrl = `${process.env.FRONTEND_URL || 'https://lfcjahitechlearn.com'}/validate/${certificateData.validationCode}`;
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
    // Organization name/logo area
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
      // Check if certificate already exists
      const existingCert = await Certificate.findOne({
        user: userId,
        course: courseId,
        enrollment: enrollmentId
      });

      if (existingCert && existingCert.status === 'valid') {
        return existingCert;
      }

      // Fetch enrollment and course data
      const Enrollment = (await import('../models/Enrollment.js')).default;
      const { Course } = await import('../models/Course.js');
      const User = (await import('../models/User.js')).default;

      const enrollment = await Enrollment.findById(enrollmentId)
        .populate('user', 'name email')
        .populate('course', 'title level duration instructor');

      if (!enrollment || !enrollment.completed) {
        throw new Error('Course not completed');
      }

      const course = enrollment.course;
      const user = enrollment.user;

      // Generate unique IDs
      const certificateId = Certificate.generateCertificateId();
      const validationCode = Certificate.generateValidationCode();

      // Calculate total modules
      const totalModules = course.sections?.reduce((sum, section) => 
        sum + (section.modules?.length || 0), 0) || 0;

      // Create certificate
      const certificate = new Certificate({
        user: userId,
        course: courseId,
        enrollment: enrollmentId,
        certificateId,
        validationCode,
        completionDate: enrollment.updatedAt,
        finalScore: enrollment.progress,
        studentName: user.name || user.email || 'Student',
        courseTitle: course.title,
        instructorName: course.instructor?.name,
        metadata: {
          courseDuration: course.duration,
          courseLevel: course.level,
          totalModules,
          completedModules: enrollment.moduleProgress?.filter(m => m.completed).length || 0
        }
      });

      await certificate.save();
      return certificate;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate certificate by validation code
   */
  async validateCertificate(validationCode) {
    try {
      const certificate = await Certificate.findOne({ validationCode })
        .populate('user', 'name email')
        .populate('course', 'title level duration');

      if (!certificate) {
        return { valid: false, message: 'Certificate not found' };
      }

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
      return certificate;
    } catch (error) {
      throw error;
    }
  }
}

export default new CertificateService();
