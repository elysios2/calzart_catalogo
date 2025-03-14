document.addEventListener('DOMContentLoaded', async () => {
  // Mobile menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Load featured product banner
  await loadFeaturedProductBanner();

  // Load featured products
  await loadFeaturedProducts();

  // Add fade-in class to elements on page load
  const elements = document.querySelectorAll('.hero, .featured-products, .blog-preview, .contact-us');
  elements.forEach(element => {
    element.classList.add('fade-in');
  });

  setupHeroBackgroundImages();
});

async function loadFeaturedProducts() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    let products = data.products;

    // Filtrar productos destacados
    const featuredProducts = products.filter(product => product.featured);

    const container = document.getElementById('featured-products-container');
    container.innerHTML = ''; // Limpiar contenido existente

    if (featuredProducts && featuredProducts.length > 0) {
      featuredProducts.forEach(product => {
        const productElement = createProductCard(product);
        container.appendChild(productElement);
      });
    } else {
      container.innerHTML = '<p>No se encontraron productos destacados.</p>';
    }
  } catch (err) {
    console.error("Unexpected error fetching products:", err);
    toast("Error inesperado al cargar los productos", "error");
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
  buttonContainer.className = 'mt-auto'; 

  const whatsappButton = document.createElement('button');
  whatsappButton.className = 'w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300';
  whatsappButton.innerHTML = '<i class="fab fa-whatsapp mr-2"></i>Contactar';
  whatsappButton.addEventListener('click', () => {
    openContactModal(product);
  });

  buttonContainer.appendChild(whatsappButton);

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
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    backgroundColor: type === "success" ? "green" : "red",
    stopOnFocus: true, // Prevents dismissing of toast on hover
  }).showToast();
}

// Contact Modal functions
export function openContactModal(product) {
  const modal = document.createElement('div');
  modal.className = 'fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center';
  modal.id = 'contact-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white rounded-lg shadow-md p-8 max-w-md w-full';

  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-2 right-2 text-gray-600 hover:text-gray-800';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', closeContactModal);
  modalContent.appendChild(closeButton);


  const title = document.createElement('h2');
  title.className = 'text-2xl font-semibold text-gray-800 mb-4';
  title.textContent = `Interés en ${product.name}`;
  modalContent.appendChild(title);

  const form = document.createElement('form');
  form.id = 'contact-form';

  // Name input
  const nameLabel = document.createElement('label');
  nameLabel.className = 'block text-gray-700 text-sm font-bold mb-2';
  nameLabel.textContent = 'Nombre:';
  const nameInput = document.createElement('input');
  nameInput.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4';
  nameInput.type = 'text';
  nameInput.placeholder = 'Tu nombre';
  nameInput.id = 'contact-name';
  nameLabel.appendChild(nameInput);
  form.appendChild(nameLabel);

  // Email input
  const emailLabel = document.createElement('label');
  emailLabel.className = 'block text-gray-700 text-sm font-bold mb-2';
  emailLabel.textContent = 'Email:';
  const emailInput = document.createElement('input');
  emailInput.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4';
  emailInput.type = 'email';
  emailInput.placeholder = 'Tu email';
  emailInput.id = 'contact-email';
  emailLabel.appendChild(emailInput);
  form.appendChild(emailLabel);

  // Message input
  const messageLabel = document.createElement('label');
  messageLabel.className = 'block text-gray-700 text-sm font-bold mb-2';
  messageLabel.textContent = 'Mensaje:';
  const messageInput = document.createElement('textarea');
  messageInput.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4';
  messageInput.placeholder = 'Tu mensaje';
  messageInput.id = 'contact-message';
  messageLabel.appendChild(messageInput);
  form.appendChild(messageLabel);
  

  // Payment option selection
  const paymentLabel = document.createElement('label');
  paymentLabel.className = 'block text-gray-700 text-sm font-bold mb-2';
  paymentLabel.textContent = 'Opción de Pago:';

  const paymentSelect = document.createElement('select');
  paymentSelect.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4';
  paymentSelect.id = 'payment-option';

  const whatsappOption = document.createElement('option');
  whatsappOption.value = 'whatsapp';
  whatsappOption.textContent = 'Whatsapp';
  paymentSelect.appendChild(whatsappOption);

  const qrCodeOption = document.createElement('option');
  qrCodeOption.value = 'qr_code';
  qrCodeOption.textContent = 'Código QR';
  paymentSelect.appendChild(qrCodeOption);

  paymentLabel.appendChild(paymentSelect);
  form.appendChild(paymentLabel);

  const submitButton = document.createElement('button');
  submitButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline';
  submitButton.type = 'button';
  submitButton.textContent = 'Enviar Mensaje';
  submitButton.addEventListener('click', () => {
    submitContactForm(product);
  });
  form.appendChild(submitButton);

  // Add form to modal content
  modalContent.appendChild(form);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

