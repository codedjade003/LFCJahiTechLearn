// scripts/deleteAllCoursesAndEnrollments.js
import mongoose from 'mongoose';
import { Course } from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import { Submission } from './models/Submission.js';
import dotenv from "dotenv";

dotenv.config();

const deleteAllCoursesAndEnrollments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: "techlearn",
    });

    console.log('Connected to MongoDB');

    // Get counts before deletion
    const courseCount = await Course.countDocuments();
    const enrollmentCount = await Enrollment.countDocuments();
    const submissionCount = await Submission.countDocuments();

    console.log('📊 BEFORE DELETION:');
    console.log(`   Courses: ${courseCount}`);
    console.log(`   Enrollments: ${enrollmentCount}`);
    console.log(`   Submissions: ${submissionCount}`);

    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will delete ALL courses, enrollments, and submissions!');
    console.log('   This action cannot be undone!');
    
    // Simulate confirmation (remove this in production)
    console.log('   Proceeding with deletion in 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 1. Delete ALL enrollments
    console.log('\n🗑️  Deleting all enrollments...');
    const enrollmentResult = await Enrollment.deleteMany({});
    console.log(`   ✅ Deleted ${enrollmentResult.deletedCount} enrollments`);

    // 2. Delete ALL submissions
    console.log('🗑️  Deleting all submissions...');
    const submissionResult = await Submission.deleteMany({});
    console.log(`   ✅ Deleted ${submissionResult.deletedCount} submissions`);

    // 3. Delete ALL courses
    console.log('🗑️  Deleting all courses...');
    const courseResult = await Course.deleteMany({});
    console.log(`   ✅ Deleted ${courseResult.deletedCount} courses`);

    // Get counts after deletion
    const finalCourseCount = await Course.countDocuments();
    const finalEnrollmentCount = await Enrollment.countDocuments();
    const finalSubmissionCount = await Submission.countDocuments();

    console.log('\n📊 AFTER DELETION:');
    console.log(`   Courses: ${finalCourseCount}`);
    console.log(`   Enrollments: ${finalEnrollmentCount}`);
    console.log(`   Submissions: ${finalSubmissionCount}`);

    console.log('\n✅ Complete wipe completed successfully!');
    console.log('🎯 Database is now clean and ready for fresh data.');

  } catch (error) {
    console.error('❌ Error during deletion:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the script
deleteAllCoursesAndEnrollments();