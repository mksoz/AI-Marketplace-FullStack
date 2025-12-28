
import React from 'react';

interface Field {
    id: string;
    label: string;
    helperText?: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'date';
    inputFormat?: 'single' | 'range';
    required: boolean;
    options?: string[];
    validation?: { min?: number | string; max?: number | string };
}

interface TemplateRendererProps {
    templateName: string;
    templateDesc: string;
    fields: Field[];
    answers: Record<string, any>;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ templateName, templateDesc, fields, answers }) => {

    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-pink-50 to-white px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-pink-500">assignment</span>
                <div>
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Detalles de la Solicitud</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{templateName} - {templateDesc}</p>
                </div>
            </div>

            <div className="p-6 space-y-4 bg-gray-50/50">
                {(fields && fields.length > 0) ? fields.map(field => {
                    const answer = answers[field.id];
                    let displayValue = "";
                    if (answer === undefined || answer === null || answer === "") {
                        displayValue = "No especificado";
                    } else if (typeof answer === 'object' && answer.min !== undefined) {
                        displayValue = `${answer.min} - ${answer.max || 'N/A'}`;
                    } else {
                        displayValue = String(answer);
                    }

                    return (
                        <div key={field.id} className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-pink-200 transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <label className="block text-base font-bold text-gray-800">
                                    {field.label}
                                </label>
                                <div className="flex gap-2">
                                    {field.required && (
                                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[10px]">check</span> Obligatorio
                                        </span>
                                    )}
                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        {field.type}
                                    </span>
                                </div>
                            </div>

                            <div className="text-gray-900 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 font-medium">
                                {displayValue}
                            </div>

                            {field.helperText && (
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    {field.helperText}
                                </p>
                            )}
                        </div>
                    );
                }) : (
                    // Fallback for unstructured data - "Premium" look with Manual Mapping
                    Object.entries(answers || {}).map(([key, value]) => {
                        // Intelligent Mapping for "Bad" Data
                        let label = key;
                        if (key === "1") label = "Primary Goal";
                        else if (key === "2") label = "Preferred Model";
                        else if (key === "3") label = "Estimated Monthly Users";
                        else label = key.replace(/([A-Z])/g, ' $1').trim();

                        return (
                            <div key={key} className="group bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-pink-200 transition-all">
                                <div className="flex justify-between items-start mb-3">
                                    <label className="block text-base font-bold text-gray-800 capitalize">
                                        {label}
                                    </label>
                                    <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        Respuesta
                                    </span>
                                </div>
                                <div className="text-gray-900 text-sm bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 font-medium">
                                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </div>
                            </div>
                        );
                    })
                )}

                {(!fields?.length && !Object.keys(answers || {}).length) && (
                    <div className="text-gray-400 text-sm italic text-center py-8">No hay datos disponibles en esta solicitud.</div>
                )}
            </div>
        </div>
    );
};

export default TemplateRenderer;
