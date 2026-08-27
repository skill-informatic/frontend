import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BoxSeam,
  CheckCircleFill,
  ExclamationTriangleFill,
  People,
  PersonCheckFill,
  CurrencyDollar,
  Grid1x2Fill,
  GraphUpArrow,
} from "react-bootstrap-icons";
import client from "../api/client";
import type { DashboardData } from "../types";

const fmt = (v: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    parseFloat(v),
  );

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/usuarios/dashboard/")
      .then((r) => setData(r.data))
      .catch(() => setError("No se pudo cargar el dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  if (error)
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );

  const cards = [
    {
      title: "Total Productos",
      value: data!.total_productos,
      icon: <BoxSeam size={28} />,
      color: "primary",
      link: "/productos",
    },
    {
      title: "Productos Activos",
      value: data!.productos_activos,
      icon: <CheckCircleFill size={28} />,
      color: "success",
      link: "/productos",
    },
    {
      title: "Stock Bajo (≤5)",
      value: data!.productos_stock_bajo,
      icon: <ExclamationTriangleFill size={28} />,
      color: "warning",
      link: "/productos",
    },
    {
      title: "Total Usuarios",
      value: data!.total_usuarios,
      icon: <People size={28} />,
      color: "info",
      link: "/usuarios",
    },
    {
      title: "Usuarios Activos",
      value: data!.usuarios_activos,
      icon: <PersonCheckFill size={28} />,
      color: "success",
      link: "/usuarios",
    },
    {
      title: "Valor Inventario",
      value: fmt(data!.valor_inventario),
      icon: <CurrencyDollar size={28} />,
      color: "dark",
      link: "/reportes",
    },
  ];

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold d-flex align-items-center gap-2">
        <Grid1x2Fill /> Dashboard
      </h2>
      <Row className="g-4 mb-4">
        {cards.map((c) => (
          <Col key={c.title} xs={12} sm={6} lg={4}>
            <Card
              className={`border-0 shadow-sm h-100 border-start border-${c.color} border-4`}
            >
              <Card.Body className="d-flex align-items-center gap-3">
                <span className={`text-${c.color}`}>{c.icon}</span>
                <div>
                  <div className="text-muted small">{c.title}</div>
                  <div className="fs-3 fw-bold">{c.value}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <h5 className="mb-3">Accesos rápidos</h5>
      <Row className="g-3">
        {[
          {
            to: "/productos",
            icon: <BoxSeam size={32} />,
            label: "Gestionar Productos",
          },
          {
            to: "/usuarios",
            icon: <People size={32} />,
            label: "Gestionar Usuarios",
          },
          {
            to: "/reportes",
            icon: <GraphUpArrow size={32} />,
            label: "Ver Reportes",
          },
        ].map((a) => (
          <Col key={a.to} xs={12} sm={4}>
            <Link to={a.to} className="text-decoration-none">
              <Card className="text-center p-3 shadow-sm h-100 hover-shadow border-0">
                <div className="text-primary">{a.icon}</div>
                <div className="fw-semibold mt-2">{a.label}</div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
