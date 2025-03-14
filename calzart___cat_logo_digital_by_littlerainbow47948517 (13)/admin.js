document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const adminContent = document.getElementById('admin-content');
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const featuredProductSelect = document.getElementById('featured-product-select');
  const updateFeaturedButton = document.getElementById('update-featured-button');

  // Enhanced security: use session storage and add login attempt tracking
  const MAX_LOGIN_ATTEMPTS = 3;
  const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes of inactivity

  function checkLoginLockout() {
    const loginAttempts = parseInt(sessionStorage.getItem('loginAttempts') || '0');
    const lastAttemptTime = parseInt(sessionStorage.getItem('lastLoginAttemptTime') || '0');

    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Check if lockout period has passed
      if (Date.now() - lastAttemptTime < LOCKOUT_TIME) {
        const remainingTime = Math.ceil((LOCKOUT_TIME - (Date.now() - lastAttemptTime)) / 60000);
        alert(`Demasiados intentos fallidos. Por favor, intente nuevamente en ${remainingTime} minutos.`);
        return false;
      } else {
        // Reset login attempts if lockout period has passed
        sessionStorage.removeItem('loginAttempts');
        sessionStorage.removeItem('lastLoginAttemptTime');
      }
    }
    return true;
  }

  function incrementLoginAttempts() {
    const loginAttempts = (parseInt(sessionStorage.getItem('loginAttempts') || '0') + 1);
    sessionStorage.setItem('loginAttempts', loginAttempts.toString());
    sessionStorage.setItem('lastLoginAttemptTime', Date.now().toString());
  }

  // Logout functionality
  function performLogout() {
    // Clear login-related session storage
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('loginTimestamp');
    sessionStorage.removeItem('loginAttempts');
    sessionStorage.removeItem('lastLoginAttemptTime');

    // Hide admin content and show login form
    loginForm.classList.remove('hidden');
    adminContent.classList.add('hidden');
    logoutButton.classList.add('hidden');

    // Reset form
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    // Optional: Add a logout success message
    alert('Sesión cerrada exitosamente.');
  }

  // Add logout button event listener
  logoutButton.addEventListener('click', performLogout);

  // More secure session management
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const loginTimestamp = sessionStorage.getItem('loginTimestamp');

  if (isLoggedIn) {
    // Check for inactivity
    if (loginTimestamp && (Date.now() - parseInt(loginTimestamp) > INACTIVITY_TIMEOUT)) {
      // Logout if inactive for too long
      performLogout();
    } else {
      loginForm.classList.add('hidden');
      adminContent.classList.remove('hidden');
      logoutButton.classList.remove('hidden');
      await loadProducts();
      await populateFeaturedProductSelect();
    }
  } else {
    loginForm.classList.remove('hidden');
    adminContent.classList.add('hidden');
    logoutButton.classList.add('hidden');
  }

  // Login button event listener (rest of the existing login code remains the same)
  loginButton.addEventListener('click', async () => {
    // Check for login lockout
    if (!checkLoginLockout()) {
      return;
    }

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const password = passwordInput.value;

    // Updated credentials as requested
    if (username === 'calzart2025' && password === 'calzartadmin') {
      // Reset login attempts on successful login
      sessionStorage.removeItem('loginAttempts');
      sessionStorage.removeItem('lastLoginAttemptTime');
      
      // More secure session management
      sessionStorage.setItem('isLoggedIn', 'true');
      
      // Add timestamp to session
      sessionStorage.setItem('loginTimestamp', Date.now().toString());
      
      loginForm.classList.add('hidden');
      adminContent.classList.remove('hidden');
      logoutButton.classList.remove('hidden');
      await loadProducts();
      await populateFeaturedProductSelect();
    } else {
      incrementLoginAttempts();
      alert('Credenciales incorrectas.');
    }
  });

  const addProductForm = document.getElementById('add-product-form');

  const imageFileInput = document.getElementById('product-image-file');
  const imagePreview = document.getElementById('image-preview');

  imageFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  addProductForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await addProduct();
  });

  updateFeaturedButton.addEventListener('click', async () => {
    const selectedProductId = featuredProductSelect.value;
    if (selectedProductId) {
      await updateFeaturedProduct(selectedProductId);
    } else {
      alert('Por favor, selecciona un producto destacado.');
    }
  });

  // Add event listener for banner image file input
  const bannerImageFileInput = document.getElementById('banner-image-file');
  const bannerImagePreview = document.getElementById('banner-image-preview');

  bannerImageFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        bannerImagePreview.src = e.target.result;
        bannerImagePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // Add event listener for banner configuration form
  const bannerConfigForm = document.getElementById('banner-configuration-form');
  bannerConfigForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await updateBannerConfiguration();
  });

  // Populate banner product select
  await populateBannerProductSelect();
});

