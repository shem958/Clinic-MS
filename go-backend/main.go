package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"smart-clinic-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Configure CORS for Next.js frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Serve Swagger JSON Spec
	r.GET("/docs/swagger.json", func(c *gin.Context) {
		c.File("./docs/swagger.json")
	})

	// Interactive Swagger UI Page
	r.GET("/swagger/index.html", func(c *gin.Context) {
		html := `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smart Clinic REST API - Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.18.3/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/docs/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`
		c.Header("Content-Type", "text/html; charset=utf-8")
		c.String(http.StatusOK, html)
	})

	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/swagger/index.html")
	})

	// API Routes Group (v1)
	v1 := r.Group("/api/v1")
	{
		v1.GET("/health", handlers.HealthCheck)
		v1.POST("/auth/login", handlers.AuthLogin)
		v1.POST("/auth/admin-login", handlers.AdminLogin)
		v1.POST("/patient/activate", handlers.PatientActivate)
		v1.GET("/patients", handlers.GetPatients)
		v1.POST("/patients/walk-in", handlers.WalkInOnboarding)
		v1.POST("/patients/emergency-fast-track", handlers.EmergencyFastTrack)
		v1.GET("/triage", handlers.GetTriageRecords)
		v1.POST("/triage", handlers.RecordNurseTriage)
		v1.GET("/appointments", handlers.GetAppointments)
		v1.GET("/sms-logs", handlers.GetSmsLogs)
		v1.GET("/rbac/permissions", handlers.GetRBACPermissions)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Println("🏥 Smart Clinic Golang REST API Server starting on http://localhost:" + port)
	fmt.Println("📜 Interactive Swagger Documentation available at http://localhost:" + port + "/swagger/index.html")

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
