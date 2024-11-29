//MESSAGE RECEIVED
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões de edição
    const viewButtons = document.querySelectorAll('.viewMessageIcon');
    const replyButton = document.getElementById('replyMessageIcon');
    const replyForm = document.getElementById('replyMessageForm');
    const replyRecipientIdField = document.getElementById('replyRecipientId');
    const replyOriginalTitleField = document.getElementById('replyOriginalTitle');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const messageId = this.getAttribute('data-message-id');
            const messageCard = this.closest('.card-content-messages');


            fetch(`/message/${messageId}`)
                .then(response => response.json())
                .then(data => {
                    // Atualiza o conteúdo do messageCard com os dados da mensagem recebida
                    const messageCard = document.getElementById('messageCard');
                    const messageH4 = messageCard.querySelector('.message-h4');
                    const messageContent = messageCard.querySelector('p');

                    messageH4.innerHTML = `
                        <h4>From: ${data.sender_name}</h4>
                        <h4>Title: ${data.title}</h4>
                        <h4>Date: ${data.formatted_message_date}</h4>
                    `;
                    messageContent.textContent = data.content;

                    replyRecipientIdField.value = data.sender_id;
                    replyOriginalTitleField.value = data.title;

                    // Mostra o messageCard
                    if (messageCard.style.display === 'none' || messageCard.style.display === '') {
                        messageCard.style.display = 'block';
                        messageCard.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        messageCard.style.display = 'none';
                    }
                })
                .catch(error => console.error('Erro ao buscar detalhes da mensagem:', error));
            messageCard.style.backgroundColor = '#C5C6C7';

            fetch(`/markAsRead/${messageId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_read: 1 })
                })
                .catch(error => console.error('Erro ao atualizar o status da mensagem:', error));
        });
    });
    replyButton.addEventListener('click', function() {
        if (replyForm.style.display === 'none' || replyForm.style.display === '') {
            replyForm.style.display = 'block';
            replyForm.scrollIntoView({ behavior: 'smooth' });
        } else {
            replyForm.style.display = 'none';
        }
    });

    replyForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        const formData = new FormData(replyForm);
        const data = {
            replyMsg: formData.get('replyMsg'),
            replyRecipientId: formData.get('replyRecipientId'),
            replyOriginalTitle: formData.get('replyOriginalTitle')
        };

        fetch('/replyMessage', {
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
                location.reload(); // Recarrega a página após o envio bem-sucedido
            } else {
                alert('Failed to reply message');
            }
        })
        .catch(error => console.error('Erro ao enviar a resposta:', error));
    });
    
});



document.getElementById('closeMessageIcon').addEventListener('click', function() {
    var form = document.getElementById('messageCard');
    form.style.display = 'none';
});

document.getElementById('closeMessageSentIcon').addEventListener('click', function() {
    var form = document.getElementById('messageSentCard');
    form.style.display = 'none';
});

//MESSAGE SENT
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões de edição
    const viewButtons = document.querySelectorAll('.viewMessageSentIcon');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const messageId = this.getAttribute('data-message-id');


            fetch(`/message/${messageId}`)
                .then(response => response.json())
                .then(data => {
                    // Atualiza o conteúdo do messageCard com os dados da mensagem recebida
                    const messageCard = document.getElementById('messageSentCard');
                    const messageH4 = messageCard.querySelector('.message-h4');
                    const messageContent = messageCard.querySelector('p');

                    messageH4.innerHTML = `
                        <h4>To: ${data.recipient_name}</h4>
                        <h4>Title: ${data.title}</h4>
                        <h4>Date: ${data.formatted_message_date}</h4>
                    `;
                    messageContent.textContent = data.content;

                    // Mostra o messageCard
                    if (messageCard.style.display === 'none' || messageCard.style.display === '') {
                        messageCard.style.display = 'block';
                        messageCard.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        messageCard.style.display = 'none';
                    }
                })
                .catch(error => console.error('Erro ao buscar detalhes da mensagem:', error));
        });
    });
    
});


//NEW MESSAGE
document.getElementById('newMessage').addEventListener('click', function() {
    var form = document.getElementById('newMessageForm');

    if (form.style.display === 'none' || form.style.display === '') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
});

document.getElementById('closeFormNewMessage').addEventListener('click', function() {
    var form = document.getElementById('newMessageForm');
    form.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('sendMessageForm');
    const companyInput = document.getElementById('company_name');
    const titleInput = document.getElementById('title');
    const msgContentInput = document.getElementById('msg_content');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const company_name = companyInput.value;
        const title = titleInput.value;
        const msg_content = msgContentInput.value;

        // Envia os dados do formulário para a rota sendMessage
        fetch('/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ company_name, title, msg_content })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                window.location.reload();
            } else {
                alert(data.message);
                
            }
        })
        .catch(error => console.error('Error sending message:', error));
    });
});
