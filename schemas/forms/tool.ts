import { z } from "zod";

import { SharedAttributes } from "../_shared";
export const ToolStatus = z.enum(["active", "inactive", "deprecated"]);

export const ToolSchema = SharedAttributes.extend({
  name: z.string().describe("Name of the tool"),
  description: z
    .string()
    .describe("Description of the tool's purpose and functionality"),
  url: z
    .string()
    .url()
    .describe("URL where the tool can be accessed or downloaded"),
  groupId: z.string().describe("ID of the group this tool belongs to"),
  purposes: z
    .array(
      z.object({
        id: z.number(),
        value: z.string(),
        order: z.string(),
      })
    )
    .describe("List of purposes, each with an id, value, and order"),
  category: z
    .object({
      id: z.number(),
      value: z.string(),
      order: z.string(),
      color: z.string(),
    })
    .describe("Category of the tool"),
  tags: z
    .array(
      z.object({
        id: z.number(),
        value: z.string(),
        order: z.string(),
        color: z.string(),
      })
    )
    .describe("List of tags, each with an id, value, order, and color"),
  version: z.string().describe("Current version of the tool"),
  status: ToolStatus.describe("Current status of the tool"),
  icon: z
    .string()
    .url()
    .optional()
    .describe("Optional icon or logo for the tool"),
  documentationUrl: z
    .string()
    .url()
    .optional()
    .describe("Optional documentation URL for the tool"),
  koksmat_masterdataref: z.string().optional(),
  koksmat_masterdata_id: z.string().optional(),
  koksmat_masterdata_etag: z.string().optional(),
  // supportContact: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       value: z.string(),
  //       order: z.string(),
  //     })
  //   )
  //   .optional()
  //   .describe("Optional support contact for the tool"),
  // license: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       value: z.string(),
  //       order: z.string(),
  //     })
  //   )
  //   .optional()
  //   .describe("Optional license information for the tool"),
  // compatiblePlatforms: z
  //   .array(z.string())
  //   .optional()
  //   .describe("Optional array of compatible platforms"),
  // systemRequirements: z
  //   .string()
  //   .optional()
  //   .describe("Optional minimum system requirements"),
  // relatedToolIds: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       value: z.string(),
  //       order: z.string(),
  //     })
  //   )
  //   .optional()
  //   .describe("Optional array of related tools"),
  countries: z
    .array(
      z.object({
        id: z.number(),
        value: z.string(),
        order: z.string(),
      })
    )
    .optional()
    .describe("Countries involved in the tool's development or usage"),
  // repositoryUrl: z
  //   .string()
  //   .url()
  //   .optional()
  //   .describe("URL of the tool's code repository"),
  // collaborationType: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       value: z.string(),
  //       order: z.string(),
  //     })
  //   )
  //   .optional()
  //   .describe("Type of collaboration (e.g., 'Open Source', 'Internal')"),
  documents: z
    .array(
      z.object({
        name: z.string(),
        url: z.string().url(),
      })
    )
    .optional()
    .describe("Array of important documents related to the tool"),
  // teamSize: z
  //   .number()
  //   .optional()
  //   .describe("Number of team members working on the tool"),
  // primaryFocus: z
  //   .array(
  //     z.object({
  //       id: z.string(),
  //       value: z.string(),
  //       order: z.string(),
  //     })
  //   )
  //   .optional()
  //   .describe(
  //     "Primary focus or category of the tool (e.g., 'Business Productivity')"
  //   ),
});

