import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Alert,
  Spinner,
  Badge,
  Button,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  GraphUpArrow,
  BoxSeam,
  ExclamationTriangleFill,
  CurrencyDollar,
  FileEarmarkSpreadsheet,
  FileEarmarkPdf,
} from "react-bootstrap-icons";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import client from "../api/client";
import type { ReporteData } from "../types";

const fmt = (v: string | number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    parseFloat(String(v)),
  );
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#a855f7",
  "#ec4899",
];

export default function Reportes() {
  const [data, setData] = useState<ReporteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/productos/reporte/")
      .then((r) => setData(r.data))
      .catch(() => setError("Error al cargar reportes."))
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

  const estadoData = data!.por_estado.map((e) => ({
    name: e.estado.charAt(0).toUpperCase() + e.estado.slice(1),
    value: e.total,
  }));

  const exportCSV = () => {
    const headers = [
      "Categoría",
      "Total Productos",
      "Stock Total",
      "Valor Inventario",
    ];
    const rows = data!.por_categoria.map((c) => [
      c.categoria,
      c.total,
      c.stock_total,
      c.valor_inventario || "0",
    ]);
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    // BOM para que Excel lea bien los acentos
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `reporte-inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Reporte de Inventario", 14, 18);
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generado el ${new Date().toLocaleDateString("es-MX")}`, 14, 24);

    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Total Productos: ${data!.total_productos}`, 14, 34);
    doc.text(`Stock Bajo (<=5): ${data!.stock_bajo}`, 14, 40);
    doc.text(
      `Valor Total Inventario: ${fmt(data!.valor_total_inventario)}`,
      14,
      46,
    );

    autoTable(doc, {
      startY: 54,
      head: [
        ["Categoría", "Total Productos", "Stock Total", "Valor Inventario"],
      ],
      body: data!.por_categoria.map((c) => [
        c.categoria,
        String(c.total),
        String(c.stock_total),
        fmt(c.valor_inventario || "0"),
      ]),
      headStyles: { fillColor: [13, 110, 253] },
    });

    doc.save(`reporte-inventario-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <GraphUpArrow /> Reportes de Inventario
        </h2>
        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={exportCSV}
          >
            <FileEarmarkSpreadsheet /> Exportar CSV
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            className="d-flex align-items-center gap-1"
            onClick={exportPDF}
          >
            <FileEarmarkPdf /> Exportar PDF
          </Button>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} sm={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <BoxSeam className="text-primary mb-1" size={22} />
              <div className="text-muted small">Total Productos</div>
              <div className="fs-2 fw-bold text-primary">
                {data!.total_productos}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <ExclamationTriangleFill
                className="text-warning mb-1"
                size={22}
              />
              <div className="text-muted small">Stock Bajo (≤5)</div>
              <div className="fs-2 fw-bold text-warning">
                {data!.stock_bajo}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={4}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <CurrencyDollar className="text-success mb-1" size={22} />
              <div className="text-muted small">Valor Total Inventario</div>
              <div className="fs-4 fw-bold text-success">
                {fmt(data!.valor_total_inventario)}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="g-4 mb-4">
        <Col xs={12} lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white fw-semibold">
              Productos por categoría
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data!.por_categoria}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => [v, "Cantidad"]} />
                  <Bar dataKey="total" fill="#0d6efd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Header className="bg-white fw-semibold">
              Por estado
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={estadoData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {estadoData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white fw-semibold">
          Detalle por categoría
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Categoría</th>
                <th>Total Productos</th>
                <th>Stock Total</th>
                <th>Valor Inventario</th>
              </tr>
            </thead>
            <tbody>
              {data!.por_categoria.map((c) => (
                <tr key={c.categoria}>
                  <td className="fw-semibold">{c.categoria}</td>
                  <td>
                    <Badge bg="primary">{c.total}</Badge>
                  </td>
                  <td>{c.stock_total}</td>
                  <td className="text-success fw-semibold">
                    {fmt(c.valor_inventario || "0")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
