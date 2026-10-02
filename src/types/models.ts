export interface Paciente {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  preferred_language: "English"| "Spanish";
  has_insurance: boolean;
}
export interface Cita  {
preferred_clinic: string;
preferred_date: string;
preferred_time: "Morning"| "Afternoon"| "Evening";
service_type: "Primary Care"|"Chronic Disease Management"|"Specialist Consultation"|"Preventive Health"|"Women's Health"|"Paediatric Care"|"Mental Health";
status: "pending" | "confirmed" | "cancelled" | "no-show";
}
