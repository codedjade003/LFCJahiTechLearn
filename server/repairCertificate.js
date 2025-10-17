import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';

import Certificate from './models/Certificate.js';
import User from './models/User.js';
import { Course } from './models/Course.js';

const MONGODB_URI = process.env.MONGODB_URI

async function repairCertificates() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all certificates
    const certificates = await Certificate.find({})
      .populate('user', 'name email')  // Only name and email in your schema
      .populate('course', 'title instructor');

    console.log(`📊 Found ${certificates.length} certificates to check...`);

    let repairedCount = 0;
    let errorCount = 0;

    for (const cert of certificates) {
      try {
        console.log(`\n🔍 Checking certificate: ${cert.certificateId}`);
        console.log(`   Current studentName: "${cert.studentName}"`);
        console.log(`   User: ${cert.user ? `"${cert.user.name}" (${cert.user.email})` : 'NOT FOUND'}`);
        console.log(`   Course: ${cert.course ? `"${cert.course.title}"` : 'NOT FOUND'}`);

        const needsRepair = 
          !cert.studentName || 
          cert.studentName === 'undefined' || 
          cert.studentName === 'Student' ||
          cert.studentName === 'null' ||
          cert.studentName.includes('undefined');

        if (needsRepair) {
          console.log(`🛠️  Repairing certificate: ${cert.certificateId}`);
          
          let studentName = 'Student';
          if (cert.user) {
            // Use the name field from your schema
            if (cert.user.name && cert.user.name.trim() && cert.user.name !== 'undefined') {
              studentName = cert.user.name.trim();
              console.log(`   Using user name: "${studentName}"`);
            } else if (cert.user.email) {
              // Fallback to email username
              studentName = cert.user.email.split('@')[0];
              studentName = studentName.charAt(0).toUpperCase() + studentName.slice(1);
              console.log(`   Using email-based name: "${studentName}"`);
            }
          } else {
            console.log(`   ❌ No user associated with certificate!`);
          }

          let courseTitle = cert.courseTitle || 'Course';
          let instructorName = cert.instructorName || 'Course Instructor';

          if (cert.course) {
            courseTitle = cert.course.title;
            if (cert.course.instructor) {
              if (typeof cert.course.instructor === 'object') {
                instructorName = cert.course.instructor.name || cert.course.instructor.username || 'Course Instructor';
              } else if (typeof cert.course.instructor === 'string') {
                instructorName = cert.course.instructor;
              }
            }
          }

          // Update certificate
          cert.studentName = studentName;
          cert.courseTitle = courseTitle;
          cert.instructorName = instructorName;

          await cert.save();
          console.log(`✅ Repaired: ${cert.certificateId}`);
          console.log(`   New studentName: "${studentName}"`);
          console.log(`   Course: "${courseTitle}"`);
          console.log(`   Instructor: "${instructorName}"`);
          
          repairedCount++;
        } else {
          console.log(`✅ Certificate ${cert.certificateId} is OK`);
        }
      } catch (error) {
        console.error(`❌ Error repairing certificate ${cert.certificateId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 ===== REPAIR SUMMARY =====');
    console.log(`✅ Total certificates checked: ${certificates.length}`);
    console.log(`🔧 Certificates repaired: ${repairedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    // Test specific certificates
    console.log('\n🔍 Testing specific certificates:');
    
    // Test the certificate from your validation link
    const testCert1 = await Certificate.findOne({ validationCode: 'AIXU-8TJL-50WV' })
      .populate('user', 'name email')
      .populate('course', 'title');
      
    if (testCert1) {
      console.log(`\n✅ Certificate AIXU-8TJL-50WV:`);
      console.log(`   Student: "${testCert1.studentName}"`);
      console.log(`   Course: "${testCert1.courseTitle}"`);
      console.log(`   Status: ${testCert1.status}`);
      console.log(`   User: ${testCert1.user ? `"${testCert1.user.name}" (${testCert1.user.email})` : 'NO USER'}`);
      console.log(`   Course: ${testCert1.course ? `"${testCert1.course.title}"` : 'NO COURSE'}`);
    } else {
      console.log('❌ Certificate AIXU-8TJL-50WV not found');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔗 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the repair
repairCertificates();