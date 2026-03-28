document.addEventListener('DOMContentLoaded', () => {
    initStorageInfo();
    fetchComments();
    initFeedbackModal();
    initTheme();
});

function initStorageInfo() {
    const info = {
        os: navigator.platform,
        browser: navigator.userAgent,
        timestamp: new Date().toLocaleString()
    };
    
    localStorage.setItem('systemInfo', JSON.stringify(info));

    const infoContainer = document.getElementById('system-info');
    if (infoContainer) {
        const storedInfo = JSON.parse(localStorage.getItem('systemInfo'));
        infoContainer.innerHTML = `
            <p><strong>OS/Browser Info (from LocalStorage):</strong></p>
            <p>OS: ${storedInfo.os}</p>
            <p>Browser: ${storedInfo.browser}</p>
        `;
    }
}

async function fetchComments() {
    const container = document.getElementById('comments-container');
    const variantNum = 20;
    
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${variantNum}/comments`);
        const comments = await response.json();
        
        container.innerHTML = '';
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            commentElement.innerHTML = `
                <h4>${comment.name}</h4>
                <p class="comment-email">${comment.email}</p>
                <p class="comment-body">${comment.body}</p>
            `;
            container.appendChild(commentElement);
        });
    } catch (error) {
        container.innerHTML = '<p>Не вдалося завантажити коментарі.</p>';
        console.error('Error fetching comments:', error);
    }
}

function initFeedbackModal() {
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.querySelector('.close-modal');

    setTimeout(() => {
        modal.style.display = 'block';
    }, 60000);

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                if (response.ok) {
                    alert('Дякуємо! Ваше повідомлення надіслано.');
                    modal.style.display = 'none';
                    contactForm.reset();
                } else {
                    alert('Помилка: ' + result.error);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Не вдалося зв’язатися з сервером.');
            }
        };
    }

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const currentHour = new Date().getHours();
    const isNightTime = currentHour < 7 || currentHour >= 21;

    if (isNightTime) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    toggleBtn.addEventListener('click', () => {
        if (body.classList.contains('dark-theme')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });
}

function setTheme(mode) {
    const body = document.body;
    const btn = document.getElementById('theme-toggle');

    if (mode === 'dark') {
        body.classList.add('dark-theme');
        btn.innerHTML = '☀️ Day Mode';
    } else {
        body.classList.remove('dark-theme');
        btn.innerHTML = '🌙 Night Mode';
    }
}
