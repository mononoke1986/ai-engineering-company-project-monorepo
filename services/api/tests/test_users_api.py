import os
import sys
import unittest
from pathlib import Path
from unittest import mock

os.environ.setdefault("SECRET_KEY", "test-only-secret")

REPO_ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT / "services" / "api" / "src"))

from fastapi.testclient import TestClient  # noqa: E402

from api.main import app  # noqa: E402
from api.users import router as users_router  # noqa: E402


class PublicRegistrationTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.service_patcher = mock.patch.object(users_router.service, "get_user_by_email", return_value=None)
        self.get_user = self.service_patcher.start()
        self.addCleanup(self.service_patcher.stop)
        self.create_patcher = mock.patch.object(
            users_router.service,
            "create_user",
            return_value={
                "id": "new-user-id",
                "email": "new@example.com",
                "is_active": True,
                "role": "user",
                "created_at": "2026-11-18T00:00:00+00:00",
            },
        )
        self.create_user = self.create_patcher.start()
        self.addCleanup(self.create_patcher.stop)
        self.profile_patcher = mock.patch.object(users_router, "create_profile")
        self.create_profile = self.profile_patcher.start()
        self.addCleanup(self.profile_patcher.stop)

    def test_registration_is_public_and_role_is_always_user(self):
        response = self.client.post(
            "/users",
            json={
                "email": "new@example.com",
                "password": "safe-password",
                "name": "New Person",
                "phone": "555-0100",
                "address": "1 Main Street",
                "role": "admin",
            },
        )

        self.assertEqual(response.status_code, 201, response.text)
        self.assertEqual(response.json()["role"], "user")
        self.create_user.assert_called_once_with("new@example.com", "safe-password", role="user")
        self.create_profile.assert_called_once_with(
            "new-user-id", "New Person", "555-0100", "1 Main Street"
        )

    def test_invalid_email_reports_field(self):
        response = self.client.post(
            "/users", json={"email": "not-an-email", "password": "safe-password"}
        )

        self.assertEqual(response.status_code, 422)
        errors = response.json()["detail"]
        self.assertTrue(any(error["loc"] == ["body", "email"] for error in errors))
        self.create_user.assert_not_called()

    def test_duplicate_email_reports_field(self):
        self.get_user.return_value = {"id": "existing-user"}
        response = self.client.post(
            "/users", json={"email": "new@example.com", "password": "safe-password"}
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["detail"][0]["loc"], ["body", "email"])
        self.assertIn("registrado", response.json()["detail"][0]["msg"])
        self.create_user.assert_not_called()

    def test_cors_allows_local_frontend_on_another_port(self):
        response = self.client.options(
            "/users",
            headers={
                "Origin": "http://localhost:3001",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:3001")


if __name__ == "__main__":
    unittest.main()
