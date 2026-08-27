import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import {
  Shop,
  PersonFill,
  LockFill,
  EyeFill,
  EyeSlashFill,
} from "react-bootstrap-icons";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Credenciales incorrectas. Intenta de nuevo.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
      }}
    >
      <Card
        style={{ width: "400px", border: "none" }}
        className="shadow-lg rounded-4"
      >
        <Card.Body className="p-4">
          <h3 className="text-center mb-4 fw-bold" style={{ color: "#5b21b6" }}>
            <Shop className="me-2" size={28} />
            Plataforma Admin
          </h3>
          <h5 className="text-center text-muted mb-4">Iniciar sesión</h5>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <InputGroup>
                <InputGroup.Text
                  style={{
                    background: "#ede9fe",
                    color: "#6d28d9",
                    border: "1px solid #c4b5fd",
                  }}
                >
                  <PersonFill />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre de usuario"
                  required
                  style={{ borderColor: "#c4b5fd" }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Contraseña</Form.Label>
              <InputGroup>
                <InputGroup.Text
                  style={{
                    background: "#ede9fe",
                    color: "#6d28d9",
                    border: "1px solid #c4b5fd",
                  }}
                >
                  <LockFill />
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  required
                  style={{ borderColor: "#c4b5fd" }}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  style={{ borderColor: "#c4b5fd", color: "#6d28d9" }}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </Button>
              </InputGroup>
            </Form.Group>
            <Button
              type="submit"
              className="w-100 fw-semibold"
              disabled={loading}
              style={{ background: "#7c3aed", border: "none" }}
            >
              {loading ? <Spinner size="sm" /> : "Entrar"}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            ¿No tienes cuenta?{" "}
            <Link to="/register" style={{ color: "#7c3aed", fontWeight: 500 }}>
              Regístrate
            </Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
