interface ClientProjectMilestonesProps {
   project: any;
}

const ClientProjectMilestones: React.FC<ClientProjectMilestonesProps> = ({ project }) => {
   const milestones = project?.milestones || [];

   if (milestones.length === 0) {
      return (
         <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">flag</span>
            <p className="text-gray-500">No se han definido hitos para este proyecto.</p>
         </div>
      );
   }

   return (
      <div className="max-w-3xl mx-auto space-y-8">
         <div className="text-center mb-10 hidden">
            {/* Header hidden as it's shown in parent */}
            <h1 className="text-3xl font-black text-gray-900">Hitos del Proyecto</h1>
            <p className="text-gray-500 mt-2">Cronograma de pagos y entregas principales.</p>
         </div>

         <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:top-0 before:left-[23px] before:h-full before:w-0.5 before:bg-gray-200">

            {milestones.map((milestone: any, index: number) => {
               const isCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';
               const isInProgress = milestone.status === 'IN_PROGRESS';
               const isPending = milestone.status === 'PENDING';

               return (
                  <div key={milestone.id} className="relative">
                     <div className={`absolute -left-[29px] top-0 h-12 w-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
                            ${isCompleted ? 'bg-green-100 text-green-600' :
                           isInProgress ? 'bg-primary text-white shadow-lg' :
                              'bg-white border-2 border-gray-300 text-gray-300'}
                        `}>
                        {isCompleted ? <span className="material-symbols-outlined">check</span> :
                           isInProgress ? <span className="material-symbols-outlined animate-pulse">sync</span> :
                              <span className="font-bold">{index + 1}</span>}
                     </div>

                     <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all
                            ${isCompleted ? 'bg-white border-green-200 shadow-sm' :
                           isInProgress ? 'bg-white border-2 border-primary shadow-md' :
                              'bg-gray-50 border-gray-200 border-dashed opacity-70'}
                        `}>
                        {isCompleted && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">COMPLETADO</div>}
                        {isInProgress && <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN PROGRESO</div>}

                        <h3 className={`text-xl font-bold mb-2 ${isPending ? 'text-gray-500' : 'text-gray-900'}`}>{milestone.title}</h3>
                        <p className={`mb-4 ${isPending ? 'text-gray-400' : 'text-gray-600'}`}>{milestone.description}</p>

                        {isInProgress && (
                           <div className="bg-gray-100 rounded-full h-2.5 mb-4">
                              <div className="bg-primary h-2.5 rounded-full" style={{ width: '60%' }}></div>
                           </div>
                        )}

                        <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 mt-4">
                           <div>
                              <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>${milestone.amount.toLocaleString()} USD</span>
                              <span className="text-xs text-gray-500">{milestone.isPaid ? 'Pagado' : (isCompleted ? 'En Garantía (Escrow)' : 'Pendiente')}</span>
                           </div>
                           <div className="text-right">
                              {milestone.dueDate && (
                                 <>
                                    <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-primary'}`}>Entrega estimada</span>
                                    <span className="text-xs text-gray-500">{new Date(milestone.dueDate).toLocaleDateString()}</span>
                                 </>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}

         </div>
      </div>
   );
};

export default ClientProjectMilestones;