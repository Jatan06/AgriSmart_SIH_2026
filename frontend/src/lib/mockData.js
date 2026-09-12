export const MOCK_API_RESPONSE = {
  success: true,
  ml_result: {
    disease_class: "Tomato_Septoria_leaf_spot",
    confidence: 0.8734,
    severity: "High"
  },
  weather_context: {
    temperature_c: 32.5,
    humidity: 78,
    rain_probability: 85
  },
  agent_advice: {
    headline: "Apply Fungicide Before Rain",
    action_steps: [
      "Remove all visibly affected leaves immediately.",
      "Apply Mancozeb-based fungicide before the rain tomorrow."
    ],
    sustainability_impact: {
      water_saved_liters_per_acre: 12000,
      chemical_reduction_percent: 15,
      methodology_note: "Early intervention avoids heavy spraying later."
    },
    translated_message: "Apply fungicide today before the rain arrives."
  }
};
