document.addEventListener('DOMContentLoaded', async () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    await loadProducts();
    setupCityAndCategoryFilters();
});

let allProducts = [];

async function loadProducts() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        allProducts = data.products;

        renderProducts(allProducts);
        populateFilters(data);
    } catch (err) {
        console.error("Unexpected error fetching products:", err);
        toast("Error inesperado al cargar los productos", "error");
    }
}

function populateFilters(data) {
    const citySelect = document.getElementById('city-filter');
    const categorySelect = document.getElementById('category-filter');

    // Populate city filter
    data.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    // Populate category filter
    data.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function setupCityAndCategoryFilters() {
    const cityFilter = document.getElementById('city-filter');
    const categoryFilter = document.getElementById('category-filter');
    const filterButton = document.getElementById('filter-button');

    filterButton.addEventListener('click', () => {
        const selectedCity = cityFilter.value;
        const selectedCategory = categoryFilter.value;

        const filteredProducts = allProducts.filter(product => 
            (selectedCity === '' || product.city === selectedCity) &&
            (selectedCategory === '' || product.category === selectedCategory)
        );

        renderProducts(filteredProducts);
    });
}

function renderProducts(products) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = ''; 

    if (products && products.length > 0) {
        products.forEach(product => {
            const productElement = createProductCard(product);
            container.appendChild(productElement);
        });
    } else {
        container.innerHTML = '<p class="text-center col-span-full">No se encontraron productos que coincidan con los filtros.</p>';
    }
}

function createProductCard(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'bg-white rounded-lg shadow-md p-4 flex flex-col'; 

    const imgContainer = document.createElement('div');
    imgContainer.className = 'mb-4 flex-grow-0';

    const img = document.createElement('img');
    img.src = product.image_url || 'https://placehold.co/400x300'; 
    img.alt = product.name;
    img.className = 'w-full h-48 object-cover rounded-md';
    imgContainer.appendChild(img);

    const contentContainer = document.createElement('div');
    contentContainer.className = 'flex flex-col flex-grow';

    const title = document.createElement('h3');
    title.className = 'text-xl font-semibold text-gray-800 mb-2';
    title.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'text-gray-700 mb-4 flex-grow';
    description.textContent = product.description ? product.description.substring(0, 100) + '...' : 'Descripción no disponible';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'mt-auto flex space-x-2'; 

    const whatsappButton = document.createElement('button');
    whatsappButton.className = 'flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center';
    whatsappButton.innerHTML = '<i class="fab fa-whatsapp mr-2"></i>Contactar';
    whatsappButton.addEventListener('click', () => {
        openContactModal(product);
    });
    setInterval(() => {
      whatsappButton.classList.add('animate-pulse');
      setTimeout(() => {
        whatsappButton.classList.remove('animate-pulse');
      }, 1500); 
    });

    const detailsButton = document.createElement('button');
    detailsButton.className = 'flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300';
    detailsButton.textContent = 'Detalles';
    detailsButton.addEventListener('click', () => {
        openProductDetailsModal(product);
    });

    buttonContainer.appendChild(whatsappButton);
    buttonContainer.appendChild(detailsButton);
    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(buttonContainer);
    productDiv.appendChild(imgContainer);
    productDiv.appendChild(contentContainer);

    return productDiv;
}

function toast(message, type = "success") {
    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top", 
        position: "right", 
        backgroundColor: type === "success" ? "green" : "red",
        stopOnFocus: true, 
    }).showToast();
}

