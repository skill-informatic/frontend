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
} from "react-bootstrap";
import {
  People,
  PlusLg,
  PencilSquare,
  Trash,
  PersonCheckFill,
  PersonDashFill,
} from "react-bootstrap-icons";
import client from "../api/client";
import type { Usuario, PaginatedResponse } from "../types";

const emptyU = {
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  password: "",
  is_active: true,
  is_staff: false,
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [form, setForm] = useState<typeof emptyU>(emptyU);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await client.get<PaginatedResponse<Usuario>>(
        `/usuarios/?page=${p}`,
      );
      setUsuarios(res.data.results);
      setCount(res.data.count);
    } catch {
      setError("Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyU);
    setFormErrors({});
    setShowModal(true);
  };
  const openEdit = (u: Usuario) => {
    setEditing(u);
    setForm({
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      password: "",
      is_active: u.is_active,
      is_staff: u.is_staff,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.password) delete payload.password;
      if (editing) await client.put(`/usuarios/${editing.id}/`, payload);
      else await client.post("/usuarios/", payload);
      setShowModal(false);
      load(page);
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string> } };
      setFormErrors(e.response?.data || {});
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (u: Usuario) => {
    try {
      await client.patch(`/usuarios/${u.id}/toggle-activo/`);
      load(page);
    } catch {
      setError("Error al cambiar estado.");
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        "¿Eliminar este usuario? Esta acción no se puede deshacer.",
      )
    )
      return;
    try {
      await client.delete(`/usuarios/${id}/`);
      load(page);
    } catch {
      setError("Error al eliminar.");
    }
  };

  const pages = Math.ceil(count / PAGE_SIZE);

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0 d-flex align-items-center gap-2">
          <People /> Usuarios
        </h2>
        <Button
          variant="primary"
          onClick={openCreate}
          className="d-flex align-items-center gap-1"
        >
          <PlusLg /> Nuevo usuario
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
          <Table responsive hover className="shadow-sm">
            <thead className="table-dark">
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No hay usuarios
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr
                    key={u.id}
                    className={!u.is_active ? "table-secondary" : ""}
                  >
                    <td className="fw-semibold">{u.username}</td>
                    <td>
                      {u.first_name} {u.last_name}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <Badge bg={u.is_active ? "success" : "secondary"}>
                        {u.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={u.is_staff ? "warning" : "light"} text="dark">
                        {u.is_staff ? "Admin" : "Usuario"}
                      </Badge>
                    </td>
                    <td>
                      {new Date(u.date_joined).toLocaleDateString("es-MX")}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="me-1 d-inline-flex align-items-center gap-1"
                        onClick={() => openEdit(u)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          u.is_active ? "outline-warning" : "outline-success"
                        }
                        className="me-1 d-inline-flex align-items-center gap-1"
                        onClick={() => toggleActivo(u)}
                      >
                        {u.is_active ? (
                          <>
                            <PersonDashFill /> Desactivar
                          </>
                        ) : (
                          <>
                            <PersonCheckFill /> Activar
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        className="d-inline-flex align-items-center gap-1"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash /> Eliminar
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
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Editar usuario" : "Nuevo usuario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSave}>
            {(
              [
                { n: "username", l: "Usuario *", t: "text" },
                { n: "email", l: "Email *", t: "email" },
                { n: "first_name", l: "Nombre", t: "text" },
                { n: "last_name", l: "Apellido", t: "text" },
              ] as { n: keyof typeof emptyU; l: string; t: string }[]
            ).map((f) => (
              <Form.Group key={f.n} className="mb-3">
                <Form.Label>{f.l}</Form.Label>
                <Form.Control
                  type={f.t}
                  value={String(form[f.n])}
                  onChange={(e) => setForm({ ...form, [f.n]: e.target.value })}
                  isInvalid={!!formErrors[f.n]}
                  required={f.n === "username" || f.n === "email"}
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors[f.n]}
                </Form.Control.Feedback>
              </Form.Group>
            ))}
            <Form.Group className="mb-3">
              <Form.Label>
                Contraseña {editing ? "(dejar vacío para no cambiar)" : "*"}
              </Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                isInvalid={!!formErrors.password}
                required={!editing}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex gap-4 mb-3">
              <Form.Check
                label="Activo"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              <Form.Check
                label="Administrador"
                checked={form.is_staff}
                onChange={(e) =>
                  setForm({ ...form, is_staff: e.target.checked })
                }
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? <Spinner size="sm" /> : editing ? "Guardar" : "Crear"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