async function loadProducts() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const products = data.products;

    const container = document.getElementById('product-container');
    container.innerHTML = '';

    if (products && products.length > 0) {
      products.forEach(product => {
        const productElement = createProductCard(product);
        container.appendChild(productElement);
      });
    } else {
      container.innerHTML = '<p>No se encontraron productos.</p>';
    }
  } catch (err) {
    console.error("Unexpected error fetching products:", err);
    const container = document.getElementById('product-container');
    container.innerHTML = '<p>Error al cargar los productos.</p>';
  }
}

async function populateFeaturedProductSelect() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const products = data.products;

    const selectElement = document.getElementById('featured-product-select');
    selectElement.innerHTML = '<option value="">Seleccionar Producto</option>';

    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      selectElement.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar los productos para el select:", err);
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

  const featuredCheckbox = document.createElement('input');
  featuredCheckbox.type = 'checkbox';
  featuredCheckbox.id = `featured-${product.id}`;
  featuredCheckbox.checked = product.featured || false;
  featuredCheckbox.className = 'mr-2 leading-tight';
  featuredCheckbox.addEventListener('change', () => {
    updateFeaturedStatus(product.id, featuredCheckbox.checked);
  });

  const featuredLabel = document.createElement('label');
  featuredLabel.htmlFor = `featured-${product.id}`;
  featuredLabel.className = 'text-sm text-gray-700';
  featuredLabel.textContent = 'Destacado';

  const editButton = document.createElement('button');
  editButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mr-2';
  editButton.textContent = 'Editar';
  editButton.addEventListener('click', () => {
    openEditProductModal(product);
  });

  const deleteButton = document.createElement('button');
  deleteButton.className = 'bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4';
  deleteButton.textContent = 'Eliminar';
  deleteButton.addEventListener('click', () => {
    deleteProduct(product.id);
  });

  const featuredDiv = document.createElement('div');
  featuredDiv.className = 'flex items-center mb-4';
  featuredDiv.appendChild(featuredCheckbox);
  featuredDiv.appendChild(featuredLabel);

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'flex';
  buttonContainer.appendChild(editButton);
  buttonContainer.appendChild(deleteButton);
  contentContainer.appendChild(title);
  contentContainer.appendChild(description);
  contentContainer.appendChild(featuredDiv);
  contentContainer.appendChild(buttonContainer);
  productDiv.appendChild(imgContainer);
  productDiv.appendChild(contentContainer);

  return productDiv;
}

async function updateFeaturedStatus(productId, isFeatured) {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const products = data.products;

    const productIndex = products.findIndex(product => product.id === productId);
    if (productIndex !== -1) {
      products[productIndex].featured = isFeatured;

      const updateResponse = await fetch('productos.json', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data) // Send the entire data object
      });

      if (updateResponse.ok) {
        console.log(`Product with ID ${productId} featured status updated to: ${isFeatured}.`);
        await loadProducts(); // Reload products to reflect the change
      } else {
        console.error('Error updating productos.json:', updateResponse.status);
        alert('Error updating featured status.');
      }
    } else {
      console.error(`Product with ID ${productId} not found.`);
      alert('Product not found.');
    }
  } catch (err) {
    console.error("Error updating featured status:", err);
    alert('Error updating featured status.');
  }
}

