//copy menu for mobile
function copyMenu(){
    //copy inside .dpt-cat(department categories) to .departments
    var dptCategory = document.querySelector('.dpt-cat');
    var dptPlace = document.querySelector('.departments');
    dptPlace.innerHTML = dptCategory.innerHTML;

    //copy inside main nav to new nav
    var mainNav = document.querySelector('.header-nav nav');
    var navPlace = document.querySelector('.off-canvas nav');
    navPlace.innerHTML = mainNav.innerHTML;

    //copy .header-top .wrapper to .thetop-nav
    var topNav = document.querySelector('.header-top .wrapper');
    var topPlace = document.querySelector('.off-canvas .thetop-nav');
    topPlace.innerHTML = topNav.innerHTML;
}
copyMenu();

//show menu on mobile devices
const menuButton = document.querySelector('.trigger'),
      closeButton = document.querySelector('.t-close'),
      addclass = document.querySelector('.site');
menuButton.addEventListener('click', function(){
    addclass.classList.toggle('showmenu')
});
closeButton.addEventListener('click', function(){
    addclass.classList.remove('showmenu')
});


//show sub-menu on mobile devices
const submenu = document.querySelectorAll('.has-child .icon-small');
submenu.forEach((menu) => menu.addEventListener('click', toggle));

function toggle(e){
    e.preventDefault();
    submenu.forEach((item) => item != this ? item.closest('.has-child').classList.remove('expand') : null);
    if (this.closest('.has-child').classList != 'expand');
    this.closest('.has-child').classList.toggle('expand')
};

//slide-swipper (não mexer)
const swiper = new Swiper('.swiper', {
    loop: true,
  
    pagination: {
      el: '.swiper-pagination',
    },

});

//show search
const searchButton = document.querySelector('.t-search'),
      tClose = document.querySelector('.search-close'),
      showClass = document.querySelector('.site');

searchButton.addEventListener('click', function(){
    showClass.classList.toggle('showsearch')
});

tClose.addEventListener('click', function(){
    showClass.classList.remove('showsearch')
});


//show dpt menu
const dptButton = document.querySelector('.dpt-cat .dpt-trigger'),
      dptClass = document.querySelector('.site');
dptButton.addEventListener('click', function(){
    dptClass.classList.toggle('showdpt')
});

//product image slider
var productThumb = new Swiper ('.small-image', {
    loop: true,
    spaceBetween: 10,
    slidesPerView: 3,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
        481: {
            spaceBetween: 32,
        }
    }
});

//slide-swipper (não mexer)
var productBig = new Swiper ('.big-image', {
    loop: true,
    autoHeight: true,
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    thumbs: {
        swiper: productThumb,
    }
});

//stock products bar with percentage
var stocks = document.querySelectorAll('.products .stock');
for (let x = 0; x < stocks.length; x++){
    let stock = stocks[x].dataset.stock,
    available = stocks[x].querySelector('.qty-available').innerHTML,
    sold = stocks[x].querySelector('.qty-sold').innerHTML,
    percent = sold*100/stock;

    stocks[x].querySelector('.available').style.width = percent + '%';
};

//show cart on click
const divtoShow = '.mini-cart';
const divPopup = document.querySelector(divtoShow);
const divTrigger = document.querySelector('.cart-trigger');

divTrigger.addEventListener('click', () => {
    setTimeout(() => {
        if(!divPopup.classList.contains('show')){
            divPopup.classList.add('show')
        }
    }, 250)
})

//close by click outside
document.addEventListener('click', (e) => {
    const isClosest = e.target.closest(divtoShow);
    if(!isClosest && divPopup.classList.contains('show')){
        divPopup.classList.remove('show')
    }
})

// aumentar a quantidade no cart page-offer
function decreaseQuantity() {
    event.preventDefault();
    var quantityInput = document.querySelector('.input_quantity');
    var currentQuantity = parseInt(quantityInput.value);
    if (currentQuantity > 1) {
        quantityInput.value = currentQuantity - 1;
    }
}

function increaseQuantity() {
    event.preventDefault();
    var quantityInput = document.querySelector('.input_quantity');
    var currentQuantity = parseInt(quantityInput.value);
    quantityInput.value = currentQuantity + 1;
}