export type Tool = z.infer<typeof ToolSchema>;
export const mockdata: Tool[] = [
  // {
  //   id: 1,
  //   createdAt: new Date("2021-01-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-06-01T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Microsoft Teams",
  //   description: "Team collaboration and communication platform",
  //   url: "https://www.microsoft.com/en-us/microsoft-teams/group-chat-software",
  //   groupId: "group1",
  //   purposes: [
  //     { id: "purpose1", value: "Collaboration", order: "1" },
  //     { id: "purpose2", value: "Communication", order: "2" },
  //   ],
  //   tags: [
  //     { id: "tag1", value: "Productivity", order: "1", color: "#0078D7" },
  //     { id: "tag2", value: "Teamwork", order: "2", color: "#0078D7" },
  //   ],
  //   version: "1.5.00.8070",
  //   status: "active",
  //   icon: "https://example.com/teams-icon.png",
  //   documentationUrl: "https://docs.microsoft.com/en-us/microsoftteams/",
  //   supportContact: [
  //     { id: "email", value: "support@microsoft.com", order: "1" },
  //   ],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Windows", "macOS", "iOS", "Android", "Web"],
  //   systemRequirements: "Windows 10 or later, macOS 10.14 or later",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   repositoryUrl: "https://github.com/microsoft/teams",
  //   collaborationType: [{ id: "type1", value: "Proprietary", order: "1" }],
  //   documents: [
  //     { name: "User Guide", url: "https://example.com/teams-user-guide.pdf" },
  //   ],
  //   teamSize: 500,
  //   primaryFocus: [{ id: "focus1", value: "Communication", order: "1" }],
  // },
  // {
  //   id: 2,
  //   createdAt: new Date("2021-02-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-06-15T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Microsoft Word",
  //   description: "Word processing software",
  //   url: "https://www.microsoft.com/en-us/microsoft-365/word",
  //   groupId: "group1",
  //   purposes: [{ id: "purpose3", value: "Document Creation", order: "1" }],
  //   tags: [{ id: "tag1", value: "Productivity", order: "1", color: "#0078D7" }],
  //   version: "16.0.13929.20296",
  //   status: "active",
  //   icon: "https://example.com/word-icon.png",
  //   documentationUrl: "https://support.microsoft.com/en-us/word",
  //   supportContact: [
  //     { id: "email", value: "support@microsoft.com", order: "1" },
  //   ],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Windows", "macOS", "iOS", "Android", "Web"],
  //   systemRequirements: "Windows 10 or later, macOS 10.14 or later",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type1", value: "Proprietary", order: "1" }],
  //   documents: [
  //     { name: "Getting Started", url: "https://example.com/word-guide.pdf" },
  //   ],
  //   teamSize: 800,
  //   primaryFocus: [{ id: "focus1", value: "Productivity", order: "1" }],
  // },
  // // Google Workspace Tools
  // {
  //   id: 3,
  //   createdAt: new Date("2021-03-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-07-01T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Google Docs",
  //   description: "Online document editor",
  //   url: "https://docs.google.com",
  //   groupId: "group2",
  //   purposes: [{ id: "purpose3", value: "Document Creation", order: "1" }],
  //   tags: [
  //     { id: "tag2", value: "Collaboration", order: "1", color: "#4285F4" },
  //   ],
  //   version: "N/A",
  //   status: "active",
  //   icon: "https://example.com/google-docs-icon.png",
  //   documentationUrl: "https://support.google.com/docs",
  //   supportContact: [{ id: "email", value: "support@google.com", order: "1" }],
  //   license: [{ id: "freemium", value: "Freemium", order: "1" }],
  //   compatiblePlatforms: ["Web", "iOS", "Android"],
  //   systemRequirements: "Modern web browser",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type2", value: "Cloud-Based", order: "1" }],
  //   documents: [
  //     { name: "FAQ", url: "https://example.com/google-docs-faq.pdf" },
  //   ],
  //   teamSize: 300,
  //   primaryFocus: [{ id: "focus1", value: "Productivity", order: "1" }],
  // },
  // {
  //   id: 4,
  //   createdAt: new Date("2021-04-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-07-15T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Google Sheets",
  //   description: "Online spreadsheet editor",
  //   url: "https://sheets.google.com",
  //   groupId: "group2",
  //   purposes: [
  //     { id: "purpose3", value: "Data Analysis", order: "1" },
  //     { id: "purpose4", value: "Spreadsheet Management", order: "2" },
  //   ],
  //   tags: [
  //     { id: "tag2", value: "Collaboration", order: "1", color: "#34A853" },
  //   ],
  //   version: "N/A",
  //   status: "active",
  //   icon: "https://example.com/google-sheets-icon.png",
  //   documentationUrl: "https://support.google.com/sheets",
  //   supportContact: [{ id: "email", value: "support@google.com", order: "1" }],
  //   license: [{ id: "freemium", value: "Freemium", order: "1" }],
  //   compatiblePlatforms: ["Web", "iOS", "Android"],
  //   systemRequirements: "Modern web browser",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type2", value: "Cloud-Based", order: "1" }],
  //   documents: [
  //     {
  //       name: "User Manual",
  //       url: "https://example.com/google-sheets-manual.pdf",
  //     },
  //   ],
  //   teamSize: 250,
  //   primaryFocus: [{ id: "focus1", value: "Productivity", order: "1" }],
  // },
  // // Adobe Creative Cloud Tools
  // {
  //   id: 5,
  //   createdAt: new Date("2021-05-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-08-01T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Adobe Photoshop",
  //   description: "Image editing software",
  //   url: "https://www.adobe.com/products/photoshop.html",
  //   groupId: "group3",
  //   purposes: [{ id: "purpose5", value: "Graphic Design", order: "1" }],
  //   tags: [{ id: "tag3", value: "Design", order: "1", color: "#001E36" }],
  //   version: "2021 (22.4.2)",
  //   status: "active",
  //   icon: "https://example.com/photoshop-icon.png",
  //   documentationUrl: "https://helpx.adobe.com/photoshop",
  //   supportContact: [{ id: "email", value: "support@adobe.com", order: "1" }],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Windows", "macOS"],
  //   systemRequirements: "Windows 10 or later, macOS 10.15 or later",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type1", value: "Proprietary", order: "1" }],
  //   documents: [
  //     {
  //       name: "Tutorials",
  //       url: "https://example.com/photoshop-tutorials.pdf",
  //     },
  //   ],
  //   teamSize: 1000,
  //   primaryFocus: [{ id: "focus1", value: "Design", order: "1" }],
  // },
  // {
  //   id: 6,
  //   createdAt: new Date("2021-06-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-08-15T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Adobe Illustrator",
  //   description: "Vector graphics editor",
  //   url: "https://www.adobe.com/products/illustrator.html",
  //   groupId: "group3",
  //   purposes: [{ id: "purpose5", value: "Graphic Design", order: "1" }],
  //   tags: [{ id: "tag3", value: "Design", order: "1", color: "#FF9A00" }],
  //   version: "2021 (25.3.1)",
  //   status: "active",
  //   icon: "https://example.com/illustrator-icon.png",
  //   documentationUrl: "https://helpx.adobe.com/illustrator",
  //   supportContact: [{ id: "email", value: "support@adobe.com", order: "1" }],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Windows", "macOS"],
  //   systemRequirements: "Windows 10 or later, macOS 10.15 or later",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type1", value: "Proprietary", order: "1" }],
  //   documents: [
  //     {
  //       name: "Getting Started",
  //       url: "https://example.com/illustrator-guide.pdf",
  //     },
  //   ],
  //   teamSize: 800,
  //   primaryFocus: [{ id: "focus1", value: "Design", order: "1" }],
  // },
  // // Slack Tools
  // {
  //   id: 7,
  //   createdAt: new Date("2021-07-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-09-01T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Slack",
  //   description: "Team communication platform",
  //   url: "https://slack.com",
  //   groupId: "group4",
  //   purposes: [{ id: "purpose1", value: "Communication", order: "1" }],
  //   tags: [{ id: "tag4", value: "Messaging", order: "1", color: "#611F69" }],
  //   version: "4.19.2",
  //   status: "active",
  //   icon: "https://example.com/slack-icon.png",
  //   documentationUrl: "https://slack.com/help",
  //   supportContact: [{ id: "email", value: "feedback@slack.com", order: "1" }],
  //   license: [{ id: "freemium", value: "Freemium", order: "1" }],
  //   compatiblePlatforms: ["Windows", "macOS", "Linux", "iOS", "Android", "Web"],
  //   systemRequirements: "Windows 7 or later, macOS 10.10 or later",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type2", value: "Cloud-Based", order: "1" }],
  //   documents: [
  //     { name: "User Guide", url: "https://example.com/slack-user-guide.pdf" },
  //   ],
  //   teamSize: 2000,
  //   primaryFocus: [{ id: "focus1", value: "Communication", order: "1" }],
  // },
  // // Atlassian Suite Tools
  // {
  //   id: 8,
  //   createdAt: new Date("2021-08-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-09-15T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Jira Software",
  //   description: "Project tracking software",
  //   url: "https://www.atlassian.com/software/jira",
  //   groupId: "group5",
  //   purposes: [{ id: "purpose2", value: "Project Management", order: "1" }],
  //   tags: [{ id: "tag5", value: "Tracking", order: "1", color: "#0052CC" }],
  //   version: "8.17.1",
  //   status: "active",
  //   icon: "https://example.com/jira-icon.png",
  //   documentationUrl: "https://confluence.atlassian.com/jira",
  //   supportContact: [
  //     { id: "email", value: "support@atlassian.com", order: "1" },
  //   ],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Web"],
  //   systemRequirements: "Modern web browser",
  //   countries: [{ id: "country2", value: "Australia", order: "1" }],
  //   collaborationType: [{ id: "type2", value: "Cloud-Based", order: "1" }],
  //   documents: [
  //     {
  //       name: "Admin Guide",
  //       url: "https://example.com/jira-admin-guide.pdf",
  //     },
  //   ],
  //   teamSize: 1500,
  //   primaryFocus: [{ id: "focus2", value: "Project Management", order: "1" }],
  // },
  // {
  //   id: 9,
  //   createdAt: new Date("2021-09-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-10-01T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Confluence",
  //   description: "Team collaboration software",
  //   url: "https://www.atlassian.com/software/confluence",
  //   groupId: "group5",
  //   purposes: [
  //     { id: "purpose1", value: "Collaboration", order: "1" },
  //     { id: "purpose3", value: "Documentation", order: "2" },
  //   ],
  //   tags: [
  //     { id: "tag5", value: "Knowledge Base", order: "1", color: "#36B37E" },
  //   ],
  //   version: "7.12.2",
  //   status: "active",
  //   icon: "https://example.com/confluence-icon.png",
  //   documentationUrl: "https://confluence.atlassian.com/confluence",
  //   supportContact: [
  //     { id: "email", value: "support@atlassian.com", order: "1" },
  //   ],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Web"],
  //   systemRequirements: "Modern web browser",
  //   countries: [{ id: "country2", value: "Australia", order: "1" }],
  //   collaborationType: [{ id: "type2", value: "Cloud-Based", order: "1" }],
  //   documents: [
  //     {
  //       name: "User Guide",
  //       url: "https://example.com/confluence-user-guide.pdf",
  //     },
  //   ],
  //   teamSize: 1200,
  //   primaryFocus: [{ id: "focus1", value: "Collaboration", order: "1" }],
  // },
  // // Additional Tools
  // {
  //   id: 10,
  //   createdAt: new Date("2021-10-01T00:00:00Z"),
  //   createdBy: "user_admin",
  //   updatedAt: new Date("2021-11-01T00:00:00Z"),
  //   updatedBy: "user_admin",
  //   deletedAt: null,
  //   deletedBy: null,
  //   name: "Salesforce CRM",
  //   description: "Customer relationship management platform",
  //   url: "https://www.salesforce.com/crm/",
  //   groupId: "group6",
  //   purposes: [{ id: "purpose4", value: "Sales Management", order: "1" }],
  //   tags: [{ id: "tag6", value: "CRM", order: "1", color: "#00A1E0" }],
  //   version: "Summer '21",
  //   status: "active",
  //   icon: "https://example.com/salesforce-icon.png",
  //   documentationUrl: "https://help.salesforce.com",
  //   supportContact: [
  //     { id: "email", value: "support@salesforce.com", order: "1" },
  //   ],
  //   license: [{ id: "commercial", value: "Commercial", order: "1" }],
  //   compatiblePlatforms: ["Web", "iOS", "Android"],
  //   systemRequirements: "Modern web browser",
  //   countries: [{ id: "country1", value: "USA", order: "1" }],
  //   collaborationType: [{ id: "type2", value: "Cloud-Based", order: "1" }],
  //   documents: [
  //     {
  //       name: "Admin Guide",
  //       url: "https://example.com/salesforce-admin-guide.pdf",
  //     },
  //   ],
  //   teamSize: 3000,
  //   primaryFocus: [{ id: "focus3", value: "Sales", order: "1" }],
  // },
];
