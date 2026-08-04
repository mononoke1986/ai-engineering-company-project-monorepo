document.addEventListener("DOMContentLoaded", () => {
	// DOM Elements
	const form = document.querySelector("form");
	const firstNameInput = document.getElementById("first_name");
	const lastNameInput = document.getElementById("last_name");
	const dateOfBirthInput = document.getElementById("date_of_birth");
	const emailInput = document.getElementById("email");
	const phoneInput = document.getElementById("phone");
	const preferredLanguageSelect = document.getElementById("preferred_language");
	const preferredClinicSelect = document.getElementById("preferred_clinic");
	const preferredDateInput = document.getElementById("preferred_date");
	const preferredTimeSelect = document.getElementById("preferred_time");
	const serviceTypeSelect = document.getElementById("service_type");
	const newPatientRadios = document.querySelectorAll('input[name="new_patient"]');
	const hasInsuranceRadios = document.querySelectorAll('input[name="has_insurance"]');
	const insuranceFields = document.getElementById("insuranceFields");
	const insuranceProviderInput = document.getElementById("insurance_provider");
	const insuranceMemberIdInput = document.getElementById("insurance_member_id");
	const patientIdField = document.getElementById("patientIdField");
	const patientIdInput = document.getElementById("patient_id");
	const healthConcernTextarea = document.getElementById("health_concern");
	const charCount = document.getElementById("charCount");
	const contactConsentCheckbox = document.getElementById("contact_consent");

	// Error Messages
	const errorMessages = {
		first_name: "First name must contain only letters and be at least 2 characters long",
		last_name: "Last name must contain only letters and be at least 2 characters long",
		date_of_birth: "Enter a valid date of birth. Patient age must be between 0 and 120 years.",
		email: "Enter a valid email address (example: name@provider.com)",
		phone: "Phone number must include a country code (example: +1 305 555 0191)",
		preferred_language: "Select your preferred language",
		preferred_clinic: "Select the clinic you would like to visit",
		preferred_date: "Select a date at least 1 business day from today and no more than 60 days ahead",
		preferred_time: "Select your preferred appointment time",
		service_type: "Select the type of care you are looking for",
		service_type_paediatric: "Paediatric Care is available for patients under 18 years old. Please review the date of birth or select another service.",
		new_patient: "Indicate whether this is your first visit to HealthCore",
		has_insurance: "Indicate whether you have health insurance",
		insurance_provider: "Enter your insurance provider",
		insurance_member_id: "Member ID must contain 6 to 20 alphanumeric characters",
		health_concern: "Describe your medical concern using at least 20 characters (X characters remaining)",
		contact_consent: "You must consent to being contacted before submitting the form"
	};

	// Validation Functions
	function validateFirstName() {
		// Validate first_name field.
		return true;
	}

	function validateLastName() {
		// Validate last_name field.
		return true;
	}

	function validateDateOfBirth() {
		// Validate date_of_birth field.
		return true;
	}

	function validateEmail() {
		// Validate email field.
		return true;
	}

	function validatePhone() {
		// Validate phone field.
		return true;
	}

	function validatePreferredLanguage() {
		// Validate preferred_language field.
		return true;
	}

	function validatePreferredClinic() {
		// Validate preferred_clinic field.
		return true;
	}

	function validatePreferredDate() {
		// Validate preferred_date field.
		return true;
	}

	function validatePreferredTime() {
		// Validate preferred_time field.
		return true;
	}

	function validateServiceType() {
		// Validate service_type field.
		return true;
	}

	function validateHasInsurance() {
		// Validate has_insurance field.
		return true;
	}

	function validateInsuranceProvider() {
		// Validate insurance_provider field.
		return true;
	}

	function validateInsuranceMemberId() {
		// Validate insurance_member_id field.
		return true;
	}

	function validatePatientId() {
		// Validate patient_id field for returning patients.
		return true;
	}

	function validateHealthConcern() {
		// Validate health_concern field.
		return true;
	}

	function validateConsent() {
		// Validate contact_consent field.
		return true;
	}

	// Helper Functions
	function showError() {
		// Display the appropriate error message for a field.
	}

	function clearError() {
		// Clear the error message for a field.
	}

	function updateCharacterCounter() {
		// Update the live character count for health_concern.
	}

	function toggleInsuranceFields() {
		// Show or hide insuranceFields based on has_insurance selection.
	}

	function togglePatientIdField() {
		// Show or hide patientIdField based on new_patient selection.
	}

	// Event Listeners
	firstNameInput.addEventListener("input", validateFirstName);
	lastNameInput.addEventListener("input", validateLastName);
	emailInput.addEventListener("input", validateEmail);
	phoneInput.addEventListener("input", validatePhone);
	healthConcernTextarea.addEventListener("input", () => {
		updateCharacterCounter();
		validateHealthConcern();
	});

	firstNameInput.addEventListener("blur", validateFirstName);
	lastNameInput.addEventListener("blur", validateLastName);
	dateOfBirthInput.addEventListener("blur", validateDateOfBirth);
	emailInput.addEventListener("blur", validateEmail);
	phoneInput.addEventListener("blur", validatePhone);
	preferredDateInput.addEventListener("blur", validatePreferredDate);
	healthConcernTextarea.addEventListener("blur", validateHealthConcern);

	preferredLanguageSelect.addEventListener("change", validatePreferredLanguage);
	preferredClinicSelect.addEventListener("change", validatePreferredClinic);
	preferredDateInput.addEventListener("change", validatePreferredDate);
	preferredTimeSelect.addEventListener("change", validatePreferredTime);
	serviceTypeSelect.addEventListener("change", validateServiceType);
	contactConsentCheckbox.addEventListener("change", validateConsent);

	newPatientRadios.forEach((radio) => {
		radio.addEventListener("change", () => {
			togglePatientIdField();
			validatePatientId();
		});
	});

	hasInsuranceRadios.forEach((radio) => {
		radio.addEventListener("change", () => {
			toggleInsuranceFields();
			validateHasInsurance();
			validateInsuranceProvider();
			validateInsuranceMemberId();
		});
	});

	insuranceProviderInput.addEventListener("blur", validateInsuranceProvider);
	insuranceMemberIdInput.addEventListener("blur", validateInsuranceMemberId);
	patientIdInput.addEventListener("blur", validatePatientId);

	// Submit Handler
	form.addEventListener("submit", (event) => {
		validateFirstName();
		validateLastName();
		validateDateOfBirth();
		validateEmail();
		validatePhone();
		validatePreferredLanguage();
		validatePreferredClinic();
		validatePreferredDate();
		validatePreferredTime();
		validateServiceType();
		validateHasInsurance();
		validateInsuranceProvider();
		validateInsuranceMemberId();
		validatePatientId();
		validateHealthConcern();
		validateConsent();
	});
});
