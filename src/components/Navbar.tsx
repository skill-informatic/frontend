import { Link, useNavigate, useLocation } from "react-router-dom";
import { Navbar as BsNavbar, Nav, Container, Button } from "react-bootstrap";
import {
  Shop,
  Speedometer,
  BoxSeam,
  People,
  GraphUpArrow,
  PersonCircle,
  BoxArrowRight,
  ArrowLeft,
} from "react-bootstrap-icons";
import { useAuth } from "../context/AuthContext";

const PURPLE = "#a78bfa";

export default function Navbar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  const isActive = (path: string) => location.pathname === path;

  const linkStyle = (path: string) =>
    isActive(path) ? { color: PURPLE, fontWeight: 600 } : undefined;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <BsNavbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Button
          variant="outline-light"
          size="sm"
          className="me-2 d-flex align-items-center"
          onClick={() => navigate(-1)}
          title="Volver"
          style={{ visibility: isDashboard ? "hidden" : "visible" }}
        >
          <ArrowLeft />
        </Button>

        <BsNavbar.Brand
          as={Link}
          to="/dashboard"
          className="fw-bold d-flex align-items-center gap-2"
        >
          <Shop /> Plataforma Admin
        </BsNavbar.Brand>
        <BsNavbar.Toggle />
        <BsNavbar.Collapse>
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/dashboard"
              className="d-flex align-items-center gap-1"
              style={linkStyle("/dashboard")}
            >
              <Speedometer /> Dashboard
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/productos"
              className="d-flex align-items-center gap-1"
              style={linkStyle("/productos")}
            >
              <BoxSeam /> Productos
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/usuarios"
              className="d-flex align-items-center gap-1"
              style={linkStyle("/usuarios")}
            >
              <People /> Usuarios
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/reportes"
              className="d-flex align-items-center gap-1"
              style={linkStyle("/reportes")}
            >
              <GraphUpArrow /> Reportes
            </Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <Nav.Item className="d-flex align-items-center text-light me-3 gap-2">
              <PersonCircle size={20} /> {username}
            </Nav.Item>
            <Button
              variant="outline-light"
              size="sm"
              onClick={handleLogout}
              className="d-flex align-items-center gap-1"
            >
              <BoxArrowRight /> Cerrar sesión
            </Button>
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}
