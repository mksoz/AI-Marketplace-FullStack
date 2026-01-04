import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface Milestone {
   id: string;
   title: string;
   description: string;
   amount: number;
   status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID';
   dueDate?: string;
   isPaid?: boolean;
   completionNote?: string;
   paymentRequest?: {
      id: string;
      status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
      vendorNote?: string;
      amount: number;
      rejectionReason?: string;
   };
}

interface ClientProjectMilestonesProps {
   project: any;
   onUpdate?: () => void;
}

const ClientProjectMilestones: React.FC<ClientProjectMilestonesProps> = ({ project, onUpdate }) => {
   const milestones: Milestone[] = project?.milestones || [];
   const { showToast } = useToast();

   // Modal states
   const [showApproveModal, setShowApproveModal] = useState(false);
   const [showRejectModal, setShowRejectModal] = useState(false);
   const [selectedRequest, setSelectedRequest] = useState<{ milestone: Milestone, requestId: string } | null>(null);
   const [rejectionReason, setRejectionReason] = useState('');
   const [loading, setLoading] = useState(false);

   const handleApprovePayment = async () => {
      if (!selectedRequest) return;

      setLoading(true);
      try {
         await api.post(`/milestones/payment-requests/${selectedRequest.requestId}/approve`);
         showToast('Pago aprobado y procesado correctamente', 'success');
         setShowApproveModal(false);
         setSelectedRequest(null);
         if (onUpdate) onUpdate();
      } catch (error: any) {
         console.error('Error approving payment:', error);
         showToast(error.response?.data?.message || 'Error al aprobar el pago', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleRejectPayment = async () => {
      if (!selectedRequest || !rejectionReason.trim()) {
         showToast('Debes especificar el motivo del rechazo', 'warning');
         return;
      }

      setLoading(true);
      try {
         await api.post(`/milestones/payment-requests/${selectedRequest.requestId}/reject`, {
            rejectionReason: rejectionReason.trim()
         });
         showToast('Solicitud rechazada correctamente', 'success');
         setShowRejectModal(false);
         setSelectedRequest(null);
         setRejectionReason('');
         if (onUpdate) onUpdate();
      } catch (error: any) {
         console.error('Error rejecting payment:', error);
         showToast(error.response?.data?.message || 'Error al rechazar la solicitud', 'error');
      } finally {
         setLoading(false);
      }
   };

   if (milestones.length === 0) {
      return (
         <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">flag</span>
            <p className="text-gray-500">No se han definido hitos para este proyecto.</p>
         </div>
      );
   }

   return (
      <>
         <div className="max-w-3xl mx-auto space-y-8">
            <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:top-0 before:left-[23px] before:h-full before:w-0.5 before:bg-gray-200">

               {milestones.map((milestone, index) => {
                  const isCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';
                  const isInProgress = milestone.status === 'IN_PROGRESS';
                  const isPending = milestone.status === 'PENDING';
                  const hasPendingRequest = milestone.paymentRequest?.status === 'PENDING';

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
                                 {/* Show action button if pending request, otherwise show amount */}
                                 {hasPendingRequest ? (
                                    <button
                                       onClick={() => {
                                          setSelectedRequest({
                                             milestone,
                                             requestId: milestone.paymentRequest!.id
                                          });
                                          setShowApproveModal(true);
                                       }}
                                       className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                    >
                                       <span className="material-symbols-outlined text-base">notification_important</span>
                                       Revisar Solicitud (${milestone.amount.toLocaleString()})
                                    </button>
                                 ) : (
                                    <>
                                       <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>${milestone.amount.toLocaleString()} USD</span>
                                       <span className="text-xs text-gray-500">{milestone.isPaid ? 'Pagado' : (isCompleted ? 'En Garantía (Escrow)' : 'Pendiente')}</span>
                                    </>
                                 )}
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

                           {/* Payment request status badge */}
                           {milestone.paymentRequest && milestone.paymentRequest.status !== 'PENDING' && (
                              <div className="mt-3">
                                 <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${milestone.paymentRequest.status === 'APPROVED' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                    milestone.paymentRequest.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' :
                                       'bg-red-50 border-red-200 text-red-700'
                                    }`}>
                                    <span className="material-symbols-outlined text-sm">
                                       {milestone.paymentRequest.status === 'COMPLETED' ? 'check_circle' :
                                          milestone.paymentRequest.status === 'APPROVED' ? 'thumb_up' : 'cancel'}
                                    </span>
                                    <span>
                                       {milestone.paymentRequest.status === 'APPROVED' && 'Aprobado - Procesando'}
                                       {milestone.paymentRequest.status === 'COMPLETED' && 'Pago Completado'}
                                       {milestone.paymentRequest.status === 'REJECTED' && 'Rechazado'}
                                    </span>
                                 </div>
                              </div>
                           )}

                           {/* Completion note */}
                           {milestone.completionNote && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                 <details className="group">
                                    <summary className="cursor-pointer flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 select-none">
                                       <span className="material-symbols-outlined text-base">description</span>
                                       Ver justificación del vendor
                                       <span className="material-symbols-outlined text-base ml-auto group-open:rotate-180 transition-transform">expand_more</span>
                                    </summary>
                                    <p className="mt-3 text-sm text-gray-700 italic bg-green-50 p-3 rounded-lg border border-green-100">
                                       "{milestone.completionNote}"
                                    </p>
                                 </details>
                              </div>
                           )}
                        </div>
                     </div>
                  );
               })}

            </div>
         </div>

         {/* Approve Payment Modal */}
         {showApproveModal && selectedRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                  <div className="p-6 relative">
                     <button
                        onClick={() => setShowApproveModal(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                     >
                        <span className="material-symbols-outlined">close</span>
                     </button>
                     <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <span className="material-symbols-outlined text-3xl text-purple-600">payments</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitud de Pago</h3>
                        <p className="text-gray-600 text-sm mb-4">
                           Hito: <span className="font-bold">{selectedRequest.milestone.title}</span>
                        </p>
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                           <p className="text-xs text-purple-600 font-bold uppercase mb-1">Monto Solicitado</p>
                           <p className="text-3xl font-black text-gray-900">${selectedRequest.milestone.amount.toLocaleString()}</p>
                        </div>
                     </div>

                     {selectedRequest.milestone.paymentRequest?.vendorNote && (
                        <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                           <p className="text-xs font-bold text-gray-700 mb-1">Nota del Vendor:</p>
                           <p className="text-sm text-gray-600 italic">"{selectedRequest.milestone.paymentRequest.vendorNote}"</p>
                        </div>
                     )}

                     <div className="flex gap-3">
                        <button
                           onClick={() => {
                              setShowApproveModal(false);
                              setShowRejectModal(true);
                           }}
                           className="flex-1 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl border border-red-200"
                           disabled={loading}
                        >
                           Rechazar
                        </button>
                        <button
                           onClick={handleApprovePayment}
                           className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                           disabled={loading}
                        >
                           {loading ? (
                              <span className="flex items-center justify-center gap-2">
                                 <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                 Procesando...
                              </span>
                           ) : (
                              'Aprobar y Pagar'
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Reject Payment Modal */}
         {showRejectModal && selectedRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                  <div className="p-6">
                     <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                           <span className="material-symbols-outlined text-3xl text-red-600">cancel</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Rechazar Solicitud</h3>
                        <p className="text-gray-600 text-sm">
                           Hito: <span className="font-bold">{selectedRequest.milestone.title}</span>
                        </p>
                     </div>

                     <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                           Motivo del Rechazo <span className="text-red-500">*</span>
                        </label>
                        <textarea
                           className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none h-32"
                           placeholder="Explica por qué rechazas esta solicitud de pago..."
                           value={rejectionReason}
                           onChange={(e) => setRejectionReason(e.target.value)}
                           disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">El vendor recibirá este mensaje</p>
                     </div>

                     <div className="flex gap-3">
                        <button
                           onClick={() => {
                              setShowRejectModal(false);
                              setShowApproveModal(true);
                              setRejectionReason('');
                           }}
                           className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                           disabled={loading}
                        >
                           Volver
                        </button>
                        <button
                           onClick={handleRejectPayment}
                           className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                           disabled={loading || !rejectionReason.trim()}
                        >
                           {loading ? (
                              <span className="flex items-center justify-center gap-2">
                                 <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                 Rechazando...
                              </span>
                           ) : (
                              'Confirmar Rechazo'
                           )}
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};

export default ClientProjectMilestones;