function closeContactModal() {
  const modal = document.getElementById('contact-modal');
  if (modal) {
    modal.remove();
  }
}

function submitContactForm(product) {
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const message = document.getElementById('contact-message').value;
  const paymentOption = document.getElementById('payment-option').value;

  // Basic form validation
  if (!name || !email || !message) {
    toast("Por favor, completa todos los campos", "error");
    return;
  }
  
  // If QR code option is selected, show the QR code modal
  if (paymentOption === 'qr_code') {
    openQRCodeModal(product, name, email, message);
  } else if (paymentOption === 'whatsapp') {
    closeContactModal();
    // Improved WhatsApp message formatting
    const whatsappMessage = `👋 *¡Hola! Estoy interesado/a en adquirir el siguiente producto:*📦

*Producto:* ${product.name}

*Datos de Contacto:*
- Nombre: ${name}
- Email: ${email}

*Mensaje:*
${message}

---------------------
Quedo atento/a a su respuesta para concretar la compra. ¡Gracias! 🙌`;

    const whatsappLink = `https://wa.me/59174579158?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappLink, '_blank');
  }
}

function openQRCodeModal(product, name, email, message) {
  // Close the original contact modal
  closeContactModal();

  // Create a new modal specifically for QR code
  const modal = document.createElement('div');
  modal.className = 'fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center z-50';
  modal.id = 'qr-code-modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center relative';

  // Close button
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  modalContent.appendChild(closeButton);

  // Title
  const title = document.createElement('h2');
  title.className = 'text-2xl font-bold text-gray-800 mb-4';
  title.textContent = `Código QR de Pago para ${product.name}`;
  modalContent.appendChild(title);

  // QR Code Image
  const qrCodeImg = document.createElement('img');
  qrCodeImg.src = ""; //CODIGO QR AQUI PARA PAGOS 
  qrCodeImg.alt = 'Código QR de Pago';
  qrCodeImg.className = 'w-64 h-64 mx-auto mb-4 border-4 border-gray-200 rounded-lg';
  modalContent.appendChild(qrCodeImg);

  // Payment Instructions
  const instructions = document.createElement('p');
  instructions.className = 'text-gray-700 mb-4';
  instructions.innerHTML = `
    Por favor, escanea este código QR para realizar el pago. No olvides Guardar tu Comprobante como respaldo de la transaccion.<br>
    <strong>Detalles del Producto:</strong> ${product.name}<br>
    <strong>Nombre:</strong> ${name}<br>
    <strong>Email:</strong> ${email}
  `;
  modalContent.appendChild(instructions);

  // Crear el botón de WhatsApp - NOW CENTERED
  const whatsappButton = document.createElement('button');
  whatsappButton.className = 'mx-auto bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300 flex items-center gap-2';
  whatsappButton.innerHTML = '<i class="fab fa-whatsapp"></i> Contactanos por whatsapp';

  // Evento para abrir WhatsApp con el mensaje formateado
  whatsappButton.addEventListener('click', () => {
    const whatsappMessage = `👋 *¡Hola! Estoy interesado/a en adquirir el siguiente producto:*  

📦 *Producto:* ${product.name}  

📇 *Datos de contacto:*  
- 👤 *Nombre:* ${name}  
- 📧 *Email:* ${email}  

📝 *Mensaje adicional:*  
${message}

-------------------------------  
💳 *Instrucciones de Pago:*  
Por favor, escanea el código QR para realizar el pago y no olvides guardar tu comprobante. ✅  

Quedo atento/a a su respuesta para concretar la compra. ¡Gracias! 🙌`;

    // Generar y abrir el enlace de WhatsApp
    const whatsappLink = `https://wa.me/59174579158?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappLink, '_blank');
  });

  // Container to center the button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex justify-center mt-4';
  buttonContainer.appendChild(whatsappButton);

  // Agregar el contenedor del botón al contenido del modal
  modalContent.appendChild(buttonContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

async function loadFeaturedProductBanner() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const products = data.products;

    // Select a featured product (for example, the first product)
    const featuredProduct = products[4];

    const bannerContainer = document.getElementById('featured-product-banner');
    bannerContainer.innerHTML = `
      <div class="relative w-screen left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] min-h-[400px] md:h-[500px] overflow-hidden">
        <div class="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
          <div class="hidden md:block">
            <img 
              src="${featuredProduct.image_url}" 
              alt="${featuredProduct.name}" 
              class="absolute inset-0 w-full h-full object-cover"
            >
            <div class="absolute inset-0 bg-black opacity-40"></div>
          </div>
          <div class="relative z-10 flex items-center justify-center bg-transparent md:bg-transparent">
            <div class="text-white max-w-xl p-8 text-center md:text-left">
              <h2 class="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">${featuredProduct.name}</h2>
              <p class="text-base md:text-lg mb-6 drop-shadow-md">${featuredProduct.description}</p>
              <div class="flex justify-center md:justify-start space-x-4">
                <button 
                  onclick="window.openContactModal(${JSON.stringify(featuredProduct).replace(/"/g, '&quot;')})" 
                  class="bg-green-500 text-white py-2 px-4 md:py-3 md:px-6 rounded-md hover:bg-green-600 transition duration-300 flex items-center drop-shadow-lg"
                >
                  <i class="fab fa-whatsapp mr-2"></i>Consultar
                </button>
                <a 
                  href="catalogo.html" 
                  class="bg-blue-500 text-white py-2 px-4 md:py-3 md:px-6 rounded-md hover:bg-blue-700 transition duration-300 drop-shadow-lg"
                >
                  Ver en Catálogo
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="md:hidden absolute inset-0">
          <img 
            src="${featuredProduct.image_url}" 
            alt="${featuredProduct.name}" 
            class="w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-black opacity-50"></div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error loading featured product banner:", err);
  }
}

function setupHeroBackgroundImages() {
  const backgroundImages = [
    
  ];
  const heroBackgroundElement = document.getElementById('hero-background-image');
  let currentImageIndex = 0;

  function changeBackgroundImage() {
    heroBackgroundElement.style.opacity = 0;
    
    setTimeout(() => {
      heroBackgroundElement.style.backgroundImage = `url(${backgroundImages[currentImageIndex]})`;
      heroBackgroundElement.style.backgroundSize = 'cover';
      heroBackgroundElement.style.backgroundPosition = 'center';
      
      setTimeout(() => {
        heroBackgroundElement.style.opacity = 0.5;
      }, 50);
      
      currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    }, 1000);
  }

  // Initial image
  heroBackgroundElement.style.backgroundImage = `url(${backgroundImages[0]})`;
  heroBackgroundElement.style.backgroundSize = 'cover';
  heroBackgroundElement.style.backgroundPosition = 'center';

  // Change image every 10 seconds
  setInterval(changeBackgroundImage, 10000);
}