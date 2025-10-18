// src/config/onboardingTours.ts
import type { Step } from "react-joyride";

export const courseDetailsTour: Step[] = [
  {
    target: "body",
    content: "Welcome to your course! Let's take a quick tour of the course page.",
    placement: "center",
  },
  {
    target: "header",
    content: "This is the course header. You can see the course title and navigate between Overview, Course Content, and Completion tabs.",
    placement: "bottom",
  },
  {
    target: "aside",
    content: "This sidebar shows all course sections and modules. Click on any module to start learning. Green checkmarks indicate completed modules.",
    placement: "right",
  },
  {
    target: "main",
    content: "This is the main content area where you'll watch videos, read PDFs, and take quizzes. Your progress is automatically tracked as you complete modules.",
    placement: "left",
  },
];

export const adminDashboardTour: Step[] = [
  {
    target: "body",
    content: "Welcome to the Admin Dashboard! This is your central hub for managing the learning platform. Let's take a quick tour.",
    placement: "center",
  },
  {
    target: '[data-tour="stats"]',
    content: "These cards show key metrics at a glance: total courses, active users, pending assessments, and at-risk users who need attention.",
    placement: "bottom",
  },
  {
    target: '[data-tour="recent-activity"]',
    content: "Track recent user activities and system events here. This helps you monitor what's happening across the platform in real-time.",
    placement: "top",
  },
  {
    target: '[data-tour="pending-assessments"]',
    content: "View and manage pending assignments, projects, and quizzes that need grading. Click on any item to grade and provide feedback.",
    placement: "left",
  },
  {
    target: "body",
    content: "Use the sidebar to navigate to Courses, Users, Assessments, and Support sections. Each section has powerful tools to manage your platform effectively.",
    placement: "center",
  },
];

export const courseManagementTour: Step[] = [
  {
    target: "body",
    content: "Welcome to the Course Creation page! Let's walk through how to create a new course.",
    placement: "center",
  },
  {
    target: "aside",
    content: "Use these tabs to navigate through different sections of course creation. Start with Details, then add Content, Assignments, Projects, Settings, and finally Publish.",
    placement: "right",
  },
];

export const assessmentGradingTour: Step[] = [
  {
    target: '[data-tour="pending-list"]',
    content: "All pending submissions are listed here, organized by due date.",
    placement: "right",
  },
  {
    target: '[data-tour="grade-submission"]',
    content: "Click on any submission to view student work and provide grades and feedback.",
    placement: "bottom",
  },
];

export const profileTour: Step[] = [
  {
    target: "body",
    content: "Welcome to your profile! Let's take a quick tour.",
    placement: "center",
  },
  {
    target: '[data-tour="profile-tabs"]',
    content: "Navigate between different sections of your profile using these tabs.",
    placement: "bottom",
  },
  {
    target: '[data-tour="edit-button"]',
    content: "Click here to edit your profile information.",
    placement: "left",
  },
  {
    target: '[data-tour="preferences-tab"]',
    content: "💡 Pro tip: Visit the Preferences tab to customize your experience, including turning off these onboarding tours and switching between light/dark themes!",
    placement: "bottom",
  },
];
