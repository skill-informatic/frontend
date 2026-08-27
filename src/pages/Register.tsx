import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', first_name:'', last_name:'', password:'', password2:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, string[]> } };
      const data = e.response?.data;
      const msg = data ? Object.values(data).flat().join(' ') : 'Error al registrar.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card style={{ width: '450px' }} className="shadow">
        <Card.Body className="p-4">
          <h4 className="text-center mb-4 fw-bold">Crear cuenta</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            {([
              {name:'username',label:'Usuario',type:'text'},
              {name:'email',label:'Correo electrónico',type:'email'},
              {name:'first_name',label:'Nombre',type:'text'},
              {name:'last_name',label:'Apellido',type:'text'},
              {name:'password',label:'Contraseña',type:'password'},
              {name:'password2',label:'Confirmar contraseña',type:'password'},
            ] as {name: keyof typeof form, label: string, type: string}[]).map(f => (
              <Form.Group key={f.name} className="mb-3">
                <Form.Label>{f.label}</Form.Label>
                <Form.Control type={f.type} name={f.name} value={form[f.name]} onChange={handleChange} required />
              </Form.Group>
            ))}
            <Button type="submit" variant="primary" className="w-100 mt-2" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Registrarse'}
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