async function deleteProduct(productId) {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    let products = data.products;

    // Filter out the product to delete
    products = products.filter(product => product.id !== productId);

    // Update the products array in the data object
    data.products = products;

    const updateResponse = await fetch('productos.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) // Send the entire data object
    });

    if (updateResponse.ok) {
      console.log(`Producto con ID ${productId} eliminado.`);
      await loadProducts(); // Reload products to reflect the change
    } else {
      console.error('Error al actualizar productos.json:', updateResponse.status);
      alert('Error al eliminar el producto.');
    }
  } catch (err) {
    console.error("Error al eliminar el producto:", err);
    alert('Error al eliminar el producto.');
  }
}

async function addProduct() {
  const name = document.getElementById('product-name').value;
  const description = document.getElementById('product-description').value;
  const city = document.getElementById('product-city').value;
  const category = document.getElementById('product-category').value;
  const imageFile = document.getElementById('product-image-file').files[0];
  const price = document.getElementById('product-price').value;
  const material = document.getElementById('product-material').value;
  const colors = document.getElementById('product-colors').value.split(',').map(color => color.trim());
  const sizes = document.getElementById('product-sizes').value.split(',').map(size => size.trim());
  const careInstructions = document.getElementById('product-care-instructions').value;
  const soleMaterial = document.getElementById('product-sole-material').value;
  const closureType = document.getElementById('product-closure-type').value;
  const heelHeight = document.getElementById('product-heel-height').value;
  const origin = document.getElementById('product-origin').value;

  if (!name || !description || !city || !category || !imageFile || !price || !material || colors.length === 0 || sizes.length === 0 || !careInstructions || !soleMaterial || !closureType || !heelHeight || !origin) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  // Generate a unique filename
  const filename = `product_${Date.now()}_${imageFile.name}`;

  try {
    // Here you would typically upload the file to a server
    // For this example, we'll use the filename as a placeholder
    const newProduct = {
      id: Date.now(), 
      featured: false,
      name: name,
      description: description,
      city: city,
      category: category,
      image_url: filename, // Use the generated filename
      image_urls: [filename], 
      price: price,
      material: material,
      colors: colors,
      sizes: sizes,
      care_instructions: careInstructions,
      additional_details: {
        sole_material: soleMaterial,
        closure_type: closureType,
        heel_height: heelHeight,
        origin: origin
      },
      payment_qr_code_url: ''
    };

    const response = await fetch('productos.json');
    const data = await response.json();
    const products = data.products;

    products.push(newProduct);
    data.products = products;

    const updateResponse = await fetch('productos.json', {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (updateResponse.ok) {
      console.log('Nuevo producto agregado:', newProduct);
      await loadProducts();
      document.getElementById('add-product-form').reset();
      imagePreview.src = '#';
      imagePreview.classList.add('hidden');
      alert('Producto agregado exitosamente.');
    } else {
      console.error('Error al actualizar productos.json:', updateResponse.status);
      alert('Error al agregar el producto.');
    }
  } catch (err) {
    console.error("Error al agregar el producto:", err);
    alert('Error al agregar el producto.');
  }
}

async function updateFeaturedProduct(productId) {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
      
    // Find the product with the given ID
    const productIndex = data.products.findIndex(product => product.id === parseInt(productId));
        
    if (productIndex === -1) {
        console.error(`Product with ID ${productId} not found.`);
        alert('Product not found.');
        return;
    }

    const updateResponse = await fetch('productos.json', {
      method: 'PUT', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (updateResponse.ok) {
      console.log(`Producto destacado actualizado a ID: ${productId}`);
      alert('Producto destacado actualizado exitosamente.');
      // updateFeaturedProductBanner(productId);
    } else {
      console.error('Error al actualizar productos.json:', updateResponse.status);
      alert('Error al actualizar el producto destacado.');
    }
  } catch (err) {
    console.error("Error al actualizar el producto destacado:", err);
    alert('Error al actualizar el producto destacado.');
  }
}

// Function to open the edit product modal
async function openEditProductModal(product) {
    const modal = document.createElement('div');
    modal.className = 'fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 p-4';
    modal.id = 'edit-product-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative max-h-[90vh] overflow-y-auto';

    const closeButton = document.createElement('button');
    closeButton.className = 'absolute top-4 right-4 text-gray-600 hover:text-gray-800';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', closeEditProductModal);
    modalContent.appendChild(closeButton);

    const title = document.createElement('h2');
    title.className = 'text-2xl font-semibold text-gray-800 mb-4';
    title.textContent = `Editar Producto: ${product.name}`;
    modalContent.appendChild(title);

    const editForm = document.createElement('form');
    editForm.id = 'edit-product-form';

    // Image URL
    const imageUrlDiv = createInputField('product-image-url-edit', 'URL de la Imagen', 'url', product.image_url);
    editForm.appendChild(imageUrlDiv);

    // Name
    const nameDiv = createInputField('product-name-edit', 'Nombre', 'text', product.name);
    editForm.appendChild(nameDiv);

    // Description
    const descriptionDiv = createInputField('product-description-edit', 'Descripción', 'textarea', product.description);
    editForm.appendChild(descriptionDiv);

    // City
    const cityDiv = createInputField('product-city-edit', 'Ciudad', 'text', product.city);
    editForm.appendChild(cityDiv);

    // Category
    const categoryDiv = createInputField('product-category-edit', 'Categoría', 'text', product.category);
    editForm.appendChild(categoryDiv);

    // Price
    const priceDiv = createInputField('product-price-edit', 'Precio', 'number', product.price);
    editForm.appendChild(priceDiv);

    // Material
    const materialDiv = createInputField('product-material-edit', 'Material', 'text', product.material);
    editForm.appendChild(materialDiv);

    // Colors (comma-separated)
    const colorsDiv = createInputField('product-colors-edit', 'Colores (separados por coma)', 'text', product.colors.join(', '));
    editForm.appendChild(colorsDiv);

    // Sizes (comma-separated)
    const sizesDiv = createInputField('product-sizes-edit', 'Tallas (separadas por coma)', 'text', product.sizes.join(', '));
    editForm.appendChild(sizesDiv);

    const careInstructionsDiv = createInputField('product-care-instructions-edit', 'Instrucciones de Cuidado', 'text', product.care_instructions);
    editForm.appendChild(careInstructionsDiv);

    // Sole Material
    const soleMaterialDiv = createInputField('product-sole-material-edit', 'Material de la Suela', 'text', product.additional_details.sole_material);
    editForm.appendChild(soleMaterialDiv);

    // Closure Type
    const closureTypeDiv = createInputField('product-closure-type-edit', 'Tipo de Cierre', 'text', product.additional_details.closure_type);
    editForm.appendChild(closureTypeDiv);

    // Heel Height
    const heelHeightDiv = createInputField('product-heel-height-edit', 'Altura del Tacón', 'text', product.additional_details.heel_height);
    editForm.appendChild(heelHeightDiv);

    // Origin
    const originDiv = createInputField('product-origin-edit', 'Origen', 'text', product.additional_details.origin);
    editForm.appendChild(originDiv);

    const saveButton = document.createElement('button');
    saveButton.className = 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline';
    saveButton.textContent = 'Guardar Cambios';
    saveButton.addEventListener('click', async () => {
        await saveEditedProduct(product.id);
    });
    editForm.appendChild(saveButton);

    modalContent.appendChild(editForm);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Function to close the edit product modal
function closeEditProductModal() {
    const modal = document.getElementById('edit-product-modal');
    if (modal) {
        modal.remove();
    }
}

// Helper function to create input fields
function createInputField(id, labelText, type, value) {
    const div = document.createElement('div');
    div.className = 'mb-4';

    const label = document.createElement('label');
    label.className = 'block text-gray-700 text-sm font-bold mb-2';
    label.htmlFor = id;
    label.textContent = labelText;
    div.appendChild(label);

    let input;
    if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = 4;
    } else {
        input = document.createElement('input');
        input.type = type;
    }

    input.id = id;
    input.className = 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline';
    input.placeholder = labelText;
    input.value = value;
    div.appendChild(input);

    return div;
}

async function saveEditedProduct(productId) {
    const name = document.getElementById('product-name-edit').value;
    const description = document.getElementById('product-description-edit').value;
    const city = document.getElementById('product-city-edit').value;
    const category = document.getElementById('product-category-edit').value;
    const imageUrl = document.getElementById('product-image-url-edit').value;
    const price = document.getElementById('product-price-edit').value;
    const material = document.getElementById('product-material-edit').value;
    const colors = document.getElementById('product-colors-edit').value.split(',').map(color => color.trim());
    const sizes = document.getElementById('product-sizes-edit').value.split(',').map(size => size.trim());
    const careInstructions = document.getElementById('product-care-instructions-edit').value;
    const soleMaterial = document.getElementById('product-sole-material-edit').value;
    const closureType = document.getElementById('product-closure-type-edit').value;
    const heelHeight = document.getElementById('product-heel-height-edit').value;
    const origin = document.getElementById('product-origin-edit').value;

    if (!name || !description || !city || !category || !imageUrl || !price || !material || colors.length === 0 || sizes.length === 0) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        const products = data.products;

        const productIndex = products.findIndex(product => product.id === productId);
        if (productIndex !== -1) {
            // Update the product with the new values
            products[productIndex] = {
                ...products[productIndex],
                name: name,
                description: description,
                city: city,
                category: category,
                image_url: imageUrl,
                price: price,
                material: material,
                colors: colors,
                sizes: sizes,
                care_instructions: careInstructions,
                additional_details: {
                    sole_material: soleMaterial,
                    closure_type: closureType,
                    heel_height: heelHeight,
                    origin: origin
                }
            };

            const updateResponse = await fetch('productos.json', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // Send the entire data object
            });

            if (updateResponse.ok) {
                console.log(`Product with ID ${productId} updated successfully.`);
                closeEditProductModal();
                await loadProducts(); // Reload products to reflect the changes
                alert('Product updated successfully.');
            } else {
                console.error('Error updating productos.json:', updateResponse.status);
                alert('Error updating product.');
            }
        } else {
            console.error(`Product with ID ${productId} not found.`);
            alert('Product not found.');
        }
    } catch (err) {
        console.error("Error saving edited product:", err);
        alert('Error saving edited product.');
    }
}

async function populateBannerProductSelect() {
  try {
    const response = await fetch('productos.json');
    const data = await response.json();
    const products = data.products;

    const selectElement = document.getElementById('banner-product-select');
    selectElement.innerHTML = '<option value="">Seleccionar Producto</option>';

    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.id;
      option.textContent = product.name;
      selectElement.appendChild(option);
    });
  } catch (err) {
    console.error("Error al cargar los productos para el banner:", err);
  }
}

