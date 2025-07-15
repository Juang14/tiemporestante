// Esperar a que el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // ========================
    // MODAL DE COOKIES
    // ========================
    
    const cookieModal = document.getElementById('cookieModal');
    const acceptButton = document.getElementById('acceptCookies');
    
    // Mostrar modal si no se han aceptado las cookies
    function showCookieModal() {
        if (!localStorage.getItem('cookiesAccepted')) {
            cookieModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Ocultar modal al aceptar cookies
    function hideCookieModal() {
        cookieModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        localStorage.setItem('cookiesAccepted', 'true');
        
        // Animación de salida
        cookieModal.style.opacity = '0';
        setTimeout(() => {
            cookieModal.style.display = 'none';
            cookieModal.style.opacity = '1';
        }, 300);
    }
    
    // Event listeners para cookies
    acceptButton.addEventListener('click', hideCookieModal);
    
    // Cerrar modal si se hace clic fuera del contenido
    cookieModal.addEventListener('click', function(e) {
        if (e.target === cookieModal) {
            hideCookieModal();
        }
    });
    
    // Mostrar modal al cargar la página
    showCookieModal();
    
    // ========================
    // NAVEGACIÓN SUAVE
    // ========================
    
    // Scroll suave para enlaces de navegación
    const navLinks = document.querySelectorAll('.main-nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Offset para el navbar fijo
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Destacar enlace activo
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // ========================
    // FORMULARIO DE RESERVAS
    // ========================
    
    const reservationForm = document.querySelector('.reservation-form');
    const dateInput = document.getElementById('date');
    const submitButton = reservationForm.querySelector('.btn-primary');
    
    // Establecer fecha mínima (hoy)
    function setMinDate() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const minDate = tomorrow.toISOString().split('T')[0];
        dateInput.setAttribute('min', minDate);
    }
    
    // Validación personalizada del formulario
    function validateForm() {
        const formData = new FormData(reservationForm);
        const errors = [];
        
        // Validar nombre
        if (!formData.get('name').trim()) {
            errors.push('El nombre es obligatorio');
        }
        
        // Validar email
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Por favor, introduce un email válido');
        }
        
        // Validar fecha
        const selectedDate = new Date(formData.get('date'));
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            errors.push('La fecha debe ser posterior a hoy');
        }
        
        // Validar hora
        if (!formData.get('time')) {
            errors.push('Por favor, selecciona una hora');
        }

        // Validar selección de comensales
            const guests = formData.get('guests');
            if (!guests || guests !== 'pareja-chef') {
                errors.push('Solo está disponible la opción: 1 + el chef');
            }
        return errors;
    }
    
    // Mostrar mensajes de error
    function showErrors(errors) {
        // Remover mensajes de error previos
        const existingErrors = document.querySelectorAll('.error-message');
        existingErrors.forEach(error => error.remove());
        
        if (errors.length > 0) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background-color: #f8d7da;
                color: #721c24;
                padding: 1rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                border: 1px solid #f5c6cb;
            `;
            
            const errorList = errors.map(error => `<li>${error}</li>`).join('');
            errorDiv.innerHTML = `
                <strong>Por favor, corrige los siguientes errores:</strong>
                <ul style="margin: 0.5rem 0 0 1rem;">${errorList}</ul>
            `;
            
            reservationForm.insertBefore(errorDiv, reservationForm.firstChild);
            
            // Scroll al formulario para mostrar errores
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    // Mostrar mensaje de éxito
    function showSuccessMessage() {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style.cssText = `
            background-color: #d4edda;
            color: #155724;
            padding: 2rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid #c3e6cb;
            text-align: center;
            animation: fadeInUp 0.5s ease-out;
        `;
        
        successDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #155724;">🎉 ¡Reserva Enviada!</h3>
            <p>Hemos recibido su solicitud de reserva. Le contactaremos pronto para confirmar los detalles.</p>
            <p><small>Recuerde: se añadirán automáticamente 15 minutos a la hora seleccionada.</small></p>
        `;
        
        // Remover el formulario y mostrar mensaje de éxito
        reservationForm.style.display = 'none';
        reservationForm.parentNode.insertBefore(successDiv, reservationForm);
        
        // Scroll al mensaje de éxito
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Estado de carga del formulario
    function setFormLoading(loading) {
        if (loading) {
            submitButton.disabled = true;
            submitButton.innerHTML = 'Enviando... ⏳';
            reservationForm.classList.add('form-loading');
        } else {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Solicitar Reserva';
            reservationForm.classList.remove('form-loading');
        }
    }
    
    // Manejar envío del formulario
    reservationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validar formulario
        const errors = validateForm();
        if (errors.length > 0) {
            showErrors(errors);
            return;
        }
        
        // Limpiar errores previos
        showErrors([]);
        
        // Mostrar estado de carga
        setFormLoading(true);
        
        try {
            // Simular delay de red (remover en producción)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Enviar formulario a Formspree
            const response = await fetch(this.action, {
                method: 'POST',
                body: new FormData(this),
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                showSuccessMessage();
                
                // Opcional: Analytics o tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'reservation_submitted', {
                        'event_category': 'engagement',
                        'event_label': 'restaurant_reservation'
                    });
                }
            } else {
                throw new Error('Error en el servidor');
            }
            
        } catch (error) {
            console.error('Error al enviar formulario:', error);
            showErrors(['Ha ocurrido un error al enviar su reserva. Por favor, inténtelo de nuevo.']);
        } finally {
            setFormLoading(false);
        }
    });
    
    // ========================
    // EFECTOS VISUALES
    // ========================
    
    // Animación de aparición en scroll
    function animateOnScroll() {
        const elements = document.querySelectorAll('.team-member, .review, .award, .gallery-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
    
    // Efecto parallax sutil en el hero
    function parallaxEffect() {
        const hero = document.querySelector('.hero');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }
    
    // ========================
    // UTILIDADES
    // ========================
    
    // Formatear fecha para el formulario
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    // Obtener día de la semana
    function getDayOfWeek(dateString) {
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const date = new Date(dateString);
        return days[date.getDay()];
    }
    
    // Mostrar día de la semana cuando se selecciona fecha
    dateInput.addEventListener('change', function() {
        if (this.value) {
            const dayOfWeek = getDayOfWeek(this.value);
            
            // Buscar o crear elemento para mostrar el día
            let dayDisplay = document.querySelector('.day-display');
            if (!dayDisplay) {
                dayDisplay = document.createElement('p');
                dayDisplay.className = 'day-display';
                dayDisplay.style.cssText = `
                    margin-top: 0.5rem;
                    color: var(--primary-gold);
                    font-weight: 600;
                    font-size: 0.9rem;
                `;
                this.parentNode.appendChild(dayDisplay);
            }
            
            dayDisplay.textContent = `${dayOfWeek}`;
        }
    });
    
    // ========================
    // INICIALIZACIÓN
    // ========================
    
    // Ejecutar funciones de inicialización
    setMinDate();
    animateOnScroll();
    parallaxEffect();
    
    // Console easter egg
    console.log(`
    🍽️ Can Juan Timeleft - Restaurante de Alta Cocina
    
    ¡Hola desarrollador curioso! 
    
    Si estás viendo esto, significa que te gusta investigar el código.
    Nuestra cocina también está llena de secretos deliciosos.
    
    ¿Te gustaría hacer una reserva? 😉
    
    Desarrollado con ❤️ y mucho humor
    `);
    
});

// ========================
// FUNCIONES GLOBALES
// ========================

// Función para cerrar modal (accesible globalmente)
window.closeCookieModal = function() {
    const modal = document.getElementById('cookieModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    localStorage.setItem('cookiesAccepted', 'true');
};

// Función para mostrar modal nuevamente (para testing)
window.showCookieModal = function() {
    localStorage.removeItem('cookiesAccepted');
    location.reload();
};