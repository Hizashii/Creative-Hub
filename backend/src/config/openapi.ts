/** OpenAPI 3 document for Swagger UI (`/api/docs`). */
export const openapiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Creative Hub API",
    version: "1.0.0",
    description: "REST API for collaborative creative projects, briefs, tasks, assets, and feedback.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register (creates a client account)",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "JWT token" } },
      },
    },
    "/auth/me": {
      get: { summary: "Current user", responses: { "200": { description: "User" } } },
    },
    "/projects": {
      get: { summary: "List projects visible to the user", responses: { "200": { description: "Array" } } },
      post: { summary: "Create project", responses: { "201": { description: "Project" } } },
    },
    "/projects/{projectId}": {
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "Get project", responses: { "200": { description: "Project" } } },
      patch: { summary: "Update project", responses: { "200": { description: "Project" } } },
      delete: { summary: "Delete project", responses: { "204": { description: "No content" } } },
    },
    "/projects/{projectId}/columns": {
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "List columns", responses: { "200": { description: "Array" } } },
      post: { summary: "Create column", responses: { "201": { description: "Column" } } },
    },
    "/projects/{projectId}/tasks": {
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "List tasks", responses: { "200": { description: "Array" } } },
      post: { summary: "Create task", responses: { "201": { description: "Task" } } },
    },
    "/projects/{projectId}/members": {
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "List members", responses: { "200": { description: "Array" } } },
      post: { summary: "Add member", responses: { "201": { description: "Member" } } },
    },
    "/projects/{projectId}/assets": {
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "List assets", responses: { "200": { description: "Array" } } },
      post: { summary: "Add asset link", responses: { "201": { description: "Asset" } } },
    },
    "/projects/{projectId}/feedback": {
      parameters: [{ name: "projectId", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "List chat messages", responses: { "200": { description: "Array" } } },
      post: { summary: "Post message", responses: { "201": { description: "Feedback" } } },
    },
    "/briefs": {
      get: { summary: "List briefs", responses: { "200": { description: "Array" } } },
      post: { summary: "Submit brief (client)", responses: { "201": { description: "Brief" } } },
    },
    "/briefs/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      get: { summary: "Get brief", responses: { "200": { description: "Brief" } } },
      patch: { summary: "Update brief", responses: { "200": { description: "Brief" } } },
      delete: { summary: "Delete brief", responses: { "204": { description: "No content" } } },
    },
    "/briefs/{id}/accept": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      post: { summary: "Accept brief and spawn project (admin)", responses: { "201": { description: "Result" } } },
    },
    "/admin/users": {
      get: { summary: "List users (admin)", responses: { "200": { description: "Array" } } },
    },
    "/admin/projects": {
      get: { summary: "List all projects (admin)", responses: { "200": { description: "Array" } } },
    },
  },
} as const;
