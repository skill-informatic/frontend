import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  Container,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Badge,
  Pagination,
  FormSelect,
  FormControl,
} from "react-bootstrap";
import { BoxSeam, PlusLg, PencilSquare, Trash } from "react-bootstrap-icons";
import client from "../api/client";
import type { Producto, PaginatedResponse } from "../types";

const fmt = (v: string) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    parseFloat(v),
  );
const empty = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: 0,
  stock: 0,
  estado: "activo" as "activo" | "inactivo",
};

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;
  // const categorias = [
  //   { value: "electrodomesticos", label: "Electrodomesticos" },
  //   { value: "ropa", label: "Ropa" },
  //   { value: "deportes", label: "Deportes" },
  //   { value: "autos", label: "Autos" },
  // ];
  const [serviceCategorias, setServiceCategorias] = useState<any>([]);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await client.get<PaginatedResponse<Producto>>(
        `/productos/?page=${p}`,
      );
      setProductos(res.data.results);
      setCount(res.data.count);
      client
        .get("/categorias/activas/")
        .then((r) => {
          console.log("cat", r.data);
          return setServiceCategorias(r.data);
          // return setData(r.data);
        })
        .catch(() => {
          return setError("No se pudo cargar las categorias.");
        })
        .finally(() => {
          return setLoading(false);
        });
    } catch {
      setError("Error al cargar productos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setFormErrors({});
    setShowModal(true);
  };
  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: p.precio,
      categoria: (p.categoria as any).id ?? p.categoria,
      stock: p.stock,
      estado: p.estado,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombre.trim()) errs.nombre = "El nombre es requerido.";
    if (!form.precio || parseFloat(String(form.precio)) <= 0)
      errs.precio = "El precio debe ser mayor a 0.";
    // if (!form.categoria) errs.categoria = "La categoría es requerida.";
    if (form.stock < 0) errs.stock = "El stock no puede ser negativo.";
    return errs;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    console.log("errs", errs);
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    try {
      console.log("form", form);
      if (editing) await client.put(`/productos/${editing.id}/`, form);
      else await client.post("/productos/", form);
      setShowModal(false);
      load(page);
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string> } };
      if (e.response?.data) setFormErrors(e.response.data);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    setDeletingId(id);
    try {
      await client.delete(`/productos/${id}/`);
      load(page);
    } catch {
      setError("Error al eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const pages = Math.ceil(count / PAGE_SIZE);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <BoxSeam /> Productos
        </h2>
        <Button
          variant="primary"
          onClick={openCreate}
          className="d-flex align-items-center gap-1"
        >
          <PlusLg /> Nuevo producto
        </Button>
      </div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {loading ? (
        <div className="text-center py-5">
          <Spinner />
        </div>
      ) : (
        <>
          <Table responsive hover className="shadow-sm rounded">
            <thead className="table-dark">
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.nombre}</td>
                    <td>{p.categoria}</td>
                    <td>{fmt(p.precio)}</td>
                    <td>
                      <Badge bg={p.stock <= 5 ? "warning" : "secondary"}>
                        {p.stock}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        bg={p.estado === "activo" ? "success" : "secondary"}
                      >
                        {p.estado}
                      </Badge>
                    </td>
                    <td>{p.fecha_registro}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-2 d-inline-flex align-items-center gap-1"
                        onClick={() => openEdit(p)}
                      >
                        <PencilSquare /> Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? (
                          <Spinner size="sm" />
                        ) : (
                          <>
                            <Trash /> Eliminar
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          {pages > 1 && (
            <Pagination className="justify-content-center">
              {Array.from({ length: pages }, (_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
            </Pagination>
          )}
        </>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Editar producto" : "Nuevo producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre *</Form.Label>
              <Form.Control
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                isInvalid={!!formErrors.nombre}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.nombre}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </Form.Group>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Precio (MXN) *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  isInvalid={!!formErrors.precio}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.precio}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Stock *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) =>
                    setForm({ ...form, stock: parseInt(e.target.value) || 0 })
                  }
                  isInvalid={!!formErrors.stock}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.stock}
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                {/* <Form.Label>Categoría *</Form.Label> */}

                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  name="categoria"
                  value={form.categoria.id}
                  onChange={(e) => {
                    // console.log("categoria", e.target);
                    // setForm({ ...form, categoria: parseInt(e.target.value) });
                    console.log("categoria: e.target.value", e.target.value);
                    setForm({ ...form, categoria: e.target.value });
                  }}
                >
                  <option value={0}>Selecciona una categoria</option>
                  {serviceCategorias.map(
                    (cat: { id: number; nombre: string }) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ),
                  )}
                </Form.Select>
                {/* <Form.Control
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  isInvalid={!!formErrors.categoria}
                /> */}
                {/* <Form.Control.Feedback type="invalid">
                  {formErrors.categoria}
                </Form.Control.Feedback> */}
              </Form.Group>
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Estado</Form.Label>
                <div>
                  <Form.Check
                    inline
                    type="radio"
                    id="estado-activo"
                    name="estado"
                    label="Activo"
                    value={"activo"}
                    checked={form.estado === "activo"}
                    onChange={(e: any) => {
                      setForm({ ...form, estado: e.target.value });
                    }}
                  />
                  <Form.Check
                    inline
                    type="radio"
                    id="estado-inactivo"
                    name="estado"
                    label="Inactivo"
                    value={"inactivo"}
                    checked={form.estado === "inactivo"}
                    onChange={(e: any) => {
                      setForm({ ...form, estado: e.target.value });
                    }}
                  />
                </div>
                {/* <Form.Select
                  value={form.estado}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      estado: e.target.value as "activo" | "inactivo",
                    })
                  }
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </Form.Select> */}
              </Form.Group>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <Spinner size="sm" />
                ) : editing ? (
                  "Guardar cambios"
                ) : (
                  "Crear producto"
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