function openProductDetailsModal(product) {
    const modal = document.createElement('div');
    modal.className = 'fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 p-4';
    modal.id = 'product-details-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto';

    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-gray-600 hover:text-gray-800';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', closeProductDetailsModal);
    modalContent.appendChild(closeButton);

    const title = document.createElement('h2');
    title.className = 'text-2xl font-semibold text-gray-800 mb-4';
    title.textContent = product.name;
    modalContent.appendChild(title);

    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'carousel relative w-full overflow-hidden mb-4';

    const carouselInner = document.createElement('div');
    carouselInner.className = 'carousel-inner relative flex transition-transform duration-500 ease-out';
    carouselInner.id = 'carousel-inner-' + product.id;

    product.image_urls.forEach((imageUrl, index) => {
        const carouselItem = document.createElement('div');
        carouselItem.className = 'carousel-item relative w-full';
        carouselItem.style.flexShrink = '0';

        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `${product.name} ${index + 1}`;
        img.className = 'w-full h-48 md:h-64 object-cover rounded-md';

        carouselItem.appendChild(img);
        carouselInner.appendChild(carouselItem);
    });

    carouselContainer.appendChild(carouselInner);

    const prevButton = document.createElement('button');
    prevButton.className = 'carousel-control-prev absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded-full text-sm';
    prevButton.innerHTML = '<';
    prevButton.addEventListener('click', () => changeSlide(product.id, -1));
    carouselContainer.appendChild(prevButton);

    const nextButton = document.createElement('button');
    nextButton.className = 'carousel-control-next absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-3 rounded-full text-sm';
    nextButton.innerHTML = '>';
    nextButton.addEventListener('click', () => changeSlide(product.id, 1));
    carouselContainer.appendChild(nextButton);

    modalContent.appendChild(carouselContainer);

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';

    const descriptionDiv = document.createElement('div');
    descriptionDiv.className = 'mb-4';
    const descriptionTitle = document.createElement('h4');
    descriptionTitle.className = 'text-lg font-semibold text-gray-700 mb-2';
    descriptionTitle.textContent = 'Descripción';
    const description = document.createElement('p');
    description.className = 'text-gray-700 text-sm';
    description.textContent = product.description;
    descriptionDiv.appendChild(descriptionTitle);
    descriptionDiv.appendChild(description);
    detailsContainer.appendChild(descriptionDiv);

    const additionalInfoDiv = document.createElement('div');
    additionalInfoDiv.className = 'mb-4';
    const additionalInfoTitle = document.createElement('h4');
    additionalInfoTitle.className = 'text-lg font-semibold text-gray-700 mb-2';
    additionalInfoTitle.textContent = 'Detalles Adicionales';
    additionalInfoDiv.appendChild(additionalInfoTitle);

    const details = [
        { label: 'Materiales', value: product.material },
        { label: 'Colores Disponibles', value: product.colors.join(', ') },
        { label: 'Tallas Disponibles', value: product.sizes.join(', ') }
    ];

    details.forEach(detail => {
        const detailElement = document.createElement('p');
        detailElement.className = 'text-gray-700 text-sm';
        detailElement.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
        additionalInfoDiv.appendChild(detailElement);
    });

    const techDetailsTitle = document.createElement('h5');
    techDetailsTitle.className = 'text-base font-semibold text-gray-700 mt-4 mb-2';
    techDetailsTitle.textContent = 'Especificaciones Técnicas';
    additionalInfoDiv.appendChild(techDetailsTitle);

    const additionalDetails = product.additional_details;
    const techDetails = [
        { label: 'Material de Suela', value: additionalDetails.sole_material },
        { label: 'Tipo de Cierre', value: additionalDetails.closure_type },
        { label: 'Altura del Tacón', value: additionalDetails.heel_height },
        { label: 'Origen', value: additionalDetails.origin }
    ];

    techDetails.forEach(detail => {
        const detailElement = document.createElement('p');
        detailElement.className = 'text-gray-700 text-sm';
        detailElement.innerHTML = `<strong>${detail.label}:</strong> ${detail.value}`;
        additionalInfoDiv.appendChild(detailElement);
    });

    detailsContainer.appendChild(additionalInfoDiv);

    modalContent.appendChild(detailsContainer);

    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

function closeProductDetailsModal() {
    const modal = document.getElementById('product-details-modal');
    if (modal) {
        modal.remove();
    }
}

function changeSlide(productId, direction) {
    const carouselInner = document.getElementById(`carousel-inner-${productId}`);
    const carouselItems = carouselInner.getElementsByClassName('carousel-item');
    const numItems = carouselItems.length;
    let currentPosition = parseInt(carouselInner.style.transform.replace('translateX(', '').replace('px)', '') || 0);
    const itemWidth = carouselItems[0].offsetWidth;

    currentPosition += direction * itemWidth;

    if (currentPosition > 0) {
        currentPosition = -itemWidth * (numItems - 1);
    } else if (currentPosition < -itemWidth * (numItems - 1)) {
        currentPosition = 0;
    }

    carouselInner.style.transform = `translateX(${currentPosition}px)`;
}