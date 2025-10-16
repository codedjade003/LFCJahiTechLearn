// src/config/onboardingTours.ts
import type { Step } from "react-joyride";

export const courseDetailsTour: Step[] = [
  {
    target: "body",
    content: "Welcome to the course details page! Let's explore what you can do here.",
    placement: "center",
  },
  {
    target: '[data-tour="course-info"]',
    content: "Here you'll find the course description, instructor info, and learning objectives.",
    placement: "bottom",
  },
  {
    target: '[data-tour="course-content"]',
    content: "Browse through all course modules and sections here. Click on any module to start learning.",
    placement: "right",
  },
  {
    target: '[data-tour="enroll-button"]',
    content: "Click here to enroll in the course and start your learning journey!",
    placement: "bottom",
  },
];

export const adminDashboardTour: Step[] = [
  {
    target: "body",
    content: "Welcome to the Admin Dashboard! Let's show you around.",
    placement: "center",
  },
  {
    target: '[data-tour="stats"]',
    content: "Monitor key metrics: total users, active courses, and pending assessments.",
    placement: "bottom",
  },
  {
    target: '[data-tour="recent-activity"]',
    content: "Track recent user activities and system events here.",
    placement: "top",
  },
  {
    target: '[data-tour="pending-assessments"]',
    content: "View and manage pending assignments, projects, and quizzes that need grading.",
    placement: "left",
  },
];

export const courseManagementTour: Step[] = [
  {
    target: '[data-tour="create-course"]',
    content: "Click here to create a new course.",
    placement: "bottom",
  },
  {
    target: '[data-tour="course-list"]',
    content: "All your courses are listed here. Click on any course to edit or view details.",
    placement: "top",
  },
  {
    target: '[data-tour="course-filters"]',
    content: "Use filters to quickly find specific courses by status, category, or level.",
    placement: "bottom",
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
