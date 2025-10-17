import express from 'express';
import certificateService from '../services/certificateService.js';
import Certificate from '../models/Certificate.js';
import Enrollment from '../models/Enrollment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Generate and download certificate for a completed course
 * POST /api/certificates/generate/:enrollmentId
 */
router.post('/generate/:enrollmentId', protect, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user._id;

    // Verify enrollment belongs to user
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (!enrollment.completed) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    console.log('🎓 Certificate Generation Request');
    console.log('User ID:', userId);
    console.log('Enrollment ID:', enrollmentId);
    console.log('Course ID:', enrollment.course);

    // Create or get existing certificate
    const certificate = await certificateService.createCertificate(
      userId,
      enrollment.course,
      enrollmentId
    );

    console.log('✅ Certificate created/retrieved:');
    console.log('Certificate ID:', certificate.certificateId);
    console.log('Student Name:', certificate.studentName);
    console.log('Course Title:', certificate.courseTitle);

    // Generate PDF
    const pdfBuffer = await certificateService.generateCertificatePDF(certificate);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.certificateId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Certificate generation error:', error);
    res.status(500).json({ 
      message: 'Failed to generate certificate',
      error: error.message 
    });
  }
});

/**
 * Get certificate details (without PDF)
 * GET /api/certificates/:enrollmentId
 */
router.get('/:enrollmentId', protect, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user._id;

    // Verify enrollment belongs to user
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      user: userId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Find certificate
    const certificate = await Certificate.findOne({
      user: userId,
      enrollment: enrollmentId
    }).populate('course', 'title level duration');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json(certificate);
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ 
      message: 'Failed to get certificate',
      error: error.message 
    });
  }
});

/**
 * Validate certificate by validation code (public endpoint)
 * GET /api/certificates/validate/:validationCode
 */
router.get('/validate/:validationCode', async (req, res) => {
  try {
    const { validationCode } = req.params;

    console.log('🔍 Certificate validation request:', validationCode);

    // Clean the validation code (remove any extra characters)
    const cleanValidationCode = validationCode.trim().toUpperCase();
    
    const result = await certificateService.validateCertificate(cleanValidationCode);

    if (!result.valid) {
      console.log('❌ Certificate validation failed:', result.message);
      return res.status(404).json(result);
    }

    console.log('✅ Certificate validated successfully:', result.certificate.certificateId);

    // Return sanitized certificate data
    const certificateData = {
      valid: true,
      certificateId: result.certificate.certificateId,
      studentName: result.certificate.studentName,
      courseTitle: result.certificate.courseTitle,
      completionDate: result.certificate.completionDate,
      issuedAt: result.certificate.issuedAt,
      finalScore: result.certificate.finalScore,
      instructorName: result.certificate.instructorName,
      metadata: result.certificate.metadata,
      status: result.certificate.status,
      validationCode: result.certificate.validationCode // Include for reference
    };

    res.json(certificateData);
  } catch (error) {
    console.error('❌ Certificate validation error:', error);
    res.status(500).json({ 
      message: 'Failed to validate certificate',
      error: error.message 
    });
  }
});

/**
 * Get all certificates for current user
 * GET /api/certificates/my/all
 */
router.get('/my/all', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({ user: userId })
      .populate('course', 'title level thumbnail')
      .sort({ issuedAt: -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Get user certificates error:', error);
    res.status(500).json({ 
      message: 'Failed to get certificates',
      error: error.message 
    });
  }
});

/**
 * Admin: Revoke a certificate
 * POST /api/certificates/revoke/:certificateId
 */
router.post('/revoke/:certificateId', protect, async (req, res) => {
  try {
    // Check if user is admin (you'll need to add role check)
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { certificateId } = req.params;
    const { reason } = req.body;

    const certificate = await certificateService.revokeCertificate(certificateId, reason);

    res.json({ 
      message: 'Certificate revoked successfully',
      certificate 
    });
  } catch (error) {
    console.error('Certificate revocation error:', error);
    res.status(500).json({ 
      message: 'Failed to revoke certificate',
      error: error.message 
    });
  }
});

/**
 * Repair certificate data (for existing certificates)
 * POST /api/certificates/repair/:certificateId
 */
router.post('/repair/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }
    
    const repairedCertificate = await certificateRepairService.repairCertificate(certificate);
    
    res.json({
      message: 'Certificate repaired successfully',
      certificate: repairedCertificate
    });
  } catch (error) {
    console.error('Certificate repair error:', error);
    res.status(500).json({ 
      message: 'Failed to repair certificate',
      error: error.message 
    });
  }
});

/**
 * Repair all certificates (admin only)
 * POST /api/certificates/repair-all
 */
router.post('/repair-all', async (req, res) => {
  try {
    const repairedCount = await certificateRepairService.repairAllCertificates();
    
    res.json({
      message: `Successfully repaired ${repairedCount} certificates`,
      repairedCount
    });
  } catch (error) {
    console.error('Bulk certificate repair error:', error);
    res.status(500).json({ 
      message: 'Failed to repair certificates',
      error: error.message 
    });
  }
});

export default router;
