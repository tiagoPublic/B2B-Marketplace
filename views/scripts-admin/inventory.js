// ADD/REMOVE PRODUCT FORM
document.getElementById('toggleAddProductFormButton').addEventListener('click', function() {
    var form = document.getElementById('addProductForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
});

document.getElementById('toggleDeleteProductFormButton').addEventListener('click', function() {
    var form = document.getElementById('deleteProductForm');
    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
});

document.getElementById('toggleAddProductPromotion').addEventListener('click', function() {
    var form = document.getElementById('addProductPromotion');

    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
});

document.getElementById('toggleRemoveProductPromotion').addEventListener('click', function() {
    var form = document.getElementById('removeProductPromotion');

    if (form.style.display === 'none') {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    } else {
        form.style.display = 'none';
    }
});

// CARREGAR NOS BOTOES EDIT
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona todos os botões de edição
    const editButtons = document.querySelectorAll('.tableBtnEdit');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productRow = this.closest('tr');
            const productId = productRow.getAttribute('data-product-id');

            const form = document.getElementById('editTableProducts');
            const productIdField = form.querySelector('#product_id');
            productIdField.value = productId;

            if (form.style.display === 'none' || form.style.display === '') {
                form.style.display = 'block';
                form.scrollIntoView({ behavior: 'smooth' });
            } else {
                form.style.display = 'none';
            }
        });
    });

    document.getElementById('field_to_edit').addEventListener('change', function() {
        var selectedField = this.value;

        // Hide all edit fields
        document.querySelectorAll('.input-field-addProduct').forEach(function(element) {
            if (!element.querySelector('select')) {
                element.classList.add('hidden');
            }
        });

        // Show the selected field
        if (selectedField) {
            document.getElementById('edit_' + selectedField).classList.remove('hidden');
        }
    });

    const editProductForm = document.getElementById('editProductForm');
    editProductForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Evita o envio padrão do formulário

        const formData = new FormData(editProductForm);
        const data = {
            productId: formData.get('product_id'),
            field_to_edit: formData.get('field_to_edit'),
            value: formData.get(formData.get('value'))
        };



        fetch('/editProduct', {
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
                alert('Failed to update product');
            }
        })
        .catch(error => console.error('Erro ao atualizar o produto:', error));
    });
});



document.addEventListener('DOMContentLoaded', function() {
    const editButtons = document.querySelectorAll('.tableBtnEditPromo');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            const productName = this.getAttribute('data-product-name');

            const form = document.getElementById('editTableProductsPromotion');
            if (form.style.display === 'none' || form.style.display === '') {
                form.style.display = 'block';
                form.scrollIntoView({ behavior: 'smooth' });

                const formTitle = form.querySelector('h3');
                formTitle.textContent = `Edit Promotion Price for ${productName}`;
            } else {
                form.style.display = 'none';
            }

            // Define o productId diretamente no formulário antes do envio
            const editPromotionPriceForm = document.getElementById('editPromotionPriceForm');
            editPromotionPriceForm.addEventListener('submit', function(event) {
                event.preventDefault(); // Evita o envio padrão do formulário

                const formData = new FormData(editPromotionPriceForm);
                formData.set('productId', productId); // Define o productId no FormData
                const promotionPrice = formData.get('promotion_price');

                const confirmation = confirm(`Do you want to change the promotional price to ${promotionPrice} for this product?`);
                if (confirmation){
                    fetch('/editPromotionPrice', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ productId, promotionPrice }) 
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                            location.reload(); // Recarrega a página após a edição bem-sucedida
                        } else {
                            alert('Failed to update promotion price');
                        }
                    })
                    .catch(error => console.error('Erro ao atualizar o preço promocional:', error));
                } else {
                    console.log('Alteração de preço promocional cancelada.');
                }
                
            });
        });
    });
});





