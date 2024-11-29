// ALTER IMAGE
document.getElementById('btnAlterImageForm').addEventListener('click', function() {
    var form = document.getElementById('alterImageForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }

    const editImageForm = document.getElementById('editImageForm');
    editImageForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(editImageForm);

        const confirmation = confirm(`Are you sure you want to change the profile image?`);
        if (confirmation){
        

            fetch('/editProfileImage', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload(); // Recarrega a página após a edição bem-sucedida
                } else {
                    alert('Failed to update profile image');
                }
            })
            .catch(error => console.error('Erro ao atualizar a imagem do perfil:', error));
        }
    });
});

document.getElementById('closeFormAlterImage').addEventListener('click', function() {
    var form = document.getElementById('alterImageForm');
    form.style.display = 'none';
});

// ALTER CONTACT
document.getElementById('btnAlterContactForm').addEventListener('click', function() {
    var form = document.getElementById('alterContactForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }

    const editNameForm = document.getElementById('editContactForm');
    editNameForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(editNameForm);
        const data = {
            contact: formData.get('contact')
        };
        const confirmation = confirm(`Are you sure you want to change the profile contact?`);
        if (confirmation){
            fetch('/editProfileContact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload(); // Recarrega a página após a edição bem-sucedida
                } else {
                    alert('Failed to update profile contact');
                }
            })
            .catch(error => console.error('Erro ao atualizar o contacto do perfil:', error));
        }
    });
});

document.getElementById('closeFormAlterContact').addEventListener('click', function() {
    var form = document.getElementById('alterContactForm');
    form.style.display = 'none';
});

// ALTER NAME
document.getElementById('btnAlterNameForm').addEventListener('click', function() {
    var form = document.getElementById('alterNameForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }

    const editNameForm = document.getElementById('editNameForm');
    editNameForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(editNameForm);
        const data = {
            name: formData.get('name')
        };
        const confirmation = confirm(`Are you sure you want to change the profile name?`);
        if (confirmation){
            fetch('/editProfileName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload(); // Recarrega a página após a edição bem-sucedida
                } else {
                    alert('Failed to update profile name');
                }
            })
            .catch(error => console.error('Erro ao atualizar o nome do perfil:', error));
        }
    });
});

document.getElementById('closeFormAlterName').addEventListener('click', function() {
    var form = document.getElementById('alterNameForm');
    form.style.display = 'none';
});

// ALTER ADDRESS
document.getElementById('btnAlterAdressForm').addEventListener('click', function() {
    var form = document.getElementById('alterAdressForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }

    const editAdressForm = document.getElementById('editAdressForm');
    editAdressForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(editAdressForm);
        const data = {
            adress: formData.get('adress')
        };
        const confirmation = confirm(`Are you sure you want to change the profile adress?`);
        if (confirmation){
            fetch('/editProfileAdress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload(); // Recarrega a página após a edição bem-sucedida
                } else {
                    alert('Failed to update profile adress');
                }
            })
            .catch(error => console.error('Erro ao atualizar o endereço do perfil:', error));
        }
    });
});

document.getElementById('closeFormAlterAdress').addEventListener('click', function() {
    var form = document.getElementById('alterAdressForm');
    form.style.display = 'none';
});

// ALTER EMAIL
document.getElementById('btnAlterEmailForm').addEventListener('click', function() {
    var form = document.getElementById('alterEmailForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }

    const editEmailForm = document.getElementById('editEmailForm');
    editEmailForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(editEmailForm);
        const data = {
            email: formData.get('email')
        };
        const confirmation = confirm(`Are you sure you want to change the profile email?`);
        if (confirmation){
            fetch('/editProfileEmail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload(); // Recarrega a página após a edição bem-sucedida
                } else {
                    alert('Failed to update profile email');
                }
            })
            .catch(error => console.error('Erro ao atualizar o endereço do perfil:', error));
        }
    });
});

document.getElementById('closeFormAlterEmail').addEventListener('click', function() {
    var form = document.getElementById('alterEmailForm');
    form.style.display = 'none';
});

// ALTER DESCRIPTION
document.getElementById('btnAlterDescriptionForm').addEventListener('click', function() {
    var form = document.getElementById('alterDescriptionForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }

    const editDescriptionForm = document.getElementById('editDescriptionForm');
    editDescriptionForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(editDescriptionForm);
        const data = {
            description: formData.get('description')
        };
        const confirmation = confirm(`Are you sure you want to change the profile description?`);
        if (confirmation){
            fetch('/editProfileDescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                    location.reload(); // Recarrega a página após a edição bem-sucedida
                } else {
                    alert('Failed to update profile description');
                }
            })
            .catch(error => console.error('Erro ao atualizar o endereço do perfil:', error));
        }
    });
});

document.getElementById('closeFormAlterDescription').addEventListener('click', function() {
    var form = document.getElementById('alterDescriptionForm');
    form.style.display = 'none';
});

// ALTER PASSWORD
document.getElementById('btnAlterPasswdForm').addEventListener('click', function() {
    var form = document.getElementById('alterPasswdForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
});

document.getElementById('closeFormAlterPasswd').addEventListener('click', function() {
    var form = document.getElementById('alterPasswdForm');
    form.style.display = 'none';
});

document.getElementById('editPasswordForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var newPassword = document.getElementById('new_password').value;
    var confirmPassword = document.getElementById('confirm_password').value;

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    fetch('/editProfilePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Password successfully updated.');
            location.reload();
        } else {
            alert('Failed to update password: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});
