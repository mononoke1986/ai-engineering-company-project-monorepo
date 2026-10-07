import type { PatientInquiry, Clinic } from "./types/models";
import {
  filterInquiriesByClinic,
  filterByService,
  sortByLastName,
} from "./utils/collections";
import { findInquiryByEmail, binarySearchClinicByName } from "./utils/search";
import {
  countInquiriesByClinic,
  countInquiriesByService,
  percentageWithInsurance,
} from "./utils/transformations";
import { validateInquiry } from "./utils/validations";

const today = new Date(2026, 9, 5);

const inquiries: PatientInquiry[] = [
  {
    first_name: "María",
    last_name: "Pérez",
    date_of_birth: "1990-04-12",
    email: "maria@mail.com",
    phone: "+1 305 555 0191",
    preferred_language: "Spanish",
    preferred_clinic: "HealthCore Miami",
    preferred_date: "2026-10-12",
    preferred_time: "Morning",
    service_type: "Primary Care",
    new_patient: "Yes",
    has_insurance: "Yes",
    insurance_provider: "Aetna",
    insurance_member_id: "AB12CD34",
    health_concern: "Dolor de cabeza frecuente desde hace una semana",
    contact_consent: true,
  },
  {
    first_name: "John",
    last_name: "Alvarez",
    date_of_birth: "2015-03-10",
    email: "john@mail.com",
    phone: "+1 512 555 0100",
    preferred_language: "English",
    preferred_clinic: "HealthCore Austin Central",
    preferred_date: "2026-10-13",
    preferred_time: "Afternoon",
    service_type: "Paediatric Care",
    new_patient: "No",
    has_insurance: "No",
    health_concern: "Revision anual y vacunas para mi hijo",
    contact_consent: true,
  },
  {
    first_name: "Ana",
    last_name: "Zapata",
    date_of_birth: "1985-08-30",
    email: "ana@mail",
    phone: "305 555 0191",
    preferred_language: "Spanish",
    preferred_clinic: "HealthCore Miami",
    preferred_date: "2026-10-05",
    preferred_time: "Evening",
    service_type: "Mental Health",
    new_patient: "Yes",
    has_insurance: "No",
    health_concern: "Me duele",
    contact_consent: false,
  },
];

const clinics: Clinic[] = [
  { name: "HealthCore Atlanta", city: "Atlanta", state: "GA", phone: "(404) 330-9900", hours: "Lun-Vie 8am-7pm" },
  { name: "HealthCore Austin Central", city: "Austin", state: "TX", phone: "(512) 340-8800", hours: "Lun-Vie 7am-8pm" },
  { name: "HealthCore Miami", city: "Miami", state: "FL", phone: "(305) 510-7700", hours: "Lun-Vie 7am-8pm" },
];

console.log("Filtrar por Miami:", filterInquiriesByClinic(inquiries, "HealthCore Miami").length);
console.log("Filtrar por Paediatric Care:", filterByService(inquiries, "Paediatric Care").length);
console.log("Ordenar asc:", sortByLastName(inquiries, "asc").map(i => i.last_name));
console.log("Ordenar desc:", sortByLastName(inquiries, "desc").map(i => i.last_name));
console.log("Buscar ana@mail:", findInquiryByEmail(inquiries, "ana@mail"));
console.log("Buscar zz@mail.com:", findInquiryByEmail(inquiries, "zz@mail.com"));
console.log("Binaria Miami:", binarySearchClinicByName(clinics, "HealthCore Miami"));
console.log("Binaria Orlando:", binarySearchClinicByName(clinics, "HealthCore Orlando"));
console.log("Por clinica:", countInquiriesByClinic(inquiries));
console.log("Por servicio:", countInquiriesByService(inquiries));
console.log("% con seguro:", percentageWithInsurance(inquiries));
console.log("Lista vacia, %:", percentageWithInsurance([]));
inquiries.forEach(i => console.log("Errores de", i.first_name, ":", validateInquiry(i, today)));