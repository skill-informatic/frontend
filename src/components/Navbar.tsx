import { Link, useNavigate, useLocation } from "react-router-dom";
import { Nav, Button } from "react-bootstrap";
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
export const SIDEBAR_WIDTH = 240;
export const TOPBAR_HEIGHT = 56;

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/productos": "Productos",
  "/usuarios": "Usuarios",
  "/reportes": "Reportes",
};

export default function Navbar() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";
  const isActive = (path: string) => location.pathname === path;

  const textStyle = (path: string) =>
    isActive(path) ? { color: PURPLE, fontWeight: 600 } : undefined;

  const currentRouteName = ROUTE_NAMES[location.pathname] ?? "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {/* Barra lateral izquierda */}
      <div
        className="d-flex flex-column bg-dark text-light shadow-sm"
        style={{
          width: SIDEBAR_WIDTH,
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1030,
        }}
      >
        <div className="d-flex align-items-center gap-2 px-3 py-3 border-bottom border-secondary">
          <Button
            variant="outline-light"
            size="sm"
            className="d-flex align-items-center"
            onClick={() => navigate(-1)}
            title="Volver"
            style={{ visibility: isDashboard ? "hidden" : "visible" }}
          >
            <ArrowLeft />
          </Button>
          <Link
            to="/dashboard"
            className="fw-bold d-flex align-items-center gap-2 text-light text-decoration-none"
          >
            <Shop /> Prueba Tecnica
          </Link>
        </div>

        <Nav className="flex-column px-2 py-3 flex-grow-1">
          <Nav.Link
            as={Link}
            to="/dashboard"
            className="d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
          >
            <Speedometer />{" "}
            <span style={textStyle("/dashboard")}>Dashboard</span>
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/productos"
            className="d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
          >
            <BoxSeam /> <span style={textStyle("/productos")}>Productos</span>
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/usuarios"
            className="d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
          >
            <People /> <span style={textStyle("/usuarios")}>Usuarios</span>
          </Nav.Link>
          <Nav.Link
            as={Link}
            to="/reportes"
            className="d-flex align-items-center gap-2 text-light px-3 py-2 rounded"
          >
            <GraphUpArrow />{" "}
            <span style={textStyle("/reportes")}>Reportes</span>
          </Nav.Link>
        </Nav>
      </div>

      {/* Barra superior */}
      <div
        className="d-flex align-items-center justify-content-between bg-dark shadow-sm px-3"
        style={{
          height: TOPBAR_HEIGHT,
          position: "fixed",
          top: 0,
          left: SIDEBAR_WIDTH,
          right: 0,
          zIndex: 1020,
        }}
      >
        <span className="text-light fw-semibold">{currentRouteName}</span>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center text-light gap-2">
            <PersonCircle size={20} /> {username}
          </div>
          <Button
            variant="outline-light"
            size="sm"
            onClick={handleLogout}
            className="d-flex align-items-center gap-1"
          >
            <BoxArrowRight /> Cerrar sesión
          </Button>
        </div>
      </div>
    </>
  );
}
