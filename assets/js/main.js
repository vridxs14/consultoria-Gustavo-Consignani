document.addEventListener('DOMContentLoaded', () => {
    /* =========================================
       MENU MOBILE (HAMBURGUER)
       ========================================= */
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            
            // Alterna ícone (opcional: de hambúrguer para X)
            const isActive = navMenu.classList.contains('active');
            mobileMenuBtn.innerHTML = isActive ? '&times;' : '&#9776;';
        });

        // Fechar menu ao clicar em um link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = '&#9776;';
            });
        });
    }

    /* =========================================
       SCROLL HEADER (Efeito ao rolar)
       ========================================= */
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.98)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
        } else {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
});