async function updateBannerConfiguration() {
  const bannerImageFile = document.getElementById('banner-image-file').files[0];
  const bannerTitle = document.getElementById('banner-title').value;
  const bannerDescription = document.getElementById('banner-description').value;
  const selectedProductId = document.getElementById('banner-product-select').value;

  if (!bannerImageFile || !bannerTitle || !bannerDescription || !selectedProductId) {
    alert('Por favor, complete todos los campos.');
    return;
  }

  try {
    // For now, we'll just update the JSON file
    const response = await fetch('productos.json');
    const data = await response.json();

    // Find the selected product
    const selectedProduct = data.products.find(p => p.id === parseInt(selectedProductId));

    if (!selectedProduct) {
      alert('Producto no encontrado.');
      return;
    }

    // Update banner configuration in the product
    selectedProduct.banner_config = {
      title: bannerTitle,
      description: bannerDescription,
      image_filename: `banner_${selectedProductId}_${Date.now()}.${bannerImageFile.name.split('.').pop()}`
    };

    // Update the JSON file
    const updateResponse = await fetch('productos.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (updateResponse.ok) {
      alert('Configuración de banner actualizada exitosamente.');
      // Reset form
      document.getElementById('banner-configuration-form').reset();
      document.getElementById('banner-image-preview').classList.add('hidden');
    } else {
      alert('Error al actualizar la configuración del banner.');
    }
  } catch (err) {
    console.error("Error updating banner configuration:", err);
    alert('Error al actualizar la configuración del banner.');
  }
}