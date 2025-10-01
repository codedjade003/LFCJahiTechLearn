import cron from "node-cron";
import { Course } from '../models/Course.js';
import { Submission } from '../models/Submission.js';import Enrollment from "../models/Enrollment.js";

// Run every day at 8:00 AM server time
cron.schedule("0 8 * * *", async () => {
  console.log('⏰ Running notification cron job...');
  const now = new Date();
  const upcoming = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  const courses = await Course.find({
    $or: [
      { "assignments.dueDate": { $lte: upcoming, $gte: now } },
      { "project.dueDate": { $lte: upcoming, $gte: now } },
    ],
  });

  for (const course of courses) {
    const enrollments = await Enrollment.find({ course: course._id }).populate("user");

    for (const enroll of enrollments) {
      for (const assignment of course.assignments) {
        if (assignment.dueDate <= upcoming && assignment.dueDate >= now) {
          await callCreateNotification({
            userId: enroll.user._id,
            title: `Assignment due soon: ${assignment.title}`,
            type: "assignment",
            link: `/courses/${course._id}/assignments/${assignment._id}`,
            dueDate: assignment.dueDate,
          });
        }
      }

      if (course.project?.dueDate <= upcoming && course.project?.dueDate >= now) {
        await callCreateNotification({
          userId: enroll.user._id,
          title: `Project due soon: ${course.project.title}`,
          type: "project",
          link: `/courses/${course._id}/project`,
          dueDate: course.project.dueDate,
        });
      }
    }
  }
  console.log('✅ Cron job completed');
});