import { AdminAction } from '@/components/admin/admin-action'
import { AdminSelect } from '@/components/admin/admin-select'
import { requirePageRole } from '@/lib/auth/guards'
import { adminUsers } from '@/lib/data/admin'
import { ROLE_LABELS, ROLES } from '@/lib/roles'

export default async function AdminUsuarios() {
  const actual = await requirePageRole('admin', '/admin/login')
  const usuarios = await adminUsers()
  return (
    <section>
      <h1 className="text-3xl font-semibold">Usuarios</h1>
      <p className="mt-2 text-[#6d858b]">{usuarios.length} cuentas. Podés cambiar el rol o suspender el acceso.</p>
      <div className="mt-6 overflow-x-auto rounded-3xl border border-[#dbe8e5] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-[#edf2f0] text-xs uppercase tracking-wider text-[#7d969b]"><tr><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4">Estado</th><th className="p-4">Acciones</th></tr></thead>
          <tbody>
            {usuarios.map(u => {
              const propio = u.id === actual.id
              return (
                <tr key={u.id} className="border-b border-[#f1f5f4] last:border-0">
                  <td className="p-4"><p className="font-semibold">{u.name}{u.demo && <span className="ml-2 rounded-full bg-[#fff4d9] px-2 py-0.5 text-xs text-[#9a6500]">demo</span>}</p><p className="text-xs text-[#6d858b]">{u.email}</p></td>
                  <td className="p-4"><AdminSelect endpoint="/api/admin/users" id={u.id} field="role" value={u.role} label={`Rol de ${u.email}`} disabled={propio} options={ROLES.map(r => [r, ROLE_LABELS[r]] as const)} /></td>
                  <td className="p-4">{u.status === 'active' ? 'Activo' : 'Suspendido'}</td>
                  <td className="p-4">{propio ? <span className="text-xs text-[#7d969b]">Tu cuenta</span> : u.status === 'active'
                    ? <AdminAction endpoint="/api/admin/users" body={{ id: u.id, status: 'suspended' }} label="Suspender" tone="danger" confirmText={`¿Suspender a ${u.email}?`} />
                    : <AdminAction endpoint="/api/admin/users" body={{ id: u.id, status: 'active' }} label="Reactivar" tone="primary" />}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
