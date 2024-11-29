document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões "View"
    const viewButtons = document.querySelectorAll('.tableBtnView');

    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            console.log(`Product ID: ${productId}`);
            
            // Redireciona para a página de detalhes do produto
            window.location.href = `/page-single/${productId}`;
        });
    });
});