// Load More Button Page-Category
document.addEventListener('DOMContentLoaded', async () => {
    const DepartmentIdElement = document.getElementById('load-more-Depart');
    const DepartmentId = DepartmentIdElement.dataset.id;

    let offset = 12; // Começa depois dos primeiros 2 produtos
    const loadMoreButton = document.getElementById('load-more-Depart');
    const productsContainer = document.querySelector('.products.main.flexwrap');

    loadMoreButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`/load-more-products/${DepartmentId}?offset=${offset}`);
            const { products, total } = await response.json();

            // Adiciona os produtos à lista existente na página
            appendProducts(products);

            offset += 12; // Incrementa o offset para a próxima requisição

            // Verifica se a quantidade de produtos retornados é menor que 2
            if (offset >= total) {
                loadMoreButton.style.display = 'none'; // Esconde o botão
            }
            
        } catch (error) {
            console.error('Erro ao carregar mais produtos:', error);
        }
    });
    function appendProducts(products) {
    // Loop pelos produtos e adiciona cada um à lista de produtos
        products.forEach(product => {
            const productHTML = `
                <div class="media">
                    <div class="thumbnail object-cover">
                        <a href="/page-single/${product.id}">
                            <img src="/assets/empresas_img/${product.main_img}" alt="">
                        </a>
                    </div>
                    <div class="hoverable">
                        <ul>
                            <li class="active"><a href="#"><i class="ri-heart-line"></i></a></li>
                            <li><a href="#"><i class="ri-shuffle-line"></i></a></li>
                        </ul>
                    </div>
                    ${product.is_promotion ? `<div class="discount circle flexcenter"><span>${product.discount_percentage}%</span></div>` : ''}
                </div>
                <div class="content">
                    <div class="rating">
                        <div class="stars">
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                        </div>
                        <span class="mini-text">(2,548)</span>
                    </div>
                    <h3><a href="/page-single/${product.id}">${product.product_name}</a></h3>
                    <div class="price">
                        <span class="current">${product.is_promotion ? product.formatted_promotion_price : product.formatted_price}${product.price_symbol}</span>
                        ${product.is_promotion ? `<span class="normal mini-text">${product.formatted_price}${product.price_symbol}</span>` : ''}
                    </div>
                    <div class="mini-text">
                        <p>By: ${product.company_name}</p>
                    </div>
                    <div class="footer">
                        <ul class="mini-text">
                            <li>Min. Order: ${product.min_order} un</li>
                            <li>Ready to Ship</li>
                        </ul>
                    </div>
                </div>  
            `;
            const productDiv = document.createElement('div');
            productDiv.classList.add('item');
            productDiv.innerHTML = productHTML;
            productsContainer.appendChild(productDiv);
        });
    }
});

// Load More Button Page-Sub_Category
document.addEventListener('DOMContentLoaded', async () => {
    const subDepartmentIdElement = document.getElementById('load-more-subDepart');
    const subDepartmentId = subDepartmentIdElement.dataset.id;

    let offset = 12; // Começa depois dos primeiros 2 produtos
    const loadMoreButton = document.getElementById('load-more-subDepart');
    const productsContainer = document.querySelector('.products.main.flexwrap');

    loadMoreButton.addEventListener('click', async () => {
        try {
            const response = await fetch(`/load-more-products-sub-departments/${subDepartmentId}?offset=${offset}`);
            const { products, total } = await response.json();

            // Adiciona os produtos à lista existente na página
            appendProducts(products);

            offset += 12; // Incrementa o offset para a próxima requisição

            // Verifica se a quantidade de produtos retornados é menor que 2
            if (offset >= total) {
                loadMoreButton.style.display = 'none'; // Esconde o botão
            }
            
        } catch (error) {
            console.error('Erro ao carregar mais produtos:', error);
        }
    });
    function appendProducts(products) {
    // Loop pelos produtos e adiciona cada um à lista de produtos
        products.forEach(product => {
            const productHTML = `
                <div class="media">
                    <div class="thumbnail object-cover">
                        <a href="/page-single/${product.id}">
                            <img src="/assets/empresas_img/${product.main_img}" alt="">
                        </a>
                    </div>
                    <div class="hoverable">
                        <ul>
                            <li class="active"><a href="#"><i class="ri-heart-line"></i></a></li>
                            <li><a href="#"><i class="ri-shuffle-line"></i></a></li>
                        </ul>
                    </div>
                    ${product.is_promotion ? `<div class="discount circle flexcenter"><span>${product.discount_percentage}%</span></div>` : ''}
                </div>
                <div class="content">
                    <div class="rating">
                        <div class="stars">
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                            <i class="ri-star-fill" style="color:orange"></i>
                        </div>
                        <span class="mini-text">(2,548)</span>
                    </div>
                    <h3><a href="/page-single/${product.id}">${product.product_name}</a></h3>
                    <div class="price">
                        <span class="current">${product.is_promotion ? product.formatted_promotion_price : product.formatted_price}${product.price_symbol}</span>
                        ${product.is_promotion ? `<span class="normal mini-text">${product.formatted_price}${product.price_symbol}</span>` : ''}
                    </div>
                    <div class="mini-text">
                        <p>By: ${product.company_name}</p>
                    </div>
                    <div class="footer">
                        <ul class="mini-text">
                            <li>Min. Order: ${product.min_order} un</li>
                            <li>Ready to Ship</li>
                        </ul>
                    </div>
                </div>  
            `;
            const productDiv = document.createElement('div');
            productDiv.classList.add('item');
            productDiv.innerHTML = productHTML;
            productsContainer.appendChild(productDiv);
        });
    }
});













