import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "El nombre completo es obligatorio.";
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Introduce un email válido.";
    }
    
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (formData.password.length < 8) {
      newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
    }

    if (!formData.role.trim()) newErrors.role = "El rol en la empresa es obligatorio.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Proceed with registration logic
      console.log("Formulario válido, enviando datos:", formData);
      alert("¡Cuenta creada exitosamente! (Simulación)");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header simple />
      
      <div className="flex-grow flex flex-col lg:flex-row">
         {/* Form Panel */}
         <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-24 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full space-y-8">
               <div>
                  <h1 className="text-4xl font-black text-dark tracking-tight mb-2">Crea tu cuenta gratis</h1>
                  <p className="text-gray-500">Paso 1 de 1</p>
               </div>

               <div className="space-y-4">
                  <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                     <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                     Continuar con Google
                  </button>
                  <button className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700">
                     <img src="https://www.svgrepo.com/show/448234/linkedin.svg" alt="LinkedIn" className="w-5 h-5" />
                     Continuar con LinkedIn
                  </button>
               </div>

               <div className="flex items-center gap-4">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-sm text-gray-400">o</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
               </div>

               <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                     <input 
                       type="text" 
                       name="name"
                       value={formData.name}
                       onChange={handleChange}
                       className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                       placeholder="Juan Pérez" 
                     />
                     {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                     <input 
                       type="email" 
                       name="email"
                       value={formData.email}
                       onChange={handleChange}
                       className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                       placeholder="nombre@empresa.com" 
                     />
                     {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div className="relative">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                     <input 
                       type={showPassword ? 'text' : 'password'} 
                       name="password"
                       value={formData.password}
                       onChange={handleChange}
                       className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
                       placeholder="Crear contraseña" 
                     />
                     <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)}
                       className="absolute top-9 right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                     >
                        <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                     </button>
                     {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Rol en la empresa</label>
                     <input 
                       type="text" 
                       name="role"
                       value={formData.role}
                       onChange={handleChange}
                       className={`w-full px-4 py-3 rounded-lg border bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all ${errors.role ? 'border-red-500' : 'border-gray-300'}`} 
                       placeholder="CEO, CTO..." 
                     />
                     {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                  </div>

                  <Button fullWidth size="lg" variant="primary" type="submit">Crear cuenta</Button>
               </form>
               
               <p className="text-xs text-gray-500 text-center">
                  Al crear una cuenta, aceptas nuestros <Link to="#" className="text-primary hover:underline">Términos de Servicio</Link> y <Link to="#" className="text-primary hover:underline">Política de Privacidad</Link>.
               </p>
            </div>
         </div>

         {/* Value Prop Panel */}
         <div className="hidden lg:flex w-1/2 bg-gray-50 relative overflow-hidden items-center justify-center p-12">
            <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(#444cf7_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 max-w-lg space-y-8">
               <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-4xl">hub</span>
                  <span className="text-2xl font-bold text-dark">AI Platform</span>
               </div>
               <h2 className="text-4xl font-extrabold text-dark leading-tight">Encuentra el equipo de IA perfecto para tu proyecto.</h2>
               
               <div className="space-y-6">
                  {[
                     { icon: 'verified', title: 'Acceso a agencias verificadas', text: 'Conecta con los mejores talentos previamente evaluados.' },
                     { icon: 'rocket_launch', title: 'Proceso optimizado', text: 'Gestión integral desde la búsqueda hasta la contratación.' },
                     { icon: 'task_alt', title: 'Gestión segura', text: 'Supervisa avances y pagos con total seguridad.' }
                  ].map((item, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                           <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </div>
                        <div>
                           <h3 className="font-bold text-lg text-dark">{item.title}</h3>
                           <p className="text-gray-500">{item.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
      <FAQWidget />
    </div>
  );
};

export default SignUp;