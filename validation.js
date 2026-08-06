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
	const currentLanguage = document.documentElement.lang === "es" ? "es" : "en";
	const clinicClosingTimes = {
		"HealthCore Austin Central": 20,
		"HealthCore Austin North": 19,
		"HealthCore San Antonio": 18,
		"HealthCore Miami": 20,
		"HealthCore Orlando": 18,
		"HealthCore Atlanta": 19
	};

	// Error Messages
	const errorMessages = {
		en: {
			first_name: "First name must contain only letters and be between 2 and 50 characters long, excluding spaces",
			last_name: "Last name must contain only letters and be between 2 and 50 characters long, excluding spaces",
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
			patient_id: "Patient ID must match the format HC- followed by exactly 6 letters or numbers",
			health_concern: "Describe your medical concern using at least 20 characters (X characters remaining)",
			contact_consent: "You must consent to being contacted before submitting the form"
		},
		es: {
			first_name: "El nombre debe contener solo letras y tener entre 2 y 50 caracteres, sin contar espacios",
			last_name: "El apellido debe contener solo letras y tener entre 2 y 50 caracteres, sin contar espacios",
			date_of_birth: "Ingresa una fecha de nacimiento válida. La edad del paciente debe estar entre 0 y 120 años.",
			email: "Ingresa un correo electrónico válido (ejemplo: nombre@proveedor.com)",
			phone: "El número de teléfono debe incluir un código de país (ejemplo: +1 305 555 0191)",
			preferred_language: "Selecciona tu idioma preferido",
			preferred_clinic: "Selecciona la clínica a la que deseas asistir",
			preferred_date: "Selecciona una fecha al menos 1 día hábil después de hoy y no más de 60 días hacia adelante",
			preferred_time: "Selecciona tu horario preferido para la cita",
			service_type: "Selecciona el tipo de atención que estás buscando",
			service_type_paediatric: "La Atención Pediátrica está disponible para pacientes menores de 18 años. Revisa la fecha de nacimiento o selecciona otro servicio.",
			new_patient: "Indica si esta es tu primera visita a HealthCore",
			has_insurance: "Indica si tienes seguro médico",
			insurance_provider: "Ingresa tu aseguradora",
			insurance_member_id: "El ID de afiliado debe contener entre 6 y 20 caracteres alfanuméricos",
			patient_id: "El ID de paciente debe coincidir con el formato HC- seguido de exactamente 6 letras o números",
			health_concern: "Describe tu consulta médica usando al menos 20 caracteres (faltan X caracteres)",
			contact_consent: "Debes dar tu consentimiento para ser contactado antes de enviar el formulario"
		}
	};
	const localizedErrorMessages = errorMessages[currentLanguage];
	const successMessages = {
		en: [
			"Thank you for contacting HealthCore.",
			"We have received your consultation request. A member of our front desk team will reach out within 1 business day to confirm your appointment details and answer any questions.",
			"If you need urgent assistance, please call your preferred clinic directly using the numbers listed on our website.",
			"We look forward to caring for you soon."
		],
		es: [
			"Gracias por contactar a HealthCore.",
			"Hemos recibido tu consulta. Un miembro de nuestro equipo de recepción se pondrá en contacto contigo dentro de 1 día hábil para confirmar los detalles de tu cita y responder cualquier pregunta.",
			"Si necesitas asistencia urgente, llama directamente a tu clínica preferida usando los números listados en nuestro sitio web.",
			"Esperamos poder atenderte pronto."
		]
	};

	// Validation Functions
	function validateFirstName() {
		const value = firstNameInput.value.trim();
		const normalizedLength = value.replace(/\s+/g, "").length;
		const isValid = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ ]+$/.test(value) && normalizedLength >= 2 && normalizedLength <= 50;

		if (!isValid) {
			showError("first_name");
			return false;
		}

		clearError("first_name");
		return true;
	}

	function validateLastName() {
		const value = lastNameInput.value.trim();
		const normalizedLength = value.replace(/\s+/g, "").length;
		const isValid = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ ]+$/.test(value) && normalizedLength >= 2 && normalizedLength <= 50;

		if (!isValid) {
			showError("last_name");
			return false;
		}

		clearError("last_name");
		return true;
	}

	function validateDateOfBirth() {
		const value = dateOfBirthInput.value;
		const birthDate = value ? new Date(`${value}T00:00:00`) : null;
		const today = new Date();
		let isValid = false;

		if (birthDate instanceof Date && !Number.isNaN(birthDate?.getTime())) {
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDifference = today.getMonth() - birthDate.getMonth();

			if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
				age -= 1;
			}

			isValid = age >= 0 && age <= 120;
		}

		if (!isValid) {
			showError("date_of_birth");
			return false;
		}

		clearError("date_of_birth");
		return true;
	}

	function validateEmail() {
		const value = emailInput.value.trim();
		const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

		if (!isValid) {
			showError("email");
			return false;
		}

		clearError("email");
		return true;
	}

	function validatePhone() {
		const value = phoneInput.value.trim();
		const isValid = /^\+[\d\s().-]{6,}$/.test(value);

		if (!isValid) {
			showError("phone");
			return false;
		}

		clearError("phone");
		return true;
	}

	function validatePreferredLanguage() {
		if (preferredLanguageSelect.value === "") {
			showError("preferred_language");
			return false;
		}

		clearError("preferred_language");
		return true;
	}

	function validatePreferredClinic() {
		if (preferredClinicSelect.value === "") {
			showError("preferred_clinic");
			return false;
		}

		clearError("preferred_clinic");
		return true;
	}

	function validatePreferredDate() {
		const value = preferredDateInput.value;
		const selectedDate = value ? new Date(`${value}T00:00:00`) : null;
		const today = new Date();
		const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		const maxDate = new Date(baseDate);
		let minBusinessDate = new Date(baseDate);

		minBusinessDate.setDate(minBusinessDate.getDate() + 1);
		while (minBusinessDate.getDay() === 0 || minBusinessDate.getDay() === 6) {
			minBusinessDate.setDate(minBusinessDate.getDate() + 1);
		}

		maxDate.setDate(maxDate.getDate() + 60);

		const isValid =
			selectedDate instanceof Date &&
			!Number.isNaN(selectedDate?.getTime()) &&
			selectedDate >= minBusinessDate &&
			selectedDate <= maxDate;

		if (!isValid) {
			showError("preferred_date");
			return false;
		}

		clearError("preferred_date");
		return true;
	}

	function validatePreferredTime() {
		if (preferredTimeSelect.value === "") {
			showError("preferred_time");
			return false;
		}

		clearError("preferred_time");
		return true;
	}

	function validateServiceType() {
		const value = serviceTypeSelect.value;

		delete serviceTypeSelect.dataset.errorMessage;

		if (value === "") {
			showError("service_type");
			return false;
		}

		if (value === "Paediatric Care" && dateOfBirthInput.value) {
			const birthDate = new Date(`${dateOfBirthInput.value}T00:00:00`);
			const today = new Date();
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDifference = today.getMonth() - birthDate.getMonth();

			if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
				age -= 1;
			}

			if (!Number.isNaN(birthDate.getTime()) && age >= 18) {
				serviceTypeSelect.dataset.errorMessage = localizedErrorMessages.service_type_paediatric;
				showError("service_type");
				return false;
			}
		}

		clearError("service_type");
		delete serviceTypeSelect.dataset.errorMessage;
		return true;
	}

	function validateHasInsurance() {
		const selectedOption = document.querySelector('input[name="has_insurance"]:checked');

		if (!selectedOption) {
			showError("has_insurance");
			return false;
		}

		clearError("has_insurance");
		return true;
	}

	function validateInsuranceProvider() {
		const selectedOption = document.querySelector('input[name="has_insurance"]:checked');

		if (!selectedOption || selectedOption.value === "No") {
			clearError("insurance_provider");
			return true;
		}

		if (insuranceProviderInput.value.trim() === "") {
			showError("insurance_provider");
			return false;
		}

		clearError("insurance_provider");
		return true;
	}

	function validateInsuranceMemberId() {
		const selectedOption = document.querySelector('input[name="has_insurance"]:checked');

		if (!selectedOption || selectedOption.value === "No") {
			clearError("insurance_member_id");
			return true;
		}

		const value = insuranceMemberIdInput.value.trim();
		const isValid = /^[A-Za-z0-9]{6,20}$/.test(value);

		if (!isValid) {
			showError("insurance_member_id");
			return false;
		}

		clearError("insurance_member_id");
		return true;
	}

	function validatePatientId() {
		const selectedOption = document.querySelector('input[name="new_patient"]:checked');

		if (!selectedOption) {
			showError("new_patient");
			clearError("patient_id");
			return false;
		}

		clearError("new_patient");

		if (selectedOption.value !== "No") {
			clearError("patient_id");
			return true;
		}

		const value = patientIdInput.value.trim();

		if (value === "") {
			showError("patient_id");
			return false;
		}

		if (!/^HC-[A-Za-z0-9]{6}$/.test(value)) {
			showError("patient_id");
			return false;
		}

		clearError("patient_id");
		return true;
	}

	function validateHealthConcern() {
		const value = healthConcernTextarea.value.trim();
		const remainingCharacters = 20 - value.length;

		if (value.length < 20) {
			healthConcernTextarea.dataset.errorMessage = localizedErrorMessages.health_concern.replace("X", remainingCharacters);
			showError("health_concern");
			return false;
		}

		clearError("health_concern");
		delete healthConcernTextarea.dataset.errorMessage;
		return true;
	}

	function validateConsent() {
		if (!contactConsentCheckbox.checked) {
			showError("contact_consent");
			return false;
		}

		clearError("contact_consent");
		return true;
	}

	// Helper Functions
	function showError(fieldName) {
		let targetElement;
		let anchorElement;

		switch (fieldName) {
			case "new_patient":
				targetElement = newPatientRadios[0]?.closest("fieldset");
				anchorElement = targetElement;
				break;
			case "has_insurance":
				targetElement = hasInsuranceRadios[0]?.closest("fieldset");
				anchorElement = targetElement;
				break;
			default:
				targetElement = document.getElementById(fieldName);
				anchorElement = targetElement;
		}

		if (!anchorElement) {
			return;
		}

		const errorId = `${fieldName}_error`;
		let errorElement = document.getElementById(errorId);
		const message = targetElement?.dataset?.errorMessage || localizedErrorMessages[fieldName] || "";

		if (!errorElement) {
			errorElement = document.createElement("span");
			errorElement.id = errorId;
			errorElement.setAttribute("aria-live", "polite");
			anchorElement.insertAdjacentElement("afterend", errorElement);
		}

		errorElement.textContent = message;
	}

	function clearError(fieldName) {
		const errorElement = document.getElementById(`${fieldName}_error`);

		if (errorElement) {
			errorElement.remove();
		}
	}

	function updateCharacterCounter() {
		charCount.textContent = healthConcernTextarea.value.length;
	}

	function showSuccessMessage() {
		const existingMessage = document.getElementById("form_success_message");

		if (existingMessage) {
			existingMessage.remove();
		}

		const successElement = document.createElement("section");
		successElement.id = "form_success_message";
		successElement.setAttribute("role", "status");
		successElement.setAttribute("aria-live", "polite");
		successElement.className = "rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950 shadow-sm ring-1 ring-emerald-100 sm:p-8";

		const title = document.createElement("p");
		title.className = "text-2xl font-bold tracking-tight text-emerald-900";
		title.textContent = currentLanguage === "es" ? "Solicitud enviada" : "Request received";
		successElement.appendChild(title);

		successMessages[currentLanguage].forEach((message, index) => {
			const paragraph = document.createElement("p");
			paragraph.className = index === 0 ? "mt-4 text-base font-semibold leading-7" : "mt-4 text-base leading-7 text-emerald-900";
			paragraph.textContent = message;
			successElement.appendChild(paragraph);
		});

		form.insertAdjacentElement("afterend", successElement);
		form.classList.add("hidden");
	}

	function updateTimeClinicWarning() {
		const existingWarning = document.getElementById("time_clinic_warning");
		const isEveningSlot = preferredTimeSelect.value === "Evening (5pm-8pm)";
		const closingHour = clinicClosingTimes[preferredClinicSelect.value];
		const shouldWarn = isEveningSlot && typeof closingHour === "number" && closingHour < 20;

		if (!shouldWarn) {
			existingWarning?.remove();
			return;
		}

		let warningElement = existingWarning;

		if (!warningElement) {
			warningElement = document.createElement("p");
			warningElement.id = "time_clinic_warning";
			preferredTimeSelect.closest("p")?.insertAdjacentElement("afterend", warningElement);
		}

		const formattedClosingTime = closingHour === 18 ? "6pm" : "7pm";
		warningElement.textContent = currentLanguage === "es"
			? `${preferredClinicSelect.value} cierra a las ${formattedClosingTime} entre semana, por lo que las citas en horario nocturno podrían no estar disponibles.`
			: `${preferredClinicSelect.value} closes at ${formattedClosingTime} on weekdays, so evening appointments may be unavailable.`;
	}

	function toggleInsuranceFields() {
		const selectedOption = document.querySelector('input[name="has_insurance"]:checked');
		const shouldShow = selectedOption?.value === "Yes";

		insuranceFields.classList.toggle("hidden", !shouldShow);

		if (!shouldShow) {
			insuranceProviderInput.value = "";
			insuranceMemberIdInput.value = "";
			clearError("insurance_provider");
			clearError("insurance_member_id");
		}
	}

	function togglePatientIdField() {
		const selectedOption = document.querySelector('input[name="new_patient"]:checked');
		const shouldShow = selectedOption?.value === "No";

		patientIdField.classList.toggle("hidden", !shouldShow);

		if (!shouldShow) {
			patientIdInput.value = "";
			clearError("patient_id");
		}
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
	dateOfBirthInput.addEventListener("blur", () => {
		validateDateOfBirth();

		if (serviceTypeSelect.value !== "") {
			validateServiceType();
		}
	});
	emailInput.addEventListener("blur", validateEmail);
	phoneInput.addEventListener("blur", validatePhone);
	preferredDateInput.addEventListener("blur", validatePreferredDate);
	healthConcernTextarea.addEventListener("blur", validateHealthConcern);

	preferredLanguageSelect.addEventListener("change", validatePreferredLanguage);
	preferredClinicSelect.addEventListener("change", () => {
		validatePreferredClinic();
		updateTimeClinicWarning();
	});
	preferredDateInput.addEventListener("change", validatePreferredDate);
	preferredTimeSelect.addEventListener("change", () => {
		validatePreferredTime();
		updateTimeClinicWarning();
	});
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
		event.preventDefault();

		const isFirstNameValid = validateFirstName();
		const isLastNameValid = validateLastName();
		const isDateOfBirthValid = validateDateOfBirth();
		const isEmailValid = validateEmail();
		const isPhoneValid = validatePhone();
		const isPreferredLanguageValid = validatePreferredLanguage();
		const isPreferredClinicValid = validatePreferredClinic();
		const isPreferredDateValid = validatePreferredDate();
		const isPreferredTimeValid = validatePreferredTime();
		const isServiceTypeValid = validateServiceType();
		const isHasInsuranceValid = validateHasInsurance();
		const isInsuranceProviderValid = validateInsuranceProvider();
		const isInsuranceMemberIdValid = validateInsuranceMemberId();
		const isPatientIdValid = validatePatientId();
		const isHealthConcernValid = validateHealthConcern();
		const isConsentValid = validateConsent();

		const isFormValid =
			isFirstNameValid &&
			isLastNameValid &&
			isDateOfBirthValid &&
			isEmailValid &&
			isPhoneValid &&
			isPreferredLanguageValid &&
			isPreferredClinicValid &&
			isPreferredDateValid &&
			isPreferredTimeValid &&
			isServiceTypeValid &&
			isHasInsuranceValid &&
			isInsuranceProviderValid &&
			isInsuranceMemberIdValid &&
			isPatientIdValid &&
			isHealthConcernValid &&
			isConsentValid;

		if (isFormValid) {
			showSuccessMessage();
		}
	});
});
