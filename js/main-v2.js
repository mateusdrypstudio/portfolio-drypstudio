console.log("main.js carregado com sucesso!");
// main.js - DRYP Studio Portfolio

// Rolagem suave para os links do menu
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 60,
                behavior: 'smooth'
            });
        }
    });
});

//Efeito simples no scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.background = "rgba(0,0,0,0.95)";
    } else {
        header.style.background = "rgba(0,0,0,0.8)";
    }
});

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Formulario enviado!'); // <--- teste

    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        message: e.target.message.value
    };

    const response = await fetch('https://88g19p481k.execute-api.sa-east-1.amazonaws.com/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(formData)
    });

    const result = await response.json();
    alert(result.message);
});