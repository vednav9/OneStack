export const TOPICS = [
  "Artificial Intelligence",
  "Machine Learning",
  "Web Development",
  "Distributed Systems",
  "Databases",
  "Startups",
  "DevOps",
  "Security",
  "Mobile",
  "Open Source",
  "Programming",
  "Architecture",
  "Design",
  "Cloud",
  "Data Engineering",
];

export const COMPANIES = [
  "Netflix",
  "Uber",
  "Airbnb",
  "Meta",
  "Google",
  "Amazon",
  "Twitter",
  "LinkedIn",
  "Stripe",
  "Shopify",
  "Discord",
  "Figma",
  "Notion",
  "Atlassian",
];

export const API_BASE_URL = "http://localhost:3000/api";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  BLOG: (id) => `/blog/${id}`,
  EXPLORE: "/explore",
  TRENDING: "/trending",
  SAVED: "/saved",
  HISTORY: "/history",
  LISTS: "/lists",
  PROFILE: (username) => `/profile/${username}`,
  SETTINGS: "/settings",
  SEARCH: (q) => `/search?q=${encodeURIComponent(q)}`,
  TOPIC: (topic) => `/topic/${encodeURIComponent(topic.toLowerCase().replace(/ /g, "-"))}`,
  ADMIN: "/admin",
};
