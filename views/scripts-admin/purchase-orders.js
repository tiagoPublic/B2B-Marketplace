document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões de edição
    const editButtons = document.querySelectorAll('.tableBtnEditPurchase');

    editButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const orderId = this.getAttribute('data-order-id');
            console.log(`Order ID: ${orderId}`);

            try {
                const response = await fetch(`/order/items/${orderId}`);
                if (!response.ok) {
                    throw new Error('Erro ao carregar itens da ordem.');
                }

                const orderItems = await response.json();
                console.log('Itens da Ordem:', orderItems);

                // Limpa a tabela antes de adicionar novos itens
                const tableBody = document.getElementById('orderItemsBody');
                tableBody.innerHTML = '';

                // Adiciona cada item da ordem à tabela
                orderItems.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td >${item.order_id}</td>
                        <td><img class="object-cover" src="/assets/empresas_img/${item.img}" alt=""></td>
                        <td>${item.ref}</td>
                        <td>${item.product}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)}€</td>
                        <td>${item.seller}</td>
                    `;
                    tableBody.appendChild(row);
                });

                // Mostra a tabela de itens da ordem
                const form = document.getElementById('tableOrderItems');
                if (form.style.display === 'none' || form.style.display === '') {
                    form.style.display = 'block';
                    form.scrollIntoView({ behavior: 'smooth' });
                } else {
                    form.style.display = 'none';
                }
            } catch (error) {
                console.error('Erro:', error.message);
            }
        });
    });
});