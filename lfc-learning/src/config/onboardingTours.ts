// src/config/onboardingTours.ts
import type { Step } from "react-joyride";

export const courseDetailsTour: Step[] = [
  {
    target: "body",
    content: "Welcome to your course! Let's take a quick tour of the course page.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "header",
    content: "This is the course header. You can see the course title and navigate between Overview, Course Content, and Completion tabs.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "aside",
    content: "This sidebar shows all course sections and modules. Click on any module to start learning. Green checkmarks indicate completed modules.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: "main",
    content: "This is the main content area where you'll watch videos, read PDFs, and take quizzes. Your progress is automatically tracked as you complete modules.",
    placement: "right",
    disableBeacon: true,
  },
];

export const adminDashboardTour: Step[] = [
  {
    target: "body",
    content: "Welcome to the Admin Dashboard! This is your central hub for managing the learning platform. Let's take a quick tour.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="stats"]',
    content: "These cards show key metrics at a glance: total courses, active users, pending assessments, and at-risk users who need attention.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="recent-activity"]',
    content: "Track recent user activities and system events here. This helps you monitor what's happening across the platform in real-time.",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: '[data-tour="pending-assessments"]',
    content: "View and manage pending assignments, projects, and quizzes that need grading. Click on any item to grade and provide feedback.",
    placement: "top",
    disableBeacon: true,
  },
  {
    target: "body",
    content: "Use the sidebar to navigate to Courses, Users, Assessments, and Support sections. Each section has powerful tools to manage your platform effectively.",
    placement: "center",
    disableBeacon: true,
  },
];

export const courseManagementTour: Step[] = [
  {
    target: "body",
    content: "Welcome to the Course Creation page! Let's walk through how to create a new course.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "aside",
    content: "Use these tabs to navigate through different sections of course creation. Start with Details, then add Content, Assignments, Projects, Settings, and finally Publish.",
    placement: "right",
    disableBeacon: true,
  },
];

export const assessmentGradingTour: Step[] = [
  {
    target: '[data-tour="pending-list"]',
    content: "All pending submissions are listed here, organized by due date.",
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="grade-submission"]',
    content: "Click on any submission to view student work and provide grades and feedback.",
    placement: "top",
    disableBeacon: true,
  },
];

export const profileTour: Step[] = [
  {
    target: "body",
    content: "Welcome to your profile! Let's take a quick tour.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-tabs"]',
    content: "Navigate between different sections of your profile using these tabs.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="edit-button"]',
    content: "Click here to edit your profile information.",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: '[data-tour="preferences-tab"]',
    content: "💡 Pro tip: Visit the Preferences tab to customize your experience, including turning off these onboarding tours and switching between light/dark themes!",
    placement: "top",
    disableBeacon: true,
  },
];

export const myCoursesTour: Step[] = [
  {
    target: "body",
    content: "Welcome to My Courses! Here you can see all the courses you're enrolled in and track your progress.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="course-card"]',
    content: "Each card shows your course progress, last accessed date, and quick actions. Click on a course to continue learning!",
    placement: "top",
    disableBeacon: true,
  },
];

export const assignmentsTour: Step[] = [
  {
    target: "body",
    content: "Welcome to your Assignments page! Here you can view all your assignments across all courses.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="assignment-filters"]',
    content: "Use these filters to view assignments by status: All, Pending, Submitted, or Graded.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="assignment-card"]',
    content: "Each assignment card shows the due date, status, and course. Click to view details and submit your work.",
    placement: "top",
    disableBeacon: true,
  },
];

export const surveyResponsesTour: Step[] = [
  {
    target: "body",
    content: "Welcome to Survey Responses! Here you can view and analyze feedback from students on course modules.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="filters"]',
    content: "Filter responses by course or module to focus on specific feedback.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: '[data-tour="export"]',
    content: "Export survey data to CSV for detailed analysis in Excel or other tools.",
    placement: "left",
    disableBeacon: true,
  },
  {
    target: '[data-tour="responses-table"]',
    content: "View all survey responses with student information, ratings, and text feedback. Use this data to improve your courses!",
    placement: "top",
    disableBeacon: true,
  },
];
