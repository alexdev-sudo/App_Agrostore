import { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';

export default function EntregasComprador() {
  const [entregas,  setEntregas]              = useState([]);
  const [cargando,  setCargando]              = useState(true);
  const [mensaje,   setMensaje]               = useState('');
  const [modalIncumplimiento, setModalIncumplimiento] = useState(null);
  // modalIncumplimiento guarda el id_entrega que se está reportando,
  // o null si el modal está cerrado.
  const [descripcion, setDescripcion] = useState('');

  // ── cargar declarada ANTES del useEffect ────────────────────────────
  // Llama a la API para obtener las entregas donde este comprador
  // es el destinatario del pedido.
  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      // /api/entregas/mis-recepciones ya filtra por el comprador logueado
      // (el backend usa req.usuario.id del token JWT para el filtro)
      const data = await api.getMisRecepciones();
      setEntregas(data);
    } catch (err) {
      console.error('Error al cargar entregas:', err.message);
    } finally {
      setCargando(false);
    }
  }, []); // Sin dependencias: la función no cambia entre renders

  // useEffect ahora sí puede llamar a cargar sin error, porque
  // cargar está declarada en las líneas anteriores.
  useEffect(() => {
    let activo = true;

    (async () => {
      await cargar();
      if (!activo) return;
    })();

    return () => {
      activo = false;
    };
  }, [cargar]);

  // ── Confirmar que se recibió el producto ────────────────────────────
  // Cuando el comprador confirma, el pedido pasa a estado "Finalizado".
  // Esto es el paso final de toda la transacción.
  const confirmarRecepcion = async (id, nombreProducto) => {
    if (!confirm(`¿Confirmas que recibiste: ${nombreProducto}?`)) return;
    try {
      await api.confirmarRecepcion(id);
      setMensaje(`¡Recepción de "${nombreProducto}" confirmada! Pedido finalizado.`);
      cargar(); // Recargamos para actualizar el estado en la UI
    } catch (err) {
      setMensaje(err.message);
    }
  };

  // ── Enviar reporte de incumplimiento ────────────────────────────────
  // Se activa desde el botón ⚠️ en la tarjeta de entrega.
  // Notifica al administrador para que revise el problema.
  const enviarIncumplimiento = async () => {
    if (!descripcion.trim()) return;
    try {
      await api.reportarProblema(modalIncumplimiento, descripcion);
      setMensaje('Problema reportado. El administrador lo revisará pronto.');
      setModalIncumplimiento(null); // Cierra el modal
      setDescripcion('');           // Limpia el campo de texto
    } catch (err) {
      setMensaje(err.message);
    }
  };

  // ── Separamos las entregas en tres grupos para mostrarlas ordenadas ──
  // Las más urgentes (listas para confirmar) van primero.
  const confirmadas = entregas.filter(e => e.estado === 'Confirmado_Productor');
  const pendientes  = entregas.filter(e => e.estado === 'Pendiente');
  const finalizadas = entregas.filter(e => e.estado === 'Finalizado');

  // ── TarjetaEntrega: función que retorna JSX (NO es un componente) ───
  // Usamos una función normal que retorna JSX en lugar de un componente
  // para evitar el error react-hooks/static-components.
  // Al ser una función regular (no un componente React), no tiene
  // el problema de "creada durante el render".
  const renderTarjeta = (entrega, mostrarAcciones) => (
    <div
      key={entrega.id_entrega}
      className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden"
    >
      {/* Encabezado con color según estado */}
      <div className={`px-4 py-2 flex justify-between items-center
        ${entrega.estado === 'Finalizado'
          ? 'bg-blue-700'
          : entrega.estado === 'Confirmado_Productor'
          ? 'bg-verde-osc'
          : 'bg-gray-600'}`}
      >
        <span className="text-white text-sm font-bold">
          {entrega.producto_nombre} — {entrega.cantidad} lb
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full
          ${entrega.estado === 'Finalizado'
            ? 'bg-blue-100 text-blue-700'
            : entrega.estado === 'Confirmado_Productor'
            ? 'bg-verde-claro text-verde'
            : 'bg-gray-100 text-gray-600'}`}
        >
          {entrega.estado === 'Confirmado_Productor'
            ? 'Listo para confirmar'
            : entrega.estado}
        </span>
      </div>

      {/* Cuerpo con detalles de la entrega */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-gray-400 text-xs">Agricultor</p>
            <p className="font-bold text-gray-800 text-sm">{entrega.productor_nombre}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Punto de entrega</p>
            <p className="font-bold text-gray-800 text-sm">{entrega.lugar}</p>
          </div>
          {entrega.fecha_entrega && (
            <div>
              <p className="text-gray-400 text-xs">Fecha acordada</p>
              <p className="font-bold text-gray-800 text-sm">{entrega.fecha_entrega}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs">Pedido #</p>
            <p className="font-bold text-gray-800 text-sm">{entrega.id_pedido}</p>
          </div>
        </div>

        {entrega.observaciones && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2 mb-3">
            💬 {entrega.observaciones}
          </p>
        )}

        {/* Botones de acción: solo aparecen cuando el productor ya confirmó */}
        {mostrarAcciones && entrega.estado === 'Confirmado_Productor' && (
          <div className="flex gap-2">
            <button
              onClick={() => confirmarRecepcion(entrega.id_entrega, entrega.producto_nombre)}
              className="flex-1 bg-verde text-white rounded-xl py-2.5 font-bold text-sm"
            >
              ✓ Confirmar que lo recibí
            </button>
            {/* Botón para reportar problema (abre el modal) */}
            <button
              onClick={() => {
                setModalIncumplimiento(entrega.id_entrega);
                setDescripcion('');
              }}
              className="px-3 border border-red-300 text-red-500 rounded-xl py-2.5 text-sm font-bold"
              title="Reportar problema con esta entrega"
            >
              ⚠️
            </button>
          </div>
        )}

        {/* Mensaje informativo cuando el agricultor aún no ha marcado la entrega */}
        {entrega.estado === 'Pendiente' && (
          <div className="bg-amber-50 rounded-lg p-2 text-center">
            <p className="text-amber-700 text-xs">
              Esperando que el agricultor confirme que envió el producto
            </p>
          </div>
        )}

        {/* Confirmación visual de que la transacción está cerrada */}
        {entrega.estado === 'Finalizado' && (
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-blue-600 text-xs font-bold">✓ Transacción completada</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      {/* ── Header ── */}
      <div className="bg-verde px-4 pt-8 pb-4">
        <h1 className="text-white text-xl font-bold">Mis Entregas</h1>
        <p className="text-green-200 text-sm">
          {confirmadas.length > 0
            ? `${confirmadas.length} entrega(s) esperando tu confirmación`
            : 'Gestiona tus entregas'}
        </p>
      </div>

      {/* ── Mensaje de éxito o error ── */}
      {mensaje && (
        <div className={`mx-4 mt-3 rounded-xl p-3 text-sm border flex justify-between items-start
          ${mensaje.includes('Error') || mensaje.includes('error')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-verde-claro border-verde text-verde'}`}
        >
          <span>{mensaje}</span>
          <button onClick={() => setMensaje('')} className="ml-2 font-bold flex-shrink-0">
            ✕
          </button>
        </div>
      )}

      {/* ── Contenido principal ── */}
      {cargando ? (
        <p className="text-center text-gray-400 py-12">Cargando entregas...</p>
      ) : entregas.length === 0 ? (
        <div className="mx-4 mt-6 bg-white rounded-xl p-8 text-center border border-gray-100">
          <p className="text-5xl mb-3">📦</p>
          <p className="text-gray-600 font-bold">Sin entregas pendientes</p>
          <p className="text-gray-400 text-sm mt-1">
            Aquí aparecerán tus entregas cuando el agricultor las registre
          </p>
        </div>
      ) : (
        <>
          {/* Las listas para confirmar van primero: son las más urgentes */}
          {confirmadas.length > 0 && (
            <>
              <div className="mx-4 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-verde"></span>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                  Listas para confirmar ({confirmadas.length})
                </p>
              </div>
              {confirmadas.map(e => renderTarjeta(e, true))}
            </>
          )}

          {/* Entregas en espera de que el agricultor las marque como enviadas */}
          {pendientes.length > 0 && (
            <>
              <div className="mx-4 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                  Esperando envío ({pendientes.length})
                </p>
              </div>
              {pendientes.map(e => renderTarjeta(e, false))}
            </>
          )}

          {/* Historial de entregas ya completadas */}
          {finalizadas.length > 0 && (
            <>
              <div className="mx-4 mt-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <p className="text-gray-600 text-xs font-bold uppercase tracking-wider">
                  Completadas ({finalizadas.length})
                </p>
              </div>
              {finalizadas.map(e => renderTarjeta(e, false))}
            </>
          )}
        </>
      )}

      {/* ── Modal para reportar incumplimiento ── */}
      {/* Se muestra encima de todo cuando modalIncumplimiento no es null */}
      {modalIncumplimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-end z-50">
          <div className="bg-white w-full max-w-sm mx-auto rounded-t-2xl p-6">
            <h3 className="font-bold text-lg text-red-700 mb-1">⚠️ Reportar Problema</h3>
            <p className="text-gray-500 text-sm mb-4">
              Describe qué salió mal. El administrador lo revisará y tomará acción.
            </p>
            <textarea
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: El producto llegó en mal estado, la cantidad era menor a la acordada..."
              rows={4}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:border-red-400 resize-none mb-4"
            />
            <button
              onClick={enviarIncumplimiento}
              disabled={!descripcion.trim()}
              className="w-full bg-red-500 text-white rounded-xl py-3 font-bold mb-2 disabled:opacity-40"
            >
              Enviar Reporte
            </button>
            <button
              onClick={() => { setModalIncumplimiento(null); setDescripcion(''); }}
              className="w-full border border-gray-300 text-gray-500 rounded-xl py-3 font-bold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}