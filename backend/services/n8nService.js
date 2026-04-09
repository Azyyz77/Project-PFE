const axios = require("axios");

const N8N_WEBHOOK_URL = "https://dali777777.app.n8n.cloud/webhook/appointment-created";
async function triggerAppointmentWorkflow(data) {
  try {
    await axios.post(N8N_WEBHOOK_URL, data);
    console.log("✅ n8n workflow triggered");
  } catch (error) {
    console.error("⚠️ n8n trigger failed (non-blocking):", error.message);
  }
}

module.exports = { triggerAppointmentWorkflow };