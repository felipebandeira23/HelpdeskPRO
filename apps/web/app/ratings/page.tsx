'use client';
import { PageHeader, Panel, StatCard } from '@/components/ui';

export default function RatingsPage() {
  const feedbacks = [
    { id: 1, ticketId: '#1024', user: 'Maria Souza', rating: 5, comment: 'Atendimento muito rápido e prestativo!', date: 'Hoje' },
    { id: 2, ticketId: '#1021', user: 'Carlos Santos', rating: 4, comment: 'Resolvido, mas demorou um pouco para responder a primeira vez.', date: 'Ontem' },
    { id: 3, ticketId: '#1015', user: 'Ana Lima', rating: 5, comment: '', date: '28/05/2026' },
    { id: 4, ticketId: '#1010', user: 'Pedro Costa', rating: 2, comment: 'O técnico não resolveu o problema e fechou o chamado.', date: '25/05/2026' },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Avaliações de Satisfação" subtitle="Dashboard de Feedback e NPS" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="CSAT Médio" value="4.5" icon="⭐" accent="bg-yellow-500" />
        <StatCard title="Total de Avaliações" value={142} icon="📝" accent="bg-blue-500" />
        <StatCard title="NPS" value="+75" icon="📈" accent="bg-green-500" />
      </div>

      <Panel>
        <h2 className="text-lg font-bold text-white mb-4">Feedbacks Recentes</h2>
        <div className="space-y-4">
          {feedbacks.map(f => (
            <div key={f.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="text-slate-300 font-medium">{f.user}</span>
                  <span className="text-slate-500 text-xs ml-2">Ticket {f.ticketId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400 text-sm">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < f.rating ? 'text-yellow-400' : 'text-slate-600'}>{i < f.rating ? '★' : '☆'}</span>
                    ))}
                  </div>
                  <span className="text-slate-500 text-xs">{f.date}</span>
                </div>
              </div>
              {f.comment ? (
                <p className="text-slate-300 text-sm italic">&ldquo;{f.comment}&rdquo;</p>
              ) : (
                <p className="text-slate-500 text-sm italic">Sem comentário adicional.</p>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
