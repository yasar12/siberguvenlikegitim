document.addEventListener('DOMContentLoaded', function() {
    // Progress bar animasyonları
    const progressBars = document.querySelectorAll('.progress');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });

    // Mobil menü toggle
    const nav = document.querySelector('nav ul');
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.innerHTML = '☰';
    document.querySelector('nav').insertBefore(menuButton, nav);

    menuButton.addEventListener('click', () => {
        nav.classList.toggle('show');
    });
}); 