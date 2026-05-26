export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Bem-vindo ao HelpdeskPRO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Tickets Abertos" value="12" icon="🎫" color="bg-blue-600" />
        <Card title="Usuários" value="5" icon="👥" color="bg-emerald-600" />
        <Card title="Grupos" value="3" icon="👨‍💼" color="bg-purple-600" />
        <Card title="Ativos" value="24" icon="💻" color="bg-orange-600" />
      </div>

      <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Tickets Recentes</h2>
        <div className="text-slate-400 text-center py-8">
          Nenhum ticket ainda. Volte em breve!
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  value: string;
  icon: string;
  color: string;
}

function Card({ title, value, icon, color }: CardProps) {
  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 hover:border-slate-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className={`text-3xl ${color} rounded-lg p-3 bg-opacity-10`}>
          {icon}